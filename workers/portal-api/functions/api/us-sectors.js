const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/json,text/plain,*/*"
};

const CACHE_SECONDS = 900;
const SPARK_BATCH_SIZE = 10;

const SECTORS = [
  { symbol: "XLK", name: "Technology", zh: "科技", group: "sector", leaders: ["NVDA", "MSFT", "AAPL", "AVGO", "ORCL"] },
  { symbol: "XLC", name: "Communication Services", zh: "通信服务", group: "sector", leaders: ["META", "GOOGL", "GOOG", "NFLX", "TMUS"] },
  { symbol: "XLY", name: "Consumer Discretionary", zh: "可选消费", group: "sector", leaders: ["AMZN", "TSLA", "HD", "MCD", "BKNG"] },
  { symbol: "XLP", name: "Consumer Staples", zh: "必需消费", group: "sector", leaders: ["WMT", "COST", "PG", "KO", "PM"] },
  { symbol: "XLF", name: "Financials", zh: "金融", group: "sector", leaders: ["BRK-B", "JPM", "V", "MA", "BAC"] },
  { symbol: "XLV", name: "Health Care", zh: "医疗保健", group: "sector", leaders: ["LLY", "UNH", "JNJ", "ABBV", "MRK"] },
  { symbol: "XLI", name: "Industrials", zh: "工业", group: "sector", leaders: ["GE", "CAT", "RTX", "HON", "UNP"] },
  { symbol: "XLE", name: "Energy", zh: "能源", group: "sector", leaders: ["XOM", "CVX", "COP", "EOG", "SLB"] },
  { symbol: "XLB", name: "Materials", zh: "材料", group: "sector", leaders: ["LIN", "SHW", "FCX", "ECL", "NEM"] },
  { symbol: "XLRE", name: "Real Estate", zh: "房地产", group: "sector", leaders: ["PLD", "AMT", "EQIX", "WELL", "SPG"] },
  { symbol: "XLU", name: "Utilities", zh: "公用事业", group: "sector", leaders: ["NEE", "SO", "DUK", "CEG", "AEP"] },
  { symbol: "SMH", name: "Semiconductors", zh: "半导体", group: "theme", leaders: ["NVDA", "AVGO", "AMD", "TSM", "ASML"] },
  { symbol: "IGV", name: "Software", zh: "软件", group: "theme", leaders: ["MSFT", "CRM", "ADBE", "NOW", "PANW"] },
  { symbol: "IBB", name: "Biotech", zh: "生物科技", group: "theme", leaders: ["AMGN", "GILD", "VRTX", "REGN", "MRNA"] },
  { symbol: "ITA", name: "Aerospace & Defense", zh: "航空航天与军工", group: "theme", leaders: ["RTX", "LMT", "NOC", "GD", "BA"] },
  { symbol: "XRT", name: "Retail", zh: "零售", group: "theme", leaders: ["WMT", "COST", "AMZN", "TGT", "TJX"] },
  { symbol: "KRE", name: "Regional Banks", zh: "区域银行", group: "theme", leaders: ["CFG", "FITB", "HBAN", "KEY", "RF"] },
  { symbol: "IYT", name: "Transportation", zh: "运输", group: "theme", leaders: ["UNP", "UPS", "FDX", "CSX", "DAL"] },
  { symbol: "GDX", name: "Gold Miners", zh: "金矿", group: "theme", leaders: ["NEM", "GOLD", "AEM", "WPM", "FNV"] },
  { symbol: "TAN", name: "Solar", zh: "太阳能", group: "theme", leaders: ["FSLR", "ENPH", "SEDG", "NXT", "ARRY"] }
];

const SYMBOL_NAME = {
  "BRK-B": "Berkshire Hathaway",
  AAPL: "Apple",
  ABBV: "AbbVie",
  ADBE: "Adobe",
  AEM: "Agnico Eagle Mines",
  AEP: "American Electric Power",
  AMD: "AMD",
  AMGN: "Amgen",
  AMT: "American Tower",
  AMZN: "Amazon",
  ARRY: "Array Technologies",
  ASML: "ASML",
  AVGO: "Broadcom",
  BA: "Boeing",
  BAC: "Bank of America",
  BKNG: "Booking",
  CAT: "Caterpillar",
  CEG: "Constellation Energy",
  CFG: "Citizens Financial",
  COP: "ConocoPhillips",
  COST: "Costco",
  CRM: "Salesforce",
  CSX: "CSX",
  CVX: "Chevron",
  DAL: "Delta Air Lines",
  DUK: "Duke Energy",
  ECL: "Ecolab",
  ENPH: "Enphase",
  EOG: "EOG Resources",
  EQIX: "Equinix",
  FDX: "FedEx",
  FITB: "Fifth Third",
  FNV: "Franco-Nevada",
  FSLR: "First Solar",
  GE: "GE Aerospace",
  GD: "General Dynamics",
  GILD: "Gilead",
  GOOG: "Alphabet C",
  GOOGL: "Alphabet A",
  GOLD: "Barrick Gold",
  HBAN: "Huntington Bancshares",
  HD: "Home Depot",
  HON: "Honeywell",
  JNJ: "Johnson & Johnson",
  JPM: "JPMorgan",
  KEY: "KeyCorp",
  KO: "Coca-Cola",
  LIN: "Linde",
  LLY: "Eli Lilly",
  LMT: "Lockheed Martin",
  MA: "Mastercard",
  MCD: "McDonald's",
  META: "Meta",
  MRNA: "Moderna",
  MRK: "Merck",
  MSFT: "Microsoft",
  NEE: "NextEra Energy",
  NEM: "Newmont",
  NFLX: "Netflix",
  NOC: "Northrop Grumman",
  NOW: "ServiceNow",
  NVDA: "Nvidia",
  NXT: "Nextracker",
  ORCL: "Oracle",
  PANW: "Palo Alto Networks",
  PG: "Procter & Gamble",
  PLD: "Prologis",
  PM: "Philip Morris",
  REGN: "Regeneron",
  RF: "Regions Financial",
  RTX: "RTX",
  SEDG: "SolarEdge",
  SHW: "Sherwin-Williams",
  SLB: "SLB",
  SO: "Southern",
  SPG: "Simon Property",
  TGT: "Target",
  TJX: "TJX",
  TMUS: "T-Mobile US",
  TSLA: "Tesla",
  TSM: "TSMC",
  UNH: "UnitedHealth",
  UNP: "Union Pacific",
  UPS: "UPS",
  V: "Visa",
  VRTX: "Vertex",
  WELL: "Welltower",
  WMT: "Walmart",
  WPM: "Wheaton Precious Metals",
  XOM: "Exxon Mobil"
};

function pct(now, past) {
  if (!Number.isFinite(now) || !Number.isFinite(past) || past <= 0) return null;
  return Number((((now - past) / past) * 100).toFixed(2));
}

function pickPast(closes, sessions) {
  const index = closes.length - 1 - sessions;
  return index >= 0 ? closes[index] : null;
}

function emptyChart(item) {
  const symbol = typeof item === "string" ? item : item.symbol;
  return {
    ...(typeof item === "string" ? { symbol, name: SYMBOL_NAME[symbol] || symbol } : item),
    price: null,
    change1d: null,
    change5d: null,
    change20d: null,
    change60d: null,
    volume: null,
    source: "Yahoo chart unavailable"
  };
}

function normalizeChart(item, result) {
  if (!result) return emptyChart(item);
  const symbol = typeof item === "string" ? item : item.symbol;
  const quote = result?.indicators?.quote?.[0] || {};
  const closes = (quote.close || []).filter((value) => Number.isFinite(value));
  const volumes = (quote.volume || []).filter((value) => Number.isFinite(value));
  const last = closes.at(-1);
  return {
    ...(typeof item === "string" ? { symbol, name: SYMBOL_NAME[symbol] || symbol } : item),
    price: Number.isFinite(last) ? Number(last.toFixed(2)) : null,
    change1d: pct(last, pickPast(closes, 1)),
    change5d: pct(last, pickPast(closes, 5)),
    change20d: pct(last, pickPast(closes, 20)),
    change60d: pct(last, pickPast(closes, 60)),
    volume: volumes.at(-1) || null,
    source: "Yahoo chart"
  };
}

async function fetchSparkBatch(symbols) {
  if (!symbols.length) return new Map();
  const urls = [
    `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(symbols.join(","))}&range=6mo&interval=1d`,
    `https://query2.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(symbols.join(","))}&range=6mo&interval=1d`
  ];
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        cf: { cacheTtl: CACHE_SECONDS, cacheTtlByStatus: {"200-299":CACHE_SECONDS,"400-599":0}, cacheEverything: true }
      });
      if (!response.ok) continue;
      const json = await response.json();
      const result = json?.spark?.result || [];
      const map = new Map();
      result.forEach((entry) => {
        const chart = entry?.response?.[0];
        const symbol = entry?.symbol || chart?.meta?.symbol;
        if (symbol) map.set(symbol, chart);
      });
      if (map.size) return map;
    } catch {
      // try the next Yahoo host
    }
  }
  return new Map();
}

async function fetchSpark(symbols) {
  const unique = [...new Set(symbols)].filter(Boolean);
  const combined = new Map();
  for (let index = 0; index < unique.length; index += SPARK_BATCH_SIZE) {
    const batch = unique.slice(index, index + SPARK_BATCH_SIZE);
    const map = await fetchSparkBatch(batch);
    map.forEach((value, key) => combined.set(key, value));
  }
  return combined;
}

function bestLeader(leaders, metric) {
  const valid = leaders.filter((item) => Number.isFinite(item?.[metric]));
  if (!valid.length) return null;
  return valid.reduce((best, item) => (item[metric] > best[metric] ? item : best), valid[0]);
}

function buildSector(item, chartMap) {
  const sector = normalizeChart(item, chartMap.get(item.symbol));
  const leaders = (item.leaders || []).map((symbol) => normalizeChart(symbol, chartMap.get(symbol)));
  return {
    ...sector,
    leaders,
    leaderByMetric: {
      change1d: bestLeader(leaders, "change1d"),
      change5d: bestLeader(leaders, "change5d"),
      change20d: bestLeader(leaders, "change20d"),
      change60d: bestLeader(leaders, "change60d")
    }
  };
}

export async function onRequestGet() {
  try {
    const symbols = SECTORS.flatMap((item) => [item.symbol, ...(item.leaders || [])]);
    const chartMap = await fetchSpark(symbols);
    const items = SECTORS.map((item) => buildSector(item, chartMap));
    return Response.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      cacheSeconds: CACHE_SECONDS,
      itemCount: items.length,
      items
    }, {
      headers: {
        "Cache-Control": `public, max-age=120, s-maxage=${CACHE_SECONDS}`,
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load US sectors"
    }, {
      status: 502,
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
