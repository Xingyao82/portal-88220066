const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/json,text/plain,*/*",
  Referer: "https://fund.eastmoney.com/"
};

const CACHE_SECONDS = 300;

const FUNDS = [
  { code: "513100", market: "SH", group: "nasdaq", target: "Nasdaq-100", provider: "国泰", name: "纳指ETF国泰" },
  { code: "159941", market: "SZ", group: "nasdaq", target: "Nasdaq-100", provider: "广发", name: "纳指ETF广发" },
  { code: "159501", market: "SZ", group: "nasdaq", target: "Nasdaq-100", provider: "嘉实", name: "纳指ETF嘉实" },
  { code: "513300", market: "SH", group: "nasdaq", target: "Nasdaq-100", provider: "华夏", name: "纳斯达克ETF华夏" },
  { code: "159513", market: "SZ", group: "nasdaq", target: "Nasdaq-100", provider: "大成", name: "纳斯达克100ETF大成" },
  { code: "513110", market: "SH", group: "nasdaq", target: "Nasdaq-100", provider: "华泰柏瑞", name: "纳指ETF华泰柏瑞" },
  { code: "159660", market: "SZ", group: "nasdaq", target: "Nasdaq-100", provider: "汇添富", name: "纳指ETF汇添富" },
  { code: "159632", market: "SZ", group: "nasdaq", target: "Nasdaq-100", provider: "华安", name: "纳斯达克ETF华安" },
  { code: "513390", market: "SH", group: "nasdaq", target: "Nasdaq-100", provider: "博时", name: "纳指100ETF博时" },
  { code: "159696", market: "SZ", group: "nasdaq", target: "Nasdaq-100", provider: "易方达", name: "纳指ETF易方达" },
  { code: "513500", market: "SH", group: "sp500", target: "S&P 500", provider: "博时", name: "标普500ETF博时" },
  { code: "513650", market: "SH", group: "sp500", target: "S&P 500", provider: "南方", name: "标普500ETF南方" },
  { code: "159612", market: "SZ", group: "sp500", target: "S&P 500", provider: "国泰", name: "标普500ETF国泰" },
  { code: "159655", market: "SZ", group: "sp500", target: "S&P 500", provider: "华夏", name: "标普500ETF华夏" },
  { code: "513400", market: "SH", group: "dow", target: "Dow Jones", provider: "鹏华", name: "道琼斯ETF鹏华" },
  { code: "513850", market: "SH", group: "largecap", target: "U.S. 50", provider: "易方达", name: "美国50ETF易方达" },
  { code: "159509", market: "SZ", group: "sector", target: "Nasdaq Tech", provider: "景顺长城", name: "纳指科技ETF景顺" },
  { code: "159518", market: "SZ", group: "sector", target: "S&P Oil & Gas", provider: "嘉实", name: "标普油气ETF嘉实" },
  { code: "160644", market: "SZ", group: "active", target: "HK / U.S. Internet", provider: "鹏华", name: "鹏华港美互联股票人民币" }
];

function secid(fund) {
  return `${fund.market === "SH" ? "1" : "0"}.${fund.code}`;
}

function yahooSymbol(fund) {
  return `${fund.code}.${fund.market === "SH" ? "SS" : "SZ"}`;
}

function toNumber(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function round(value, digits = 2) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(digits));
}

function premiumPct(price, nav) {
  if (!Number.isFinite(price) || !Number.isFinite(nav) || nav <= 0) return null;
  return round(((price - nav) / nav) * 100, 2);
}

function riskLevel(value) {
  if (!Number.isFinite(value)) return "unknown";
  if (value >= 10) return "extreme";
  if (value >= 5) return "high";
  if (value >= 2) return "elevated";
  if (value <= -1) return "discount";
  return "normal";
}

function formatShanghai(date = new Date()) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function parseFundGz(text) {
  const match = String(text || "").trim().match(/^jsonpgz\(([\s\S]*)\);?$/);
  if (!match || !match[1].trim()) return null;
  return JSON.parse(match[1]);
}

async function fetchQuotes() {
  const params = new URLSearchParams({
    fltt: "2",
    secids: FUNDS.map(secid).join(","),
    fields: "f12,f13,f14,f2,f3,f4,f5,f6,f20,f21"
  });
  const response = await fetch(`https://push2.eastmoney.com/api/qt/ulist.np/get?${params}`, {
    headers: {
      ...DEFAULT_HEADERS,
      Referer: "https://quote.eastmoney.com/"
    },
    cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
  });

  if (!response.ok) throw new Error(`Eastmoney quote returned ${response.status}`);
  const json = await response.json();
  const rows = json?.data?.diff || [];
  return new Map(rows.map((row) => [String(row.f12), row]));
}

function normalizeYahooQuote(fund, result) {
  const meta = result?.meta || {};
  const quote = result?.indicators?.quote?.[0] || {};
  const lastIndex = Array.isArray(result?.timestamp) ? result.timestamp.length - 1 : -1;
  const close = Array.isArray(quote.close) ? quote.close[lastIndex] : null;
  const previousClose = Number.isFinite(meta.chartPreviousClose) ? meta.chartPreviousClose : null;
  const price = Number.isFinite(meta.regularMarketPrice) ? meta.regularMarketPrice : close;
  const changeAmount = Number.isFinite(price) && Number.isFinite(previousClose) ? price - previousClose : null;
  const changePct = Number.isFinite(changeAmount) && previousClose ? (changeAmount / previousClose) * 100 : null;
  return {
    f12: fund.code,
    f14: meta.longName || meta.shortName || fund.name,
    f2: price,
    f3: changePct,
    f4: changeAmount,
    f5: meta.regularMarketVolume ?? null,
    f6: null,
    f20: null,
    f21: null
  };
}

async function fetchYahooQuote(fund) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol(fund))}?interval=1d&range=5d`;
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
    cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
  });
  if (!response.ok) return null;
  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result) return null;
  return normalizeYahooQuote(fund, result);
}

async function fetchQuotesWithFallback() {
  try {
    return await fetchQuotes();
  } catch {
    const pairs = await Promise.all(FUNDS.map(async (fund) => [fund.code, await fetchYahooQuote(fund)]));
    return new Map(pairs.filter(([, quote]) => quote));
  }
}

async function fetchEstimate(code) {
  try {
    const response = await fetch(`https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`, {
      headers: DEFAULT_HEADERS,
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
    });
    if (!response.ok) return null;
    const payload = parseFundGz(await response.text());
    if (!payload) return null;
    return {
      officialNav: toNumber(payload.dwjz),
      estimatedNav: toNumber(payload.gsz),
      estimatedChangePct: toNumber(payload.gszzl),
      officialNavDate: payload.jzrq || "",
      estimateTime: payload.gztime || "",
      sourceName: payload.name || ""
    };
  } catch {
    return null;
  }
}

function normalizeItem(fund, quote, estimate) {
  const price = toNumber(quote?.f2);
  const estimatedPremiumPct = premiumPct(price, estimate?.estimatedNav);
  const officialPremiumPct = premiumPct(price, estimate?.officialNav);
  const sortPremium = Number.isFinite(estimatedPremiumPct) ? estimatedPremiumPct : officialPremiumPct;

  return {
    code: fund.code,
    market: fund.market,
    secid: secid(fund),
    name: estimate?.sourceName || fund.name || quote?.f14,
    group: fund.group,
    target: fund.target,
    provider: fund.provider,
    price,
    changePct: toNumber(quote?.f3),
    changeAmount: toNumber(quote?.f4),
    volume: toNumber(quote?.f5),
    turnover: toNumber(quote?.f6),
    marketCap: toNumber(quote?.f20),
    estimatedNav: estimate?.estimatedNav ?? null,
    officialNav: estimate?.officialNav ?? null,
    estimatedChangePct: estimate?.estimatedChangePct ?? null,
    estimatedPremiumPct,
    officialPremiumPct,
    premiumPct: sortPremium ?? null,
    riskLevel: riskLevel(sortPremium),
    officialNavDate: estimate?.officialNavDate || "",
    estimateTime: estimate?.estimateTime || "",
    fundPage: `https://fund.eastmoney.com/${fund.code}.html`
  };
}

export async function onRequestGet() {
  try {
    const [quotes, estimates] = await Promise.all([
      fetchQuotesWithFallback(),
      Promise.all(FUNDS.map((fund) => fetchEstimate(fund.code)))
    ]);

    const items = FUNDS.map((fund, index) => normalizeItem(fund, quotes.get(fund.code), estimates[index]))
      .sort((left, right) => {
        const leftPremium = Number.isFinite(left.premiumPct) ? left.premiumPct : -Infinity;
        const rightPremium = Number.isFinite(right.premiumPct) ? right.premiumPct : -Infinity;
        return rightPremium - leftPremium;
      });

    return Response.json({
      ok: true,
      source: "eastmoney-public-quotes-and-fundgz",
      delay: {
        quote: "A-share ETF price is from public quote pages; treat it as roughly 15-minute delayed or source-dependent.",
        estimate: "Estimated NAV uses the public fundgz field and the source-provided estimateTime.",
        officialNav: "Official NAV uses the source-provided officialNavDate and is usually slower than estimated NAV.",
        siteCacheSeconds: CACHE_SECONDS
      },
      updatedAt: new Date().toISOString(),
      fetchedAtShanghai: formatShanghai(),
      itemCount: items.length,
      items
    }, {
      headers: {
        "Cache-Control": `public, max-age=60, s-maxage=${CACHE_SECONDS}`,
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load US ETF premium data"
    }, {
      status: 502,
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
