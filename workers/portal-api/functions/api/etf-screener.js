import { fetchManyCharts, metricsFromPoints, yahooSymbol } from "../_lib/market-data.js";

const FUNDS = {
  us: [
    ["VOO", "Vanguard S&P 500 ETF", "宽基", 0.03], ["QQQ", "Invesco QQQ Trust", "科技宽基", 0.2],
    ["SMH", "VanEck Semiconductor ETF", "半导体", 0.35], ["XLK", "Technology Select Sector SPDR", "科技", 0.08],
    ["JEPI", "JPMorgan Equity Premium Income ETF", "Income", 0.35], ["JEPQ", "JPMorgan Nasdaq Equity Premium Income ETF", "Income", 0.35],
    ["TLT", "iShares 20+ Year Treasury Bond ETF", "债券", 0.15], ["BIL", "SPDR 1-3 Month T-Bill ETF", "短债", 0.14],
    ["GLD", "SPDR Gold Shares", "黄金", 0.4], ["VNQ", "Vanguard Real Estate ETF", "REITs", 0.13],
    ["SCHD", "Schwab U.S. Dividend Equity ETF", "红利", 0.06], ["IWM", "iShares Russell 2000 ETF", "小盘", 0.19]
  ],
  cn: [
    ["510300", "沪深300ETF", "宽基", 0.15], ["510500", "中证500ETF", "宽基", 0.15],
    ["512100", "中证1000ETF", "宽基", 0.2], ["588000", "科创50ETF", "科创", 0.15],
    ["512760", "芯片ETF", "半导体", 0.5], ["512480", "半导体ETF", "半导体", 0.5],
    ["515220", "煤炭ETF", "资源", 0.5], ["518880", "黄金ETF", "黄金", 0.5],
    ["510880", "红利ETF", "红利", 0.5], ["512660", "军工ETF", "军工", 0.5],
    ["512010", "医药ETF", "医药", 0.5], ["159915", "创业板ETF", "成长", 0.5]
  ]
};

export async function onRequestGet({ request }) {
  const market = new URL(request.url).searchParams.get("market") === "cn" ? "cn" : "us";
  const configs = FUNDS[market];
  try {
    const charts = await fetchManyCharts(configs.map(([symbol]) => symbol), { range: "1y", minPoints: 121 });
    const items = configs.map(([symbol, name, category, fee]) => {
      const chart = charts.get(yahooSymbol(symbol));
      if (!chart?.points) return { ok: false, symbol, name, category, fee, error: chart?.error || "行情不可用" };
      const metrics = metricsFromPoints(chart.points);
      return { ok: true, symbol, name, category, fee, currency: chart.currency, price: metrics.price, returns: metrics.returns, volatility20: metrics.annualizedVolatility20, sourceDate: new Date(metrics.latestTs * 1000).toISOString().slice(0, 10), source: chart.source };
    });
    return Response.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      feeNote: "费率为产品公开管理费率参考；收益和20日波动均由复权日线计算。",
      items
    }, { headers: { "Cache-Control": "public, max-age=120, s-maxage=900" } });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Unable to screen ETFs" }, { status: 502 });
  }
}
