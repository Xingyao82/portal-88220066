import { fetchManyCharts, metricsFromPoints, yahooSymbol } from "../_lib/market-data.js";

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const symbols = [...new Set((url.searchParams.get("symbols") || "").split(",").map((value) => value.trim().toUpperCase()).filter(Boolean))].slice(0, 30);
  if (!symbols.length) return Response.json({ ok: false, error: "Missing symbols" }, { status: 400 });
  const charts = await fetchManyCharts(symbols, { range: "5d", minPoints: 1, concurrency: 8 });
  const items = symbols.map((symbol) => {
    const chart = charts.get(yahooSymbol(symbol));
    if (!chart?.points) return { ok: false, symbol, error: chart?.error || "行情不可用" };
    const metrics = metricsFromPoints(chart.points) || {};
    const last = chart.points.at(-1);
    return {
      ok: true,
      symbol,
      normalizedSymbol: chart.symbol,
      name: chart.name,
      currency: chart.currency,
      price: metrics.price ?? last.close,
      change1d: metrics.returns?.d1 ?? null,
      sourceDate: new Date(last.ts * 1000).toISOString().slice(0, 10),
      source: chart.source
    };
  });
  return Response.json({ ok: true, updatedAt: new Date().toISOString(), items }, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300" }
  });
}
