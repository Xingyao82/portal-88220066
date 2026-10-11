const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/json"
};

// Keep daily observations so comparison pages can align exact shared trading dates.
const MAX_POINTS = 2000;
const MAX_REASONABLE_RETURN_PCT = 5000;
const MIN_POINTS = 2;
const DEFAULT_BASIS = "adjusted";

function inferCnExchangeSuffix(symbol) {
  if (!/^\d{6}$/.test(symbol)) return "";
  if (symbol.startsWith("5")) return ".SS";
  if (symbol.startsWith("1")) return ".SZ";
  return "";
}

function normalizeCnFundSymbol(symbol) {
  const upper = (symbol || "").trim().toUpperCase();
  if (/\.(SS|SZ)$/.test(upper)) return upper;
  const suffix = inferCnExchangeSuffix(upper);
  return suffix ? `${upper}${suffix}` : upper;
}

function isCnFundSymbol(symbol) {
  return /^\d{6}\.(SS|SZ)$/.test(normalizeCnFundSymbol(symbol));
}

function eastmoneyCode(symbol) {
  return normalizeCnFundSymbol(symbol).replace(/\.(SS|SZ)$/i, "");
}

function buildYahooUrl(symbol, interval, fromTs = 0, mode = "auto", host = "query1.finance.yahoo.com") {
  const params = new URLSearchParams({
    interval,
    includeAdjustedClose: "true",
    events: "div,splits"
  });
  if (fromTs && mode === "period") {
    params.set("period1", String(Math.floor(fromTs)));
    params.set("period2", String(Math.floor(Date.now() / 1000) + 86400));
  } else {
    params.set("range", "max");
  }
  return `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`;
}

function stooqSymbol(symbol) {
  if (!/^[A-Z.]+$/.test(symbol)) return "";
  return `${symbol.toLowerCase()}.us`;
}

function parseCsvDate(dateText) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText || "");
  if (!match) return 0;
  return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 1000);
}

function compactSeries(values) {
  if (values.length <= MAX_POINTS) return values;
  const step = Math.ceil(values.length / MAX_POINTS);
  return values.filter((_, index) => index % step === 0 || index === values.length - 1);
}

function enrichMetrics(first, last, firstTs, lastTs) {
  const totalReturnPct = ((last / first) - 1) * 100;
  const years = Math.max((lastTs - firstTs) / (365.25 * 24 * 60 * 60), 1 / 365.25);
  const annualizedReturnPct = (Math.pow(last / first, 1 / years) - 1) * 100;
  return {
    totalReturnPct,
    years,
    annualizedReturnPct
  };
}

function validateSeries(points, symbol) {
  if (!Array.isArray(points) || points.length < MIN_POINTS) {
    throw new Error(`Not enough history for ${symbol}`);
  }

  const first = points[0].value;
  const last = points[points.length - 1].value;
  if (!Number.isFinite(first) || !Number.isFinite(last) || first <= 0 || last <= 0) {
    throw new Error(`Invalid endpoints for ${symbol}`);
  }

  const { totalReturnPct } = enrichMetrics(first, last, points[0].ts, points[points.length - 1].ts);
  if (!Number.isFinite(totalReturnPct) || Math.abs(totalReturnPct) > MAX_REASONABLE_RETURN_PCT) {
    throw new Error(`Unreasonable total return for ${symbol}`);
  }

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1].value;
    const next = points[index].value;
    if (!Number.isFinite(prev) || !Number.isFinite(next) || prev <= 0 || next <= 0) {
      throw new Error(`Invalid point inside series for ${symbol}`);
    }
    const ratio = next / prev;
    if (ratio > 5 || ratio < 0.2) {
      throw new Error(`Suspicious jump inside series for ${symbol}`);
    }
  }

  return totalReturnPct;
}

function normalizeSeries(payload, fromTs = 0, basis = DEFAULT_BASIS) {
  const timestamps = payload?.timestamp || [];
  const adjusted = payload?.indicators?.adjclose?.[0]?.adjclose || [];
  const closes = payload?.indicators?.quote?.[0]?.close || [];
  const pointsByDate = new Map();

  for (let index = 0; index < timestamps.length; index += 1) {
    if (fromTs && timestamps[index] < fromTs) continue;
    const raw = basis === "price" ? closes[index] : adjusted[index];
    if (!Number.isFinite(raw) || raw <= 0) continue;
    const point = {
      ts: timestamps[index],
      value: Number(raw)
    };
    const dateKey = new Date(point.ts * 1000).toISOString().slice(0, 10);
    pointsByDate.set(dateKey, point);
  }

  const points = [...pointsByDate.values()].sort((left, right) => left.ts - right.ts);

  if (points.length < 2) return null;

  const first = points[0].value;
  const totalReturnPct = validateSeries(points, payload?.meta?.symbol || "unknown");
  const metrics = enrichMetrics(first, points[points.length - 1].value, points[0].ts, points[points.length - 1].ts);
  const compact = compactSeries(points);
  return {
    basis,
    firstValue: Number(first.toFixed(4)),
    latestValue: Number(points[points.length - 1].value.toFixed(4)),
    firstAdjClose: Number(first.toFixed(4)),
    latestAdjClose: Number(points[points.length - 1].value.toFixed(4)),
    totalReturnPct: Number(totalReturnPct.toFixed(2)),
    annualizedReturnPct: Number(metrics.annualizedReturnPct.toFixed(2)),
    yearsSinceInception: Number(metrics.years.toFixed(2)),
    inceptionTs: points[0].ts,
    latestTs: points[points.length - 1].ts,
    series: compact.map((point) => ({
      ts: point.ts,
      value: Number(point.value.toFixed(4))
    }))
  };
}

