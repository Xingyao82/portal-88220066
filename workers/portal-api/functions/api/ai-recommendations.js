import { fetchManyCharts } from "../_lib/market-data.js";
import { publishRotationSignal, readRotationHistory } from "../_lib/rotation-history.js";
import { buildRotationStrategy } from "../_lib/rotation-strategy.js";

const SECTORS = [
  { symbol: "XLK", name: "科技板块", type: "科技" },
  { symbol: "SMH", name: "半导体板块", type: "半导体" },
  { symbol: "XLC", name: "通信服务板块", type: "通信服务" },
  { symbol: "XLY", name: "可选消费板块", type: "可选消费" },
  { symbol: "XLI", name: "工业板块", type: "工业" },
  { symbol: "XLF", name: "金融板块", type: "金融" },
  { symbol: "XLE", name: "能源板块", type: "能源" },
  { symbol: "XLV", name: "医疗板块", type: "医疗" },
  { symbol: "XLP", name: "必选消费板块", type: "必选消费" },
  { symbol: "XLU", name: "公用事业板块", type: "公用事业" },
  { symbol: "XLRE", name: "房地产板块", type: "房地产" },
  { symbol: "BIL", name: "1-3月美国国债", type: "债券" },
  { symbol: "SHY", name: "1-3年美国国债", type: "债券" },
  { symbol: "IEF", name: "7-10年美国国债", type: "债券" },
  { symbol: "TLT", name: "20年以上美国国债", type: "债券" },
  { symbol: "LQD", name: "投资级公司债", type: "债券" },
  { symbol: "HYG", name: "高收益公司债", type: "债券" }
];
const BENCHMARK = { symbol: "SPY", name: "标普500", type: "基准" };
const DEFENSE = { symbol: "BIL", name: "1-3月美国国债", type: "防守资产" };

export async function onRequestGet({ request, env }) {
  const recordRequested = new URL(request.url).searchParams.get("record") === "cron";
  if (recordRequested && (!env.ROTATION_RECORD_TOKEN || request.headers.get("Authorization") !== `Bearer ${env.ROTATION_RECORD_TOKEN}`)) {
    return Response.json({ ok: false, error: "Unauthorized recorder" }, { status: 401 });
  }
  try {
    const configs = [...SECTORS, BENCHMARK, DEFENSE];
    const charts = await fetchManyCharts(configs.map((item) => item.symbol), { range: "5y", minPoints: 180, concurrency: 6 });
    const item = (config) => {
      const chart = charts.get(config.symbol);
      return chart?.points ? { config, chart } : null;
    };
    const candidates = SECTORS.map(item).filter(Boolean);
    const benchmark = item(BENCHMARK);
    const defense = item(DEFENSE);
    if (candidates.length < 8 || !benchmark) throw new Error("美股板块行情不足，暂不生成轮动信号");

    const rotation = buildRotationStrategy({ candidates, benchmark, defense, costRate: 0.001 });
    rotation.ranking = rotation.ranking.map((row) => ({ ...row, source: `https://finance.yahoo.com/quote/${row.symbol}` }));
    const mainHolding = rotation.current.holdings.find((holding) => holding.symbol !== "CASH");
    const ranked = rotation.ranking.find((row) => row.symbol === mainHolding?.symbol) || rotation.ranking[0];
    const pick = mainHolding ? {
      ...ranked,
      name: mainHolding.name,
      type: rotation.current.action,
      price: candidates.find((entry) => entry.chart.symbol === mainHolding.symbol)?.chart.points.at(-1)?.close || null,
      qualified: true,
      reasons: [
        `下一交易日目标权重 ${mainHolding.weightPct}%`,
        `信号日 ${rotation.current.signalDate}，下一交易日开盘调仓`,
        "按复权后20日涨幅每日重新排名"
      ]
    } : {
      symbol: "CASH",
      name: rotation.current.holdings.map((holding) => holding.name).join(" + ") || "现金",
      type: rotation.current.riskState,
      price: null,
      score: null,
      qualified: false,
      returns: {},
      volatility20: null,
      drawdown60: null,
      reasons: ["共同交易日不足，未形成两个有效候选"]
    };

    const payload = {
      ok: true,
      strategyKey: "us-daily-20d-momentum-v3-open",
      mode: "daily-20d-momentum",
      strategyName: "美股20日涨幅每日轮动",
      executionPrice: "next-session-open",
      methodology: "每个交易日收盘后按复权收盘价计算20日涨幅；全部股票板块与债券ETF统一排名；前两名各50%，下一交易日开盘调仓",
      rules: ["只使用信号日收盘时已经形成的复权数据", "按20个共同交易日前至信号日的复权涨幅从高到低排名", "股票板块与债券ETF使用同一排名规则", "前两名各50%", "信号日收盘后决定，下一交易日开盘价调仓", "每次换手按0.10%成本计入回测"],
      updatedAt: new Date().toISOString(),
      sourceDate: rotation.sourceDate,
      benchmark: BENCHMARK,
      defense: DEFENSE,
      current: rotation.current,
      stats: rotation.stats,
      periodStats: rotation.periodStats,
      pick,
      ranking: rotation.ranking,
      history: rotation.reviews,
      curve: rotation.curve,
      backtestNote: "长期回测使用当前仍存续的ETF作为固定候选池，存在幸存者偏差；行情来自Yahoo复权日线，已计0.10%换手成本，未单独计入买卖价差、税费与市场冲击。",
      disclaimer: "这是透明规则型板块轮动，不是对单只股票的AI预测，也不构成投资建议。"
    };
    let publishedHistory = [];
    let recording = { ok: Boolean(env.NEWS_DB?.prepare), inserted: false, scheduledOnly: !recordRequested, immutable: true };
    if (recordRequested) {
      const published = await publishRotationSignal(env.NEWS_DB, { ...payload, market: "us" });
      publishedHistory = published.history;
      recording = { ...published };
      delete recording.history;
    } else {
      try { publishedHistory = await readRotationHistory(env.NEWS_DB, payload.strategyKey, 30); } catch (error) { recording = { ...recording, ok: false, error: error instanceof Error ? error.message : "D1读取失败" }; }
    }
    return Response.json({ ...payload, recording, publishedHistory }, { headers: { "Cache-Control": recordRequested ? "no-store" : "public, max-age=120, s-maxage=900" } });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Unable to load U.S. sector rotation" }, {
      status: 502,
      headers: { "Cache-Control": "public, max-age=30, s-maxage=60" }
    });
  }
}
