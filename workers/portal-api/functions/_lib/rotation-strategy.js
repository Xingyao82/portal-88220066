import { alignCharts, round, standardDeviation } from "./market-data.js";

const CASH = "CASH";

function pct(now, past) {
  return Number.isFinite(now) && Number.isFinite(past) && past > 0 ? ((now / past) - 1) * 100 : null;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function drawdown(values) {
  let peak = null;
  let worst = 0;
  for (const value of values) {
    peak = peak === null ? value : Math.max(peak, value);
    worst = Math.min(worst, ((value / peak) - 1) * 100);
  }
  return worst;
}

function metricAt(values, index) {
  if (index < 20) return null;
  const value = values[index];
  const daily = values.slice(index - 20, index + 1).slice(1).map((item, offset) => (item / values[index - 20 + offset]) - 1);
  const annualizedVolatility20 = (standardDeviation(daily) || 0) * Math.sqrt(252) * 100;
  const d20 = pct(value, values[index - 20]);
  const d60 = index >= 60 ? pct(value, values[index - 60]) : null;
  const d120 = index >= 120 ? pct(value, values[index - 120]) : null;
  const ma60 = index >= 59 ? average(values.slice(index - 59, index + 1)) : null;
  const drawdown60 = drawdown(values.slice(Math.max(0, index - 60), index + 1));
  return {
    d1: pct(value, values[index - 1]),
    d5: pct(value, values[index - 5]),
    d20,
    d60,
    d120,
    ma60,
    annualizedVolatility20,
    drawdown60,
    score: d20,
    qualified: Number.isFinite(d20)
  };
}

function sameAllocation(left, right) {
  const symbols = new Set([...left.keys(), ...right.keys()]);
  return [...symbols].every((symbol) => Math.abs((left.get(symbol) || 0) - (right.get(symbol) || 0)) < 0.0001);
}

function allocationTurnover(previous, next) {
  const symbols = new Set([...previous.keys(), ...next.keys(), CASH]);
  const previousCash = Math.max(0, 1 - [...previous.values()].reduce((sum, value) => sum + value, 0));
  const nextCash = Math.max(0, 1 - [...next.values()].reduce((sum, value) => sum + value, 0));
  let gross = 0;
  for (const symbol of symbols) {
    gross += Math.abs((symbol === CASH ? previousCash : previous.get(symbol) || 0) - (symbol === CASH ? nextCash : next.get(symbol) || 0));
  }
  return gross / 2;
}

function evolveAllocation(previous, ratioForSymbol) {
  const cashWeight = Math.max(0, 1 - [...previous.values()].reduce((sum, value) => sum + value, 0));
  let portfolioFactor = cashWeight;
  const contributions = new Map();
  for (const [symbol, weight] of previous) {
    const ratio = ratioForSymbol(symbol);
    const contribution = Number.isFinite(ratio) && ratio > 0 ? weight * ratio : weight;
    contributions.set(symbol, contribution);
    portfolioFactor += contribution;
  }
  const allocation = new Map();
  if (portfolioFactor > 0) {
    for (const [symbol, contribution] of contributions) {
      allocation.set(symbol, contribution / portfolioFactor);
    }
  }
  return { allocation, portfolioFactor };
}

export function buildRotationStrategy({ candidates, benchmark, defense, costRate = 0.001, curvePoints = 1260 }) {
  const allCharts = [...candidates.map((item) => item.chart), benchmark.chart, ...(defense?.chart ? [defense.chart] : [])];
  const uniqueCharts = [...new Map(allCharts.map((chart) => [chart.symbol, chart])).values()];
  const aligned = alignCharts(uniqueCharts, "adjusted");
  if (aligned.dates.length < 60) throw new Error("共同交易日不足，无法生成20日涨幅每日轮动");

  const valuesBySymbol = new Map([...aligned.series].map(([symbol, rows]) => [symbol, rows.map((row) => row.value)]));
  const opensBySymbol = new Map([...aligned.series].map(([symbol, rows]) => [symbol, rows.map((row) => row.open)]));
  const configBySymbol = new Map([...candidates, benchmark, ...(defense ? [defense] : [])].map((item) => [item.chart.symbol, item.config]));
  const startIndex = 20;

  const rankingAt = (index) => candidates.map((item) => {
    const metric = metricAt(valuesBySymbol.get(item.chart.symbol), index);
    return { ...item.config, symbol: item.chart.symbol, ...metric };
  }).filter((item) => item.score !== null).sort((left, right) => right.score - left.score);

  const allocationAt = (index) => {
    const ranking = rankingAt(index);
    const selected = ranking.slice(0, 2);
    const allocation = new Map();
    if (selected.length === 2) {
      allocation.set(selected[0].symbol, 0.5);
      allocation.set(selected[1].symbol, 0.5);
    }
    return { allocation, ranking };
  };

  let targetAllocation = new Map();
  let closeAllocation = new Map();
  let strategyValue = 100;
  const benchmarkValues = valuesBySymbol.get(benchmark.chart.symbol);
  const benchmarkBase = benchmarkValues[startIndex];
  const curve = [{ date: aligned.dates[startIndex], strategyChart: 100, benchmarkChart: 100 }];
  const reviews = [];

  for (let index = startIndex + 1; index < aligned.dates.length; index += 1) {
    const signalIndex = index - 1;
    const next = allocationAt(signalIndex);
    const overnight = evolveAllocation(closeAllocation, (symbol) => {
      const values = valuesBySymbol.get(symbol);
      const opens = opensBySymbol.get(symbol);
      return opens[index] / values[index - 1];
    });
    strategyValue *= overnight.portfolioFactor;
    const turnover = allocationTurnover(overnight.allocation, next.allocation);
    const changed = !sameAllocation(targetAllocation, next.allocation);
    const previousSymbols = [...targetAllocation.keys()];
    const nextSymbols = [...next.allocation.keys()];
    if (turnover > 0) {
      const cost = turnover * costRate;
      strategyValue *= 1 - cost;
    }
    const intraday = evolveAllocation(next.allocation, (symbol) => {
      const values = valuesBySymbol.get(symbol);
      const opens = opensBySymbol.get(symbol);
      return values[index] / opens[index];
    });
    strategyValue *= intraday.portfolioFactor;
    reviews.push({
      signalDate: aligned.dates[signalIndex],
      effectiveDate: `${aligned.dates[index]} 开盘`,
      action: changed ? "换仓" : "保持",
      entered: nextSymbols.filter((symbol) => !previousSymbols.includes(symbol)),
      exited: previousSymbols.filter((symbol) => !nextSymbols.includes(symbol)),
      allocation: Object.fromEntries(next.allocation),
      cashWeight: round((1 - [...next.allocation.values()].reduce((sum, value) => sum + value, 0)) * 100, 1),
      turnoverPct: round(turnover * 100, 1)
    });
    targetAllocation = next.allocation;
    closeAllocation = intraday.allocation;
    curve.push({
      date: aligned.dates[index],
      strategyChart: round(strategyValue, 4),
      benchmarkChart: round((benchmarkValues[index] / benchmarkBase) * 100, 4)
    });
  }

  const latestIndex = aligned.dates.length - 1;
  const latestRanking = rankingAt(latestIndex);
  const lastExecutedReview = reviews.at(-1);
  const pending = allocationAt(latestIndex);
  const pendingChanged = !sameAllocation(targetAllocation, pending.allocation);
  const pendingReview = {
    signalDate: aligned.dates.at(-1),
    effectiveDate: "下一交易日开盘",
    action: pendingChanged ? "换仓待执行" : "保持",
    entered: [...pending.allocation.keys()].filter((symbol) => !targetAllocation.has(symbol)),
    exited: [...targetAllocation.keys()].filter((symbol) => !pending.allocation.has(symbol)),
    allocation: Object.fromEntries(pending.allocation),
    cashWeight: round((1 - [...pending.allocation.values()].reduce((sum, value) => sum + value, 0)) * 100, 1),
    turnoverPct: round(allocationTurnover(targetAllocation, pending.allocation) * 100, 1),
    pending: true
  };
  const currentReview = pendingReview;
  const previousReview = lastExecutedReview;
  const currentAllocation = new Map(Object.entries(currentReview?.allocation || {}));
  const holdings = [...currentAllocation].map(([symbol, weight]) => ({
    symbol,
    name: configBySymbol.get(symbol)?.name || symbol,
    type: configBySymbol.get(symbol)?.type || (symbol === defense?.chart.symbol ? "防守资产" : "板块"),
    weightPct: round(weight * 100, 1),
    score: round(latestRanking.find((item) => item.symbol === symbol)?.score)
  }));
  const cashWeight = currentReview?.cashWeight || 0;
  if (cashWeight > 0) holdings.push({ symbol: CASH, name: "现金", type: "风险关闭", weightPct: cashWeight, score: null });

  const summarizeWindow = (limit) => {
    const windowCurve = curve.slice(-Math.max(2, Math.min(limit, curve.length)));
    const startDate = windowCurve[0].date;
    const endDate = windowCurve.at(-1).date;
    const baseStrategy = windowCurve[0].strategyChart;
    const baseBenchmark = windowCurve[0].benchmarkChart;
    const normalizedWindow = windowCurve.map((row) => ({
      date: row.date,
      strategyChart: round((row.strategyChart / baseStrategy) * 100, 4),
      benchmarkChart: round((row.benchmarkChart / baseBenchmark) * 100, 4)
    }));
    const windowReviews = reviews.filter((review) => review.signalDate >= startDate);
    const years = (new Date(`${endDate}T00:00:00Z`) - new Date(`${startDate}T00:00:00Z`)) / (365.25 * 86400000);
    const totalReturn = normalizedWindow.at(-1).strategyChart / 100;
    const benchmarkTotalReturn = normalizedWindow.at(-1).benchmarkChart / 100;
    return {
      startDate,
      endDate,
      sessions: windowCurve.length,
      years: round(years, 2),
      returnPct: round(normalizedWindow.at(-1).strategyChart - 100),
      benchmarkReturnPct: round(normalizedWindow.at(-1).benchmarkChart - 100),
      annualizedReturnPct: round(((totalReturn ** (1 / years)) - 1) * 100),
      benchmarkAnnualizedReturnPct: round(((benchmarkTotalReturn ** (1 / years)) - 1) * 100),
      maxDrawdownPct: round(drawdown(normalizedWindow.map((row) => row.strategyChart))),
      reviewCount: windowReviews.length,
      rotationCount: windowReviews.filter((review) => review.action !== "保持").length,
      cumulativeCostPct: round(windowReviews.reduce((sum, review) => sum + ((review.turnoverPct || 0) * costRate), 0)),
      curve: normalizedWindow
    };
  };
  const oneYear = summarizeWindow(252);
  const threeYear = summarizeWindow(756);
  const fiveYear = summarizeWindow(1260);
  const full = summarizeWindow(curve.length);
  const shown = summarizeWindow(curvePoints);
  const omitCurve = ({ curve: ignored, ...summary }) => summary;
  const currentSymbols = Object.keys(currentReview.allocation);
  const previousSymbols = Object.keys(previousReview?.allocation || {});
  const action = currentReview.action;
  const bondSymbols = new Set(candidates.filter((item) => /债|bond|treasury|cash/i.test(`${item.config.type} ${item.config.name}`)).map((item) => item.chart.symbol));
  const bondCount = currentSymbols.filter((symbol) => bondSymbols.has(symbol)).length;

  return {
    sourceDate: aligned.dates.at(-1),
    ranking: latestRanking.map((item) => ({
      ...item,
      score: round(item.score, 1),
      returns: { d1: round(item.d1), d5: round(item.d5), d20: round(item.d20), d60: round(item.d60), d120: round(item.d120) },
      volatility20: round(item.annualizedVolatility20),
      drawdown60: round(item.drawdown60)
    })),
    current: {
      action,
      signalDate: currentReview?.signalDate,
      effectiveDate: currentReview?.effectiveDate,
      nextReviewDate: "下一交易日",
      holdings,
      entered: currentReview?.entered || currentSymbols.filter((symbol) => !previousSymbols.includes(symbol)),
      exited: currentReview?.exited || previousSymbols.filter((symbol) => !currentSymbols.includes(symbol)),
      cashWeight,
      riskState: bondCount === currentSymbols.length ? "债券防守" : bondCount > 0 ? "部分债券" : "风险资产"
    },
    reviews: [pendingReview, ...reviews.slice(-11).reverse()].map((review) => ({
      ...review,
      holdings: Object.entries(review.allocation).map(([symbol, weight]) => `${configBySymbol.get(symbol)?.name || symbol} ${round(weight * 100, 0)}%`)
    })),
    curve: shown.curve,
    stats: omitCurve(oneYear),
    periodStats: {
      oneYear: omitCurve(oneYear),
      threeYear: omitCurve(threeYear),
      fiveYear: omitCurve(fiveYear),
      full: omitCurve(full)
    }
  };
}