async function fetchYahooChart(normalizedSymbol, interval, fromTs, basis, mode, host) {
  const response = await fetch(buildYahooUrl(normalizedSymbol, interval, fromTs, mode, host), {
    headers: DEFAULT_HEADERS,
    signal: AbortSignal.timeout(7000),
    cf: { cacheTtl: 21600, cacheTtlByStatus: {"200-299":21600,"400-599":0}, cacheEverything: true }
  });
  if (!response.ok) throw new Error(`Yahoo ${host} ${mode} returned ${response.status}`);
  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`Yahoo ${host} ${mode} missing chart payload`);
  const normalized = normalizeSeries(result, fromTs, basis);
  if (!normalized) throw new Error(`Yahoo ${host} ${mode} did not have enough ${basis === "price" ? "close" : "adjusted-close"} data`);
  return {
    symbol: normalizedSymbol,
    currency: result.meta?.currency || "",
    interval,
    basis,
    source: `Yahoo ${host} ${mode}`,
    ...normalized
  };
}

async function fetchStooqPrice(symbol, fromTs = 0) {
  const stooq = stooqSymbol(symbol);
  if (!stooq) throw new Error(`No Stooq mapping for ${symbol}`);
  const response = await fetch(`https://stooq.com/q/d/l/?s=${encodeURIComponent(stooq)}&i=d`, {
    headers: { "User-Agent": DEFAULT_HEADERS["User-Agent"], Accept: "text/csv,*/*" },
    signal: AbortSignal.timeout(7000),
    cf: { cacheTtl: 21600, cacheTtlByStatus: {"200-299":21600,"400-599":0}, cacheEverything: true }
  });
  if (!response.ok) throw new Error(`Stooq returned ${response.status}`);
  const text = await response.text();
  const points = text.split(/\r?\n/).slice(1).map((line) => {
    const columns = line.split(",");
    const ts = parseCsvDate(columns[0]);
    const close = Number(columns[4]);
    return { ts, value: close };
  }).filter((point) => point.ts && Number.isFinite(point.value) && point.value > 0 && (!fromTs || point.ts >= fromTs));
  if (points.length < 2) throw new Error(`Not enough Stooq history for ${symbol}`);
  const first = points[0].value;
  const totalReturnPct = validateSeries(points, symbol);
  const metrics = enrichMetrics(first, points[points.length - 1].value, points[0].ts, points[points.length - 1].ts);
  const compact = compactSeries(points);
  return {
    symbol,
    currency: "USD",
    interval: "1d",
    basis: "price",
    source: "Stooq close",
    firstValue: Number(first.toFixed(4)),
    latestValue: Number(points[points.length - 1].value.toFixed(4)),
    firstAdjClose: Number(first.toFixed(4)),
    latestAdjClose: Number(points[points.length - 1].value.toFixed(4)),
    totalReturnPct: Number(totalReturnPct.toFixed(2)),
    annualizedReturnPct: Number(metrics.annualizedReturnPct.toFixed(2)),
    yearsSinceInception: Number(metrics.years.toFixed(2)),
    inceptionTs: points[0].ts,
    latestTs: points[points.length - 1].ts,
    series: compact.map((point) => ({ ts: point.ts, value: Number(point.value.toFixed(4)) }))
  };
}

