import { alignCharts, fetchManyCharts, maxDrawdown, metricsFromPoints, movingAverage, round, rsi, standardDeviation, yahooSymbol } from "../_lib/market-data.js";
import { buildValueStrategyPayload } from "../_lib/value-strategy.js";

const UNIVERSES = {
  us: [
    ["VOO", "标普500"], ["QQQ", "纳斯达克100"], ["SMH", "半导体"],
    ["XLK", "科技"], ["TLT", "长期美债"], ["GLD", "黄金"]
  ],
  a: [
    ["510300", "沪深300ETF"], ["510500", "中证500ETF"],
    ["512100", "中证1000ETF"], ["588000", "科创50ETF"]
  ]
};

const TITLES = {
  trend: "双均线趋势", technical: "ETF技术策略", portfolio: "自定义组合", enhanced: "强势轮动",
  asset: "股债轮动", riskAdjusted: "低波动动量", defensive: "防守开关", rsi: "RSI反弹",
  monthly: "月度轮动", allWeather: "全天候组合", value: "美股多因子价值"
};

function clamp(value, fallback, min, max) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function parsePortfolio(value, market) {
  const fallback = market === "a" ? "510300:40,510500:30,512100:30" : "VOO:40,QQQ:30,TLT:20,GLD:10";
  const rows = String(value || fallback).split(/[,，；;\n]/).map((part) => part.trim()).filter(Boolean).map((part) => {
    const [symbol, weight] = part.split(/[:：\s]+/).filter(Boolean);
    return { symbol: yahooSymbol(symbol), weight: Number(weight) };
  }).filter((row) => row.symbol && Number.isFinite(row.weight) && row.weight > 0).slice(0, 10);
  const total = rows.reduce((sum, row) => sum + row.weight, 0) || 1;
  return rows.map((row) => ({ ...row, weight: row.weight / total }));
}

function pastReturn(values, index, sessions) {
  if (index < sessions || !values[index - sessions]) return null;
  return ((values[index] / values[index - sessions]) - 1) * 100;
}

function volatility(values, index, sessions = 20) {
  if (index < sessions) return null;
  const returns = [];
  for (let cursor = index - sessions + 1; cursor <= index; cursor += 1) returns.push((values[cursor] / values[cursor - 1]) - 1);
  return (standardDeviation(returns) || 0) * Math.sqrt(252) * 100;
}

function normalizeWeights(entries) {
  const valid = entries.filter((entry) => Number.isFinite(entry.weight) && entry.weight > 0);
  const total = valid.reduce((sum, entry) => sum + entry.weight, 0);
  return total > 0 ? new Map(valid.map((entry) => [entry.symbol, entry.weight / total])) : new Map();
}

function selectWeights(strategy, symbols, valuesBySymbol, index, lookback, topN, portfolio, previous, date, previousDate) {
  if (strategy === "portfolio" || strategy === "allWeather") return normalizeWeights(portfolio);
  const scored = symbols.map((symbol) => {
    const values = valuesBySymbol.get(symbol);
    const momentum = pastReturn(values, index, lookback);
    const vol = volatility(values, index, 20);
    const ma20 = movingAverage(values, 20, index);
    const ma60 = movingAverage(values, 60, index);
    const current = values[index];
    const rsi14 = rsi(values, 14, index);
    let score = momentum ?? -Infinity;
    if (strategy === "riskAdjusted") score = Number.isFinite(momentum) && vol > 0 ? momentum / vol : -Infinity;
    if (strategy === "rsi") score = Number.isFinite(rsi14) ? (50 - Math.abs(rsi14 - 42)) : -Infinity;
    if (strategy === "technical") score = (current > ma20 ? 5 : -5) + (ma20 > ma60 ? 5 : -5) + (momentum || 0);
    return { symbol, score, momentum, vol, trend: current > ma20 && ma20 > ma60, rsi14 };
  }).sort((a, b) => b.score - a.score);

  if (strategy === "monthly" && previous?.size && date.slice(0, 7) === previousDate?.slice(0, 7)) return previous;
  if (strategy === "trend" || strategy === "defensive") {
    const primary = scored.find((item) => item.symbol === symbols[0]) || scored[0];
    return primary?.trend ? new Map([[primary.symbol, 1]]) : new Map();
  }
  const selected = scored.filter((item) => Number.isFinite(item.score) && item.momentum > 0 && (strategy !== "rsi" || item.rsi14 < 55)).slice(0, topN);
  return normalizeWeights(selected.map((item) => ({ symbol: item.symbol, weight: strategy === "riskAdjusted" ? 1 / Math.max(item.vol || 1, 1) : 1 })));
}

