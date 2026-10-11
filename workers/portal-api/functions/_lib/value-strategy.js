import { round } from "./market-data.js";

export const VALUE_STRATEGY = {
  title: "美股多因子价值",
  defaultUniverse: "sp500",
  defaultRebalance: "weekly",
  holdings: 10,
  factorWeights: [
    { key: "earningsYield", label: "调整后盈利收益率", weight: 40 },
    { key: "ebitEvYield", label: "EBIT / EV", weight: 20 },
    { key: "fcfYield", label: "自由现金流收益率", weight: 20 },
    { key: "shareholderYield", label: "股东收益率", weight: 10 },
    { key: "valuationYield", label: "账面价值或销售额估值", weight: 10 }
  ],
  filters: {
    minMarketCap: 5_000_000_000,
    minPrice: 5,
    minAverageDollarVolume: 20_000_000,
    maxDebtToAssets: 0.75,
    minInterestCoverage: 2,
    minRoic: 0,
    minAdjustedEarningsGrowthYoy: -0.5
  }
};

function finite(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function ratio(numerator, denominator) {
  const top = finite(numerator);
  const bottom = finite(denominator);
  return top !== null && bottom !== null && bottom > 0 ? top / bottom : null;
}

function percentileScores(rows, key) {
  const samples = rows.map((row) => row[key]).filter(Number.isFinite).sort((a, b) => a - b);
  if (!samples.length) return new Map();
  const low = samples[Math.floor((samples.length - 1) * 0.05)];
  const high = samples[Math.ceil((samples.length - 1) * 0.95)];
  const ranked = rows
    .map((row) => ({
      symbol: row.symbol,
      value: Number.isFinite(row[key]) ? Math.min(high, Math.max(low, row[key])) : null
    }))
    .filter((row) => Number.isFinite(row.value))
    .sort((a, b) => a.value - b.value);
  return new Map(ranked.map((row, index) => [
    row.symbol,
    ranked.length === 1 ? 100 : (index / (ranked.length - 1)) * 100
  ]));
}

function enrich(row) {
  const marketCap = finite(row.market_cap);
  const enterpriseValue = finite(row.enterprise_value);
  const bookYield = ratio(row.book_value, marketCap);
  const salesYield = ratio(row.revenue, enterpriseValue);
  return {
    ...row,
    symbol: String(row.symbol || "").toUpperCase(),
    name: row.company_name || row.name || row.symbol,
    marketCap,
    price: finite(row.price),
    averageDollarVolume: finite(row.average_dollar_volume),
    debtToAssets: finite(row.debt_to_assets),
    interestCoverage: finite(row.interest_coverage),
    roic: finite(row.roic),
    earningsGrowthYoy: finite(row.adjusted_earnings_growth_yoy),
    earningsYield: ratio(row.adjusted_net_income, marketCap),
    ebitEvYield: ratio(row.ebit, enterpriseValue),
    fcfYield: ratio(finite(row.operating_cash_flow) - finite(row.capex), marketCap),
    shareholderYield: ratio(
      finite(row.dividends_paid) + finite(row.share_repurchases) - finite(row.share_issuance),
      marketCap
    ),
    valuationYield: bookYield !== null && bookYield > 0 ? bookYield : salesYield,
    valuationBasis: bookYield !== null && bookYield > 0 ? "P/B" : "EV/Sales"
  };
}

export function rankValueStocks(inputRows, options = {}) {
  const config = { ...VALUE_STRATEGY.filters, ...(options.filters || {}) };
  const universe = options.universe === "top1000" ? "top1000" : "sp500";
  const rows = (inputRows || []).map(enrich).filter((row) => {
    const inUniverse = universe === "sp500"
      ? Number(row.in_sp500) === 1
      : finite(row.market_cap_rank) !== null && finite(row.market_cap_rank) <= 1000;
    return inUniverse
      && row.marketCap >= config.minMarketCap
      && row.price >= config.minPrice
      && row.averageDollarVolume >= config.minAverageDollarVolume
      && finite(row.adjusted_net_income) > 0
      && finite(row.operating_cash_flow) > 0
      && row.debtToAssets !== null && row.debtToAssets <= config.maxDebtToAssets
      && row.interestCoverage !== null && row.interestCoverage >= config.minInterestCoverage
      && row.roic !== null && row.roic >= config.minRoic
      && row.earningsGrowthYoy !== null && row.earningsGrowthYoy >= config.minAdjustedEarningsGrowthYoy
      && VALUE_STRATEGY.factorWeights.every((factor) => Number.isFinite(row[factor.key]));
  });
  const percentiles = new Map(VALUE_STRATEGY.factorWeights.map((factor) => [
    factor.key,
    percentileScores(rows, factor.key)
  ]));
  const ranked = rows.map((row) => {
    const factorScores = Object.fromEntries(VALUE_STRATEGY.factorWeights.map((factor) => [
      factor.key,
      round(percentiles.get(factor.key).get(row.symbol), 2)
    ]));
    const totalScore = VALUE_STRATEGY.factorWeights.reduce(
      (sum, factor) => sum + (factorScores[factor.key] || 0) * factor.weight / 100,
      0
    );
    return {
      symbol: row.symbol,
      name: row.name,
      asOfDate: row.as_of_date,
      totalScore: round(totalScore, 2),
      earningsYieldPct: round(row.earningsYield * 100, 2),
      ebitEvYieldPct: round(row.ebitEvYield * 100, 2),
      fcfYieldPct: round(row.fcfYield * 100, 2),
      shareholderYieldPct: round(row.shareholderYield * 100, 2),
      valuationYieldPct: round(row.valuationYield * 100, 2),
      valuationBasis: row.valuationBasis,
      roicPct: round(row.roic * 100, 2)
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
  const selected = ranked.slice(0, VALUE_STRATEGY.holdings);
  return selected.map((row, index) => ({
    ...row,
    rank: index + 1,
    weightPct: round(100 / selected.length, 2)
  }));
}

export async function buildValueStrategyPayload(env, options = {}) {
  const universe = options.universe === "top1000" ? "top1000" : VALUE_STRATEGY.defaultUniverse;
  const rebalance = options.rebalance === "monthly" ? "monthly" : VALUE_STRATEGY.defaultRebalance;
  let snapshotRows = [];
  let dataError = null;
  try {
    if (!env?.NEWS_DB) throw new Error("D1 binding NEWS_DB is unavailable");
    const result = await env.NEWS_DB.prepare(`
      SELECT * FROM us_fundamental_snapshots
      WHERE as_of_date = (SELECT MAX(as_of_date) FROM us_fundamental_snapshots)
      ORDER BY market_cap DESC
      LIMIT 1200
    `).all();
    snapshotRows = result.results || [];
  } catch (error) {
    dataError = error instanceof Error ? error.message : "Unable to read the fundamental snapshot";
  }
  const ranking = rankValueStocks(snapshotRows, { universe });
  const asOfDate = snapshotRows.map((row) => row.as_of_date).filter(Boolean).sort().at(-1) || null;
  const ready = ranking.length > 0;
  const universeLabel = universe === "top1000" ? "美国市值前1000" : "标普500";
  return {
    ok: true,
    modelOnly: !ready,
    updatedAt: new Date().toISOString(),
    title: VALUE_STRATEGY.title,
    rule: `${universeLabel}；基本面与价格均使用当时可得的带时间戳快照；${rebalance === "weekly" ? "每周" : "每月"}检查，前10名等权持有。`,
    marketLabel: "美股",
    benchmarkName: "标普500",
    currentHolding: ready ? ranking.map((row) => row.symbol).join(" / ") : "等待基本面快照",
    startDate: "--",
    endDate: asOfDate || "--",
    rankingDate: asOfDate,
    dataStatus: ready
      ? `当前排名使用 ${asOfDate} 的点时基本面快照。`
      : "规则与排名引擎已接入；D1 尚无带时间戳的基本面快照，因此暂不生成虚假排名或收益曲线。",
    dataError,
    universe,
    universeLabel,
    rebalance,
    weighting: "前10名等权",
    factorWeights: VALUE_STRATEGY.factorWeights,
    filters: VALUE_STRATEGY.filters,
    ranking,
    stats: { eligibleCount: ranking.length, holdingCount: ranking.length, sampleDays: 0 },
    history: [],
    recent: []
  };
}
