const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/json,text/plain,*/*"
};

const YAHOO_HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];

export function yahooSymbol(symbol) {
  const upper = String(symbol || "").trim().toUpperCase();
  if (/^\d{6}$/.test(upper)) return `${upper}.${upper.startsWith("5") ? "SS" : "SZ"}`;
  return upper;
}

export function displaySymbol(symbol) {
  return String(symbol || "").replace(/\.(SS|SZ)$/i, "");
}

export function round(value, digits = 2) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
}

export function returnPct(now, past) {
  if (!Number.isFinite(now) || !Number.isFinite(past) || past <= 0) return null;
  return round(((now / past) - 1) * 100);
}

export function standardDeviation(values) {
  if (!Array.isArray(values) || values.length < 2) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function maxDrawdown(values) {
  let peak = null;
  let worst = 0;
  for (const value of values || []) {
    if (!Number.isFinite(value) || value <= 0) continue;
    peak = peak === null ? value : Math.max(peak, value);
    worst = Math.min(worst, ((value / peak) - 1) * 100);
  }
  return round(worst);
}

export function movingAverage(values, length, endIndex = values.length - 1) {
  const start = endIndex - length + 1;
  if (start < 0) return null;
  const sample = values.slice(start, endIndex + 1);
  if (sample.length !== length || sample.some((value) => !Number.isFinite(value))) return null;
  return sample.reduce((sum, value) => sum + value, 0) / length;
}

export function rsi(values, length = 14, endIndex = values.length - 1) {
  if (endIndex < length) return null;
  let gains = 0;
  let losses = 0;
  for (let index = endIndex - length + 1; index <= endIndex; index += 1) {
    const change = values[index] - values[index - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }
  if (losses === 0) return gains > 0 ? 100 : 50;
  const relativeStrength = gains / losses;
  return 100 - (100 / (1 + relativeStrength));
}

export function metricsFromPoints(points) {
  const closes = (points || []).map((point) => point.adjusted).filter(Number.isFinite);
  if (closes.length < 2) return null;
  const last = closes.at(-1);
  const pick = (sessions) => closes.length > sessions ? closes[closes.length - 1 - sessions] : null;
  const daily = closes.slice(-21).map((value, index, values) => index ? (value / values[index - 1]) - 1 : null).filter(Number.isFinite);
  return {
    price: round((points || []).at(-1)?.close),
    adjustedPrice: round(last, 4),
    returns: {
      d1: returnPct(last, pick(1)),
      d5: returnPct(last, pick(5)),
      d20: returnPct(last, pick(20)),
      d60: returnPct(last, pick(60)),
      d120: returnPct(last, pick(120))
    },
    volatility20: round((standardDeviation(daily) || 0) * 100),
    annualizedVolatility20: round((standardDeviation(daily) || 0) * Math.sqrt(252) * 100),
    drawdown60: maxDrawdown(closes.slice(-61)),
    ma20: round(movingAverage(closes, 20)),
    ma60: round(movingAverage(closes, 60)),
    latestTs: (points || []).at(-1)?.ts || null
  };
}

function normalizeChart(result) {
  const timestamps = result?.timestamp || [];
  const quote = result?.indicators?.quote?.[0] || {};
  const adjusted = result?.indicators?.adjclose?.[0]?.adjclose || [];
  const points = [];
  for (let index = 0; index < timestamps.length; index += 1) {
    const close = quote.close?.[index];
    const open = quote.open?.[index];
    const adj = adjusted[index] ?? close;
    if (!Number.isFinite(timestamps[index]) || !Number.isFinite(close) || !Number.isFinite(adj) || close <= 0 || adj <= 0) continue;
    const usableOpen = Number.isFinite(open) && open > 0 ? Number(open) : Number(close);
    const adjustedOpen = usableOpen * (Number(adj) / Number(close));
    const ts = timestamps[index];
    const previous = points.at(-1);
    if (previous && new Date(previous.ts * 1000).toISOString().slice(0, 10) === new Date(ts * 1000).toISOString().slice(0, 10)) {
      points[points.length - 1] = { ts, open: usableOpen, close: Number(close), adjustedOpen, adjusted: Number(adj) };
    } else {
      points.push({ ts, open: usableOpen, close: Number(close), adjustedOpen, adjusted: Number(adj) });
    }
  }
  return points;
}

export async function fetchYahooChart(symbol, options = {}) {
  const normalized = yahooSymbol(symbol);
  const range = options.range || "1y";
  const interval = options.interval || "1d";
  let lastError = null;
  for (const host of YAHOO_HOSTS) {
    try {
      const params = new URLSearchParams({ range, interval, includeAdjustedClose: "true", events: "div,splits" });
      const response = await fetch(`https://${host}/v8/finance/chart/${encodeURIComponent(normalized)}?${params}`, {
        headers: DEFAULT_HEADERS,
        cf: { cacheTtl: options.cacheTtl || 900, cacheEverything: true }
      });
      if (!response.ok) throw new Error(`Yahoo ${host} returned ${response.status}`);
      const payload = await response.json();
      const result = payload?.chart?.result?.[0];
      if (!result) throw new Error(`Yahoo ${host} returned no chart for ${normalized}`);
      const points = normalizeChart(result);
      if (points.length < (options.minPoints || 2)) throw new Error(`Not enough history for ${normalized}`);
      return {
        symbol: normalized,
        displaySymbol: displaySymbol(normalized),
        name: result.meta?.longName || result.meta?.shortName || normalized,
        currency: result.meta?.currency || (/\.(SS|SZ)$/.test(normalized) ? "CNY" : "USD"),
        exchange: result.meta?.exchangeName || "",
        points,
        meta: result.meta || {},
        source: `Yahoo ${host}`
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`Unable to load ${normalized}`);
}

export async function fetchManyCharts(symbols, options = {}) {
  const unique = [...new Set((symbols || []).map(yahooSymbol).filter(Boolean))];
  const concurrency = Math.max(1, Math.min(options.concurrency || 6, 10));
  const results = new Map();
  let cursor = 0;
  const worker = async () => {
    while (cursor < unique.length) {
      const symbol = unique[cursor];
      cursor += 1;
      try {
        results.set(symbol, await fetchYahooChart(symbol, options));
      } catch (error) {
        results.set(symbol, { symbol, error: error instanceof Error ? error.message : "Unable to load chart" });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, worker));
  return results;
}

export function alignCharts(charts, basis = "adjusted") {
  const valid = (charts || []).filter((chart) => Array.isArray(chart?.points) && chart.points.length >= 2);
  if (!valid.length) return { dates: [], series: new Map() };
  const maps = valid.map((chart) => new Map(chart.points.map((point) => [new Date(point.ts * 1000).toISOString().slice(0, 10), point])));
  const dates = [...maps[0].keys()].filter((date) => maps.every((map) => map.has(date))).sort();
  const series = new Map();
  valid.forEach((chart, index) => {
    series.set(chart.symbol, dates.map((date) => {
      const point = maps[index].get(date);
      return {
        date,
        ts: point.ts,
        open: basis === "price" ? point.open : point.adjustedOpen,
        value: basis === "price" ? point.close : point.adjusted
      };
    }));
  });
  return { dates, series };
}

export function normalizedCurve(charts, basis = "adjusted", limit = 120) {
  const aligned = alignCharts(charts, basis);
  if (aligned.dates.length < 2) return [];
  const start = Math.max(0, aligned.dates.length - limit);
  const dates = aligned.dates.slice(start);
  const symbols = charts.map((chart) => chart.symbol);
  const bases = new Map(symbols.map((symbol) => [symbol, aligned.series.get(symbol)?.[start]?.value]));
  return dates.map((date, offset) => {
    const row = { date };
    symbols.forEach((symbol) => {
      const value = aligned.series.get(symbol)?.[start + offset]?.value;
      const base = bases.get(symbol);
      row[symbol] = Number.isFinite(value) && Number.isFinite(base) && base > 0 ? round((value / base) * 100, 4) : null;
    });
    return row;
  });
}