function runBacktest({ dates, series, symbols, benchmark, strategy, lookback, topN, portfolio, sampleDays }) {
  const valuesBySymbol = new Map(symbols.map((symbol) => [symbol, series.get(symbol).map((row) => row.value)]));
  const benchmarkValues = series.get(benchmark).map((row) => row.value);
  const warmup = Math.max(65, lookback + 2);
  const startIndex = Math.max(warmup, dates.length - sampleDays);
  let strategyChart = 100;
  let benchmarkChart = 100;
  let weights = new Map();
  let switchCount = 0;
  const history = [];

  for (let index = startIndex; index < dates.length; index += 1) {
    const signalIndex = index - 1;
    const nextWeights = selectWeights(strategy, symbols, valuesBySymbol, signalIndex, lookback, topN, portfolio, weights, dates[signalIndex], dates[signalIndex - 1]);
    const turnoverSymbols = new Set([...weights.keys(), ...nextWeights.keys()]);
    const turnover = [...turnoverSymbols].reduce((sum, symbol) => sum + Math.abs((nextWeights.get(symbol) || 0) - (weights.get(symbol) || 0)), 0) / 2;
    if (turnover > 0.01) switchCount += 1;
    let dayReturn = 0;
    nextWeights.forEach((weight, symbol) => {
      const values = valuesBySymbol.get(symbol);
      dayReturn += weight * ((values[index] / values[index - 1]) - 1);
    });
    dayReturn -= turnover * 0.001;
    const benchmarkReturn = (benchmarkValues[index] / benchmarkValues[index - 1]) - 1;
    strategyChart *= 1 + dayReturn;
    benchmarkChart *= 1 + benchmarkReturn;
    weights = nextWeights;
    const holdingSymbols = [...weights.keys()];
    history.push({
      date: dates[index],
      signalDate: dates[signalIndex],
      holding: holdingSymbols.join(" / ") || "现金",
      holdingName: holdingSymbols.join(" / ") || "现金",
      signal: holdingSymbols.length ? "Risk On" : "Risk Off",
      scorePct: round(pastReturn(valuesBySymbol.get(holdingSymbols[0]) || benchmarkValues, signalIndex, lookback)),
      dayReturnPct: round(dayReturn * 100),
      strategyChart: round(strategyChart, 4),
      benchmarkChart: round(benchmarkChart, 4)
    });
  }
  const totalReturnPct = history.length ? round((history.at(-1).strategyChart / 100 - 1) * 100) : null;
  const benchmarkReturnPct = history.length ? round((history.at(-1).benchmarkChart / 100 - 1) * 100) : null;
  const daily = history.map((row) => row.dayReturnPct).filter(Number.isFinite);
  return {
    history,
    weights,
    totalReturnPct,
    benchmarkReturnPct,
    maxDrawdownPct: maxDrawdown(history.map((row) => row.strategyChart)),
    winRatePct: daily.length ? round(daily.filter((value) => value > 0).length / daily.length * 100) : null,
    switchCount
  };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const market = url.searchParams.get("market") === "a" ? "a" : "us";
  const strategy = TITLES[url.searchParams.get("strategy")] ? url.searchParams.get("strategy") : "trend";
  if (strategy === "value") {
    if (market !== "us") {
      return Response.json({ ok: false, error: "美股多因子价值策略仅支持美股股票池" }, { status: 400 });
    }
    const payload = await buildValueStrategyPayload(env, {
      universe: url.searchParams.get("universe"),
      rebalance: url.searchParams.get("rebalance")
    });
    return Response.json(payload, { headers: { "Cache-Control": "public, max-age=120, s-maxage=900" } });
  }
  const days = clamp(url.searchParams.get("days"), 260, 40, 520);
  const lookback = clamp(url.searchParams.get("lookback"), 60, 5, 240);
  const topN = clamp(url.searchParams.get("topN"), 2, 1, 5);
  const requestedPortfolio = parsePortfolio(url.searchParams.get("portfolio"), market);
  const universe = UNIVERSES[market];
  const benchmark = yahooSymbol(universe[0][0]);
  const allSymbols = [...new Set([...universe.map(([symbol]) => yahooSymbol(symbol)), ...requestedPortfolio.map((row) => row.symbol)])];

  try {
    const chartMap = await fetchManyCharts(allSymbols, { range: "5y", minPoints: 180 });
    const charts = allSymbols.map((symbol) => chartMap.get(symbol)).filter((chart) => chart?.points);
    if (!charts.find((chart) => chart.symbol === benchmark) || charts.length < 2) throw new Error("可用行情不足，无法执行回测");
    const aligned = alignCharts(charts, "adjusted");
    const availableSymbols = charts.map((chart) => chart.symbol).filter((symbol) => aligned.series.get(symbol)?.length === aligned.dates.length);
    const portfolio = (strategy === "allWeather" && !url.searchParams.get("portfolio"))
      ? parsePortfolio(market === "a" ? "510300:40,510500:25,512100:20,588000:15" : "VOO:30,QQQ:20,TLT:30,GLD:20", market)
      : requestedPortfolio.filter((row) => availableSymbols.includes(row.symbol));
    const result = runBacktest({ dates: aligned.dates, series: aligned.series, symbols: availableSymbols, benchmark, strategy, lookback, topN, portfolio, sampleDays: days });
    if (!result.history.length) throw new Error("历史长度不足，无法执行回测");

    const nameMap = new Map(universe.map(([symbol, name]) => [yahooSymbol(symbol), name]));
    const sectorRanking = charts.map((chart) => {
      const metrics = metricsFromPoints(chart.points);
      return {
        symbol: chart.symbol,
        name: nameMap.get(chart.symbol) || chart.name,
        source: `https://finance.yahoo.com/quote/${chart.symbol}`,
        selected: result.weights.has(chart.symbol),
        qualified: (metrics.returns.d20 || 0) > 0,
        momentumPct: metrics.returns.d60,
        d1: metrics.returns.d1,
        d20: metrics.returns.d20,
        d60: metrics.returns.d60,
        d120: metrics.returns.d120,
        trendOk: metrics.price > metrics.ma20,
        volatilityPct: metrics.annualizedVolatility20
      };
    }).sort((a, b) => (b.momentumPct ?? -Infinity) - (a.momentumPct ?? -Infinity)).map((row, index) => ({ ...row, rank: index + 1 }));

    const variants = [...new Set([Math.max(5, Math.round(lookback / 2)), lookback, Math.min(240, Math.round(lookback * 1.5)), 20, 120])];
    const optimizationItems = variants.map((variant) => {
      const trial = runBacktest({ dates: aligned.dates, series: aligned.series, symbols: availableSymbols, benchmark, strategy, lookback: variant, topN, portfolio, sampleDays: days });
      return {
        label: `${TITLES[strategy]} / ${variant}日`, type: "真实日线回测", totalReturnPct: trial.totalReturnPct,
        benchmarkReturnPct: trial.benchmarkReturnPct, maxDrawdownPct: trial.maxDrawdownPct,
        returnDrawdownRatio: trial.maxDrawdownPct ? round(trial.totalReturnPct / Math.abs(trial.maxDrawdownPct)) : null,
        winRatePct: trial.winRatePct, switchCount: trial.switchCount,
        currentHolding: [...trial.weights.keys()].join(" / ") || "现金"
      };
    }).sort((a, b) => (b.returnDrawdownRatio ?? -Infinity) - (a.returnDrawdownRatio ?? -Infinity)).map((row, index) => ({ ...row, rank: index + 1 }));

    const history = result.history;
    return Response.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      title: TITLES[strategy],
      rule: `${market === "a" ? "A股" : "美股"}复权日线；信号使用前一交易日数据，下一交易日执行；换仓成本0.10%。`,
      marketLabel: market === "a" ? "A股" : "美股",
      benchmarkName: nameMap.get(benchmark) || benchmark,
      currentHolding: [...result.weights.keys()].map((symbol) => nameMap.get(symbol) || symbol).join(" / ") || "现金",
      startDate: history[0].date,
      endDate: history.at(-1).date,
      rankingDate: history.at(-1).date,
      stats: { ...result, history: undefined, weights: undefined, sampleDays: history.length },
      history,
      recent: history.slice(-12).reverse(),
      sectorRanking,
      optimization: { note: "所有参数组均使用同一真实复权日线和相同交易成本。", items: optimizationItems },
      allocation: portfolio.map((row) => ({ symbol: row.symbol, name: nameMap.get(row.symbol) || row.symbol, weightPct: round(row.weight * 100), source: `https://finance.yahoo.com/quote/${row.symbol}` }))
    }, { headers: { "Cache-Control": "public, max-age=120, s-maxage=900" } });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Unable to run strategy" }, {
      status: 502,
      headers: { "Cache-Control": "public, max-age=30, s-maxage=60" }
    });
  }
}
