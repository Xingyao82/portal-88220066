import { displaySymbol, fetchManyCharts, yahooSymbol } from "../_lib/market-data.js";
import { publishRotationSignal, readRotationHistory } from "../_lib/rotation-history.js";
import { buildRotationStrategy } from "../_lib/rotation-strategy.js";

const SECTORS = [
  { symbol: "512760", name: "芯片ETF", type: "半导体" },
  { symbol: "515230", name: "软件ETF", type: "软件/AI" },
  { symbol: "159819", name: "人工智能ETF", type: "人工智能" },
  { symbol: "588000", name: "科创50ETF", type: "科创成长" },
  { symbol: "512660", name: "军工ETF", type: "军工" },
  { symbol: "515220", name: "煤炭ETF", type: "资源" },
  { symbol: "512880", name: "证券ETF", type: "证券" },
  { symbol: "512170", name: "医疗ETF", type: "医疗" },
  { symbol: "512690", name: "酒ETF", type: "消费" },
  { symbol: "510880", name: "红利ETF", type: "红利" },
  { symbol: "518880", name: "黄金ETF", type: "黄金" },
  { symbol: "159985", name: "豆粕ETF", type: "商品" },
  { symbol: "513100", name: "纳指ETF", type: "境外/美股" },
  { symbol: "513500", name: "标普500ETF", type: "境外/美股" },
  { symbol: "511010", name: "国债ETF", type: "债券" },
  { symbol: "511260", name: "十年国债ETF", type: "债券" },
  { symbol: "511880", name: "银华日利", type: "债券/现金管理" }
];
const BENCHMARK = { symbol: "510300", name: "沪深300ETF", type: "基准" };
const DEFENSE = { symbol: "511010", name: "国债ETF", type: "防守资产" };

function cleanSymbol(symbol) {
  return symbol === "CASH" ? symbol : displaySymbol(symbol);
}

export async function onRequestGet({ request, env }) {
  const recordRequested = new URL(request.url).searchParams.get("record") === "cron";
  if (recordRequested && (!env.ROTATION_RECORD_TOKEN || request.headers.get("Authorization") !== `Bearer ${env.ROTATION_RECORD_TOKEN}`)) {
    return Response.json({ ok: false, error: "Unauthorized recorder" }, { status: 401 });
  }
  try {
    const configs = [...SECTORS, BENCHMARK, DEFENSE];
    const charts = await fetchManyCharts(configs.map((item) => item.symbol), { range: "5y", minPoints: 180, concurrency: 6 });
    const item = (config) => {
      const chart = charts.get(yahooSymbol(config.symbol));
      return chart?.points ? { config, chart } : null;
    };
    const candidates = SECTORS.map(item).filter(Boolean);
    const benchmark = item(BENCHMARK);
    const defense = item(DEFENSE);
    if (candidates.length < 8 || !benchmark) throw new Error("A股板块 ETF 行情不足，暂不生成轮动信号");

    const rotation = buildRotationStrategy({ candidates, benchmark, defense, costRate: 0.001 });
    rotation.ranking = rotation.ranking.map((row) => ({ ...row, symbol: cleanSymbol(row.symbol), source: `https://quote.eastmoney.com/${cleanSymbol(row.symbol).startsWith("5") ? "sh" : "sz"}${cleanSymbol(row.symbol)}.html` }));
    rotation.current.holdings = rotation.current.holdings.map((holding) => ({ ...holding, symbol: cleanSymbol(holding.symbol) }));
    rotation.current.entered = rotation.current.entered.map(cleanSymbol);
    rotation.current.exited = rotation.current.exited.map(cleanSymbol);
    rotation.reviews = rotation.reviews.map((review) => ({ ...review, entered: review.entered.map(cleanSymbol), exited: review.exited.map(cleanSymbol) }));

    const mainHolding = rotation.current.holdings.find((holding) => holding.symbol !== "CASH");
    const ranked = rotation.ranking.find((row) => row.symbol === mainHolding?.symbol) || rotation.ranking[0];
    const pick = mainHolding ? {
      ...ranked,
      name: mainHolding.name,
      type: rotation.current.action,
      price: candidates.find((entry) => displaySymbol(entry.chart.symbol) === mainHolding.symbol)?.chart.points.at(-1)?.close || null,
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
      strategyKey: "cn-listed-etf-daily-20d-momentum-v3-open",
      mode: "daily-20d-momentum",
      strategyName: "A股可交易ETF 20日涨幅每日轮动",
      executionPrice: "next-session-open",
      methodology: "每个交易日收盘后按复权收盘价计算20日涨幅；全部境内上市行业、商品、境外与债券ETF统一排名；前两名各50%，下一交易日开盘调仓",
      rules: ["只使用信号日收盘时已经形成的复权数据", "按20个共同交易日前至信号日的复权涨幅从高到低排名", "行业、商品、境外与债券ETF使用同一排名规则", "前两名各50%", "信号日收盘后决定，下一交易日开盘价调仓", "每次换手按0.10%成本计入回测"],
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
      backtestNote: "长期回测使用当前仍存续的ETF作为固定候选池，存在幸存者偏差；行情来自Yahoo复权日线，已计0.10%换手成本，未单独计入买卖价差、税费、冲击成本与跨境ETF折溢价。",
      disclaimer: "使用境内上市ETF自身复权日线生成透明轮动信号；跨境ETF收益包含人民币汇率与场内折溢价，商品ETF也可能存在期货展期影响，不构成投资建议。"
    };
    let publishedHistory = [];
    let recording = { ok: Boolean(env.NEWS_DB?.prepare), inserted: false, scheduledOnly: !recordRequested, immutable: true };
    if (recordRequested) {
      const published = await publishRotationSignal(env.NEWS_DB, { ...payload, market: "cn" });
      publishedHistory = published.history;
      recording = { ...published };
      delete recording.history;
    } else {
      try { publishedHistory = await readRotationHistory(env.NEWS_DB, payload.strategyKey, 30); } catch (error) { recording = { ...recording, ok: false, error: error instanceof Error ? error.message : "D1读取失败" }; }
    }
    return Response.json({ ...payload, recording, publishedHistory }, { headers: { "Cache-Control": recordRequested ? "no-store" : "public, max-age=120, s-maxage=900" } });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Unable to load A-share sector rotation" }, {
      status: 502,
      headers: { "Cache-Control": "public, max-age=30, s-maxage=60" }
    });
  }
}
