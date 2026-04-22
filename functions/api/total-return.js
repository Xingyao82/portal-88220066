const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/json"
};

const MAX_POINTS = 120;

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
  const compact = compactSeries(points);
  return {
    firstAdjClose: Number(first.toFixed(4)),
    latestAdjClose: Number(points[points.length - 1].value.toFixed(4)),
    totalReturnPct: Number((((points[points.length - 1].value / first) - 1) * 100).toFixed(2)),
    inceptionTs: points[0].ts,
    latestTs: points[points.length - 1].ts,
    series: compact.map((point) => ({
      ts: point.ts,
      value: Number(point.value.toFixed(4))
    }))
  };
}

async function fetchChart(symbol, interval) {
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
