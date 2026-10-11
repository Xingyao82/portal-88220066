import { fetchYahooChart, maxDrawdown, returnPct, round } from "../_lib/market-data.js";

function riskLevel(score) {
  if (score >= 65) return "高";
  if (score >= 35) return "中";
  return "低";
}

export async function onRequestGet({ request }) {
  const symbol = (new URL(request.url).searchParams.get("symbol") || "").trim().toUpperCase();
  if (!symbol) return Response.json({ ok: false, error: "Missing symbol" }, { status: 400 });
  try {
    const chart = await fetchYahooChart(symbol, { range: "1y", minPoints: 20, cacheTtl: 900 });
    const first = chart.points[0];
    const last = chart.points.at(-1);
    const priceReturn = returnPct(last.close, first.close);
    const totalReturn = returnPct(last.adjusted, first.adjusted);
    const incomeContribution = Number.isFinite(totalReturn) && Number.isFinite(priceReturn) ? round(totalReturn - priceReturn) : null;
    const drawdown = maxDrawdown(chart.points.map((point) => point.close));
    const erosionGap = Number.isFinite(totalReturn) && Number.isFinite(priceReturn) ? Math.max(0, totalReturn - priceReturn) : 0;
    const pricePenalty = Math.max(0, -(priceReturn || 0)) * 2.2;
    const drawdownPenalty = Math.max(0, -((drawdown || 0) + 10)) * 0.8;
    const incomePenalty = erosionGap > 15 && priceReturn < 0 ? (erosionGap - 15) * 0.8 : 0;
    const riskScore = round(Math.max(0, Math.min(100, pricePenalty + drawdownPenalty + incomePenalty)), 1);
    const level = riskLevel(riskScore);
    const flags = [];
    if (priceReturn < -10) flags.push("近一年价格跌幅超过10%");
    if (drawdown < -20) flags.push("近一年最大回撤超过20%");
    if (erosionGap > 15 && priceReturn < 0) flags.push("分配贡献较高但价格回报为负，需警惕本金侵蚀");
    return Response.json({
      ok: true,
      methodology: "近一年真实不复权价格回报、复权总回报和最大回撤；风险分仅由页面公开的三项规则计算。",
      result: {
        symbol,
        priceStart: round(first.close),
        priceLast: round(last.close),
        priceReturn,
        distributionYieldOnStart: incomeContribution,
        totalReturnApprox: totalReturn,
        maxDrawdownFromYearHigh: drawdown,
        dividendTotal: null,
        dividendCount: null,
        riskScore,
        riskLevel: level,
        flags,
        singleStockCoveredCall: false,
        incomeLike: erosionGap > 3,
        suitableLongTerm: level === "高" ? "资本侵蚀风险较高，需要进一步核对分配来源" : level === "中" ? "风险中等，需结合更长周期总回报" : "暂未发现高风险信号，仍需持续观察",
        conclusion: flags[0] || "近一年价格与复权总回报未触发明显资本侵蚀规则。",
        sourceDate: new Date(last.ts * 1000).toISOString().slice(0, 10),
        source: chart.source
      }
    }, { headers: { "Cache-Control": "public, max-age=120, s-maxage=900" } });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Unable to inspect capital erosion" }, { status: 502 });
  }
}
