const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/json"
};

const MAX_POINTS = 120;
const MAX_REASONABLE_RETURN_PCT = 5000;
const MIN_POINTS = 24;

function isCnFundSymbol(symbol) {
  return /\.(SS|SZ)$/.test(symbol);
}

function eastmoneyCode(symbol) {
  return symbol.replace(/\.(SS|SZ)$/i, "");
}

function buildYahooUrl(symbol, interval) {
  const params = new URLSearchParams({
    interval,
    range: "max",
    includeAdjustedClose: "true",
    events: "div,splits"
  });
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`;
}

function compactSeries(values) {
  if (values.length <= MAX_POINTS) return values;
  const step = Math.ceil(values.length / MAX_POINTS);
  return values.filter((_, index) => index % step === 0 || index === values.length - 1);
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

  const totalReturnPct = ((last / first) - 1) * 100;
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

function normalizeSeries(payload) {
  const timestamps = payload?.timestamp || [];
  const adjusted = payload?.indicators?.adjclose?.[0]?.adjclose || [];
  const closes = payload?.indicators?.quote?.[0]?.close || [];
  const points = [];

  for (let index = 0; index < timestamps.length; index += 1) {
    const raw = adjusted[index] ?? closes[index];
    if (!Number.isFinite(raw) || raw <= 0) continue;
    points.push({
      ts: timestamps[index],
      value: Number(raw)
    });
  }

  if (points.length < 2) return null;

  const first = points[0].value;
  const totalReturnPct = validateSeries(points, payload?.meta?.symbol || "unknown");
  const compact = compactSeries(points);
  return {
    firstAdjClose: Number(first.toFixed(4)),
    latestAdjClose: Number(points[points.length - 1].value.toFixed(4)),
    totalReturnPct: Number(totalReturnPct.toFixed(2)),
    inceptionTs: points[0].ts,
    latestTs: points[points.length - 1].ts,
    series: compact.map((point) => ({
      ts: point.ts,
      value: Number(point.value.toFixed(4))
    }))
  };
}

async function fetchChart(symbol, interval) {
  if (isCnFundSymbol(symbol)) {
    return fetchEastmoneyFund(symbol);
  }

  const response = await fetch(buildYahooUrl(symbol, interval), {
    headers: DEFAULT_HEADERS,
    cf: { cacheTtl: 21600, cacheEverything: true }
  });

  if (!response.ok) {
    throw new Error(`Upstream returned ${response.status}`);
  }

  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error("Missing chart payload");
  }

  const normalized = normalizeSeries(result);
  if (!normalized) {
    throw new Error("Not enough adjusted-close data");
  }

  return {
    symbol,
    currency: result.meta?.currency || "",
    interval,
    ...normalized
  };
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

async function fetchEastmoneyFund(symbol) {
  const code = eastmoneyCode(symbol);
  const url = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;
  const response = await fetch(url, {
    headers: { "User-Agent": DEFAULT_HEADERS["User-Agent"] },
    cf: { cacheTtl: 21600, cacheEverything: true }
  });

  if (!response.ok) {
    throw new Error(`Eastmoney returned ${response.status}`);
  }

  const script = await response.text();
  const accWorth = parseEastmoneyArray(script, "Data_ACWorthTrend");
  if (!Array.isArray(accWorth) || accWorth.length < 2) {
    throw new Error("Eastmoney adjusted-worth series missing");
  }

  const points = accWorth
    .filter((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]) && point[1] > 0)
    .map(([tsMs, value]) => ({ ts: Math.floor(tsMs / 1000), value: Number(value) }));

  const first = points[0].value;
  const totalReturnPct = validateSeries(points, symbol);
  const compact = compactSeries(points);
  return {
    symbol,
    currency: "CNY",
    interval: "1d",
    firstAdjClose: Number(first.toFixed(4)),
    latestAdjClose: Number(points[points.length - 1].value.toFixed(4)),
    totalReturnPct: Number(totalReturnPct.toFixed(2)),
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

  if (!symbol) {
    return Response.json({ error: "Missing symbol" }, { status: 400 });
  }

  try {
    const payload = await fetchChart(symbol, interval);
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