async function fetchChart(symbol, interval, fromTs = 0, basis = DEFAULT_BASIS) {
  const normalizedSymbol = normalizeCnFundSymbol(symbol);

  if (isCnFundSymbol(normalizedSymbol)) {
    try {
      return await fetchYahooChart(normalizedSymbol, interval, fromTs, basis, fromTs ? "period" : "max", "query1.finance.yahoo.com");
    } catch (firstError) {
      try {
        return await fetchYahooChart(normalizedSymbol, interval, fromTs, basis, fromTs ? "period" : "max", "query2.finance.yahoo.com");
      } catch {
        if (basis === "price") throw firstError;
        return fetchEastmoneyFund(normalizedSymbol, fromTs, basis);
      }
    }
  }

  const attempts = [];
  if (fromTs) {
    attempts.push(["period", "query1.finance.yahoo.com"], ["period", "query2.finance.yahoo.com"]);
  }
  attempts.push(["max", "query1.finance.yahoo.com"], ["max", "query2.finance.yahoo.com"]);

  let lastError = null;
  for (const [mode, host] of attempts) {
    try {
      return await fetchYahooChart(normalizedSymbol, interval, fromTs, basis, mode, host);
    } catch (error) {
      lastError = error;
    }
  }

  // Preserve the price-only contract: use verified Yahoo closes or a saved snapshot,
  // rather than relabeling another provider's adjusted series as raw prices.

  throw lastError || new Error(`No data source returned ${normalizedSymbol}`);
}

function parseEastmoneyArray(script, key) {
  const marker = `var ${key} =`;
  const start = script.indexOf(marker);
  if (start === -1) return null;
  const slice = script.slice(start + marker.length);
  const end = slice.indexOf(";");
  if (end === -1) return null;
  return JSON.parse(slice.slice(0, end).trim());
}

async function fetchEastmoneyFund(symbol, fromTs = 0, basis = DEFAULT_BASIS) {
  const code = eastmoneyCode(symbol);
  const url = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;
  const response = await fetch(url, {
    headers: { "User-Agent": DEFAULT_HEADERS["User-Agent"] },
    signal: AbortSignal.timeout(7000),
    cf: { cacheTtl: 21600, cacheTtlByStatus: {"200-299":21600,"400-599":0}, cacheEverything: true }
  });

  if (!response.ok) {
    throw new Error(`Eastmoney returned ${response.status}`);
  }

  const script = await response.text();
  let points = [];

  if (basis === "price") {
    const netWorth = parseEastmoneyArray(script, "Data_netWorthTrend");
    if (!Array.isArray(netWorth) || netWorth.length < 2) {
      throw new Error("Eastmoney net-worth series missing");
    }
    points = netWorth
      .filter((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y) && point.y > 0)
      .map((point) => ({ ts: Math.floor(point.x / 1000), value: Number(point.y) }))
      .filter((point) => !fromTs || point.ts >= fromTs);
  } else {
    const accWorth = parseEastmoneyArray(script, "Data_ACWorthTrend");
    if (!Array.isArray(accWorth) || accWorth.length < 2) {
      throw new Error("Eastmoney adjusted-worth series missing");
    }
    points = accWorth
      .filter((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]) && point[1] > 0)
      .map(([tsMs, value]) => ({ ts: Math.floor(tsMs / 1000), value: Number(value) }))
      .filter((point) => !fromTs || point.ts >= fromTs);
  }

  if (points.length < 2) {
    throw new Error(`Not enough history for ${symbol}`);
  }

  const first = points[0].value;
  const totalReturnPct = validateSeries(points, symbol);
  const metrics = enrichMetrics(first, points[points.length - 1].value, points[0].ts, points[points.length - 1].ts);
  const compact = compactSeries(points);
  return {
    symbol,
    currency: "CNY",
    interval: "1d",
    basis,
    firstValue: Number(first.toFixed(4)),
    latestValue: Number(points[points.length - 1].value.toFixed(4)),
    firstAdjClose: Number(first.toFixed(4)),
    latestAdjClose: Number(points[points.length - 1].value.toFixed(4)),
    totalReturnPct: Number(totalReturnPct.toFixed(2)),
    annualizedReturnPct: Number(metrics.annualizedReturnPct.toFixed(2)),
    yearsSinceInception: Number(metrics.years.toFixed(2)),
    inceptionTs: points[0].ts,
    latestTs: points[points.length - 1].ts,
    series: compact.map((point) => ({
      ts: point.ts,
      value: Number(point.value.toFixed(4))
    }))
  };
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const symbol = (url.searchParams.get("symbol") || "").trim().toUpperCase();
  const interval = (url.searchParams.get("interval") || "1mo").trim();
  const fromTs = Math.max(0, Number(url.searchParams.get("since") || url.searchParams.get("from") || 0) || 0);
  const basis = (url.searchParams.get("basis") || DEFAULT_BASIS).trim().toLowerCase() === "price" ? "price" : DEFAULT_BASIS;

  if (!/^[A-Z0-9.^=-]{1,24}$/.test(symbol) || !["1d", "1wk", "1mo"].includes(interval)) {
    return Response.json({ error: "Missing symbol" }, { status: 400 });
  }

  try {
    const payload = await fetchChart(symbol, interval, fromTs, basis);
    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=21600",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to load total return"
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
