const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "*/*",
  Referer: "https://finance.sina.com.cn/"
};

const CACHE_SECONDS = 900;

const PRODUCTS = [
  { key: "IF", nameZh: "沪深300", nameEn: "CSI 300", spotCode: "000300", spotSina: "s_sh000300", productLink: "https://www.cffex.com.cn/cn/hs300.html", accent: "#c58e5b" },
  { key: "IH", nameZh: "上证50", nameEn: "SSE 50", spotCode: "000016", spotSina: "s_sh000016", productLink: "https://www.cffex.com.cn/cn/sz50.html", accent: "#5b8fc5" },
  { key: "IC", nameZh: "中证500", nameEn: "CSI 500", spotCode: "000905", spotSina: "s_sh000905", productLink: "https://www.cffex.com.cn/cn/zz500.html", accent: "#64a36f" },
  { key: "IM", nameZh: "中证1000", nameEn: "CSI 1000", spotCode: "000852", spotSina: "s_sh000852", productLink: "https://www.cffex.com.cn/cn/zz1000.html", accent: "#9b72c9" }
];

function shanghaiParts(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
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
}

function shanghaiNow() {
  const parts = shanghaiParts();
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function toNumber(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function round(value, digits = 4) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(digits));
}

function thirdFriday(year, month) {
  const date = new Date(Date.UTC(year, month - 1, 1));
  const firstFridayOffset = (5 - date.getUTCDay() + 7) % 7;
  date.setUTCDate(1 + firstFridayOffset + 14);
  return date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(dateStr, expiryStr) {
  const from = Date.parse(`${dateStr}T00:00:00Z`);
  const to = Date.parse(`${expiryStr}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.max(0, Math.round((to - from) / 86400000));
}

function currentOrNextContractMonth() {
  const parts = shanghaiParts();
  const yyMm = `${parts.year.slice(2)}${parts.month}`;
  const expiry = thirdFriday(Number(parts.year), Number(parts.month));
  const today = Date.parse(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
  if (today > expiry.getTime()) return addMonths(yyMm, 1);
  return yyMm;
}

function addMonths(yyMm, offset) {
  const year = 2000 + Number(yyMm.slice(0, 2));
  const month = Number(yyMm.slice(2, 4));
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${String(date.getUTCFullYear()).slice(2)}${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function quarterMonthsFrom(yyMm) {
  const year = 2000 + Number(yyMm.slice(0, 2));
  const month = Number(yyMm.slice(2, 4));
  const result = [];
  let cursor = new Date(Date.UTC(year, month, 1));
  while (result.length < 2) {
    const m = cursor.getUTCMonth() + 1;
    if ([3, 6, 9, 12].includes(m)) {
      result.push(`${String(cursor.getUTCFullYear()).slice(2)}${String(m).padStart(2, "0")}`);
    }
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return result;
}

function contractMonths() {
  const current = currentOrNextContractMonth();
  const next = addMonths(current, 1);
  const quarters = quarterMonthsFrom(current);
  return [...new Set([current, next, ...quarters])].slice(0, 4);
}

function expiryDateFromLabel(label) {
  const match = String(label || "").match(/(\d{2})(\d{2})$/);
  if (!match) return "";
  return formatDate(thirdFriday(2000 + Number(match[1]), Number(match[2])));
}

function parseSinaAssignments(text) {
  const map = new Map();
  const pattern = /var hq_str_([^=]+)="([^"]*)";/g;
  let match;
  while ((match = pattern.exec(text))) {
    map.set(match[1], match[2]);
  }
  return map;
}

function parseSpot(raw, fallback) {
  const parts = String(raw || "").split(",");
  return {
    spotName: parts[0] || fallback.nameZh,
    spotPrice: toNumber(parts[1]),
    spotChangePct: toNumber(parts[3])
  };
}

function parseFuture(code, raw) {
  if (!raw) return null;
  const parts = String(raw).split(",");
  const price = toNumber(parts[3]);
  if (!Number.isFinite(price)) return null;
  return {
    code,
    futuresName: parts.at(-1) || code,
    futuresPrice: price,
    futuresChangePct: null,
    volume: toNumber(parts[4]),
    openInterest: toNumber(parts[6]),
    quoteDate: parts[36] || "",
    quoteTime: parts[37] || "",
    isMainContract: parts[39] === "1"
  };
}

async function fetchSina(list) {
  const response = await fetch(`https://hq.sinajs.cn/list=${list.join(",")}`, {
    headers: HEADERS,
    cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
  });
  if (!response.ok) throw new Error(`Sina quote returned ${response.status}`);
  return parseSinaAssignments(new TextDecoder("gb18030").decode(await response.arrayBuffer()));
}

function buildContract(product, future, spot, tradingDate) {
  const expiryDate = expiryDateFromLabel(future.code);
  const daysToExpiry = expiryDate ? daysBetween(tradingDate, expiryDate) : null;
  const basisPoints = Number.isFinite(future.futuresPrice) && Number.isFinite(spot.spotPrice)
    ? future.futuresPrice - spot.spotPrice
    : null;
  const basisRatePct = Number.isFinite(basisPoints) && spot.spotPrice
    ? (basisPoints / spot.spotPrice) * 100
    : null;
  const longCarryRatePct = Number.isFinite(future.futuresPrice) && future.futuresPrice !== 0 && Number.isFinite(spot.spotPrice)
    ? ((spot.spotPrice - future.futuresPrice) / future.futuresPrice) * 100
    : null;
  const annualizedLongCarryRatePct = Number.isFinite(longCarryRatePct) && Number.isFinite(daysToExpiry) && daysToExpiry > 0
    ? (longCarryRatePct * 365) / daysToExpiry
    : null;
  const annualizedBasisRatePct = Number.isFinite(basisRatePct) && Number.isFinite(daysToExpiry) && daysToExpiry > 0
    ? (basisRatePct * 365) / daysToExpiry
    : null;

  return {
    key: `${product.key}-${future.code}`,
    productKey: product.key,
    nameZh: product.nameZh,
    nameEn: product.nameEn,
    spotCode: product.spotCode,
    spotName: spot.spotName || product.nameZh,
    spotPrice: round(spot.spotPrice, 4),
    spotChangePct: round(spot.spotChangePct, 4),
    futuresName: future.futuresName,
    futuresPrice: round(future.futuresPrice, 4),
    futuresChangePct: future.futuresChangePct,
    contractLabel: future.code,
    expiryDate,
    daysToExpiry,
    basisPoints: round(basisPoints, 4),
    basisRatePct: round(basisRatePct, 4),
    longCarryRatePct: round(longCarryRatePct, 4),
    annualizedLongCarryRatePct: round(annualizedLongCarryRatePct, 4),
    annualizedBasisRatePct: round(annualizedBasisRatePct, 4),
    basisSide: Number.isFinite(basisPoints) ? (basisPoints > 0 ? "premium" : basisPoints < 0 ? "discount" : "flat") : "flat",
    isMainContract: future.isMainContract,
    productLink: product.productLink,
    accent: product.accent
  };
}

export async function onRequestGet() {
  try {
    const months = contractMonths();
    const futureCodes = PRODUCTS.flatMap((product) => months.map((month) => `nf_${product.key}${month}`));
    const spotCodes = PRODUCTS.map((product) => product.spotSina);
    const quotes = await fetchSina([...spotCodes, ...futureCodes]);
    const nowParts = shanghaiParts();
    const tradingDate = `${nowParts.year}-${nowParts.month}-${nowParts.day}`;

    const items = PRODUCTS.map((product) => {
      const spot = parseSpot(quotes.get(product.spotSina), product);
      const contracts = months
        .map((month) => {
          const code = `${product.key}${month}`;
          const future = parseFuture(code, quotes.get(`nf_${code}`));
          return future ? buildContract(product, future, spot, tradingDate) : null;
        })
        .filter(Boolean);
      const main = contracts.find((contract) => contract.isMainContract) || contracts[0];
      return {
        ...main,
        key: product.key,
        contracts
      };
    }).filter((item) => item.contracts?.length);

    const payload = {
      ok: true,
      cacheState: "fresh",
      storage: "cloudflare-cache",
      source: "sina-public-quotes",
      note: "Public quote pages cached by the site for 15 minutes. For reference only.",
      delayMinutes: 15,
      updatedAt: new Date().toISOString(),
      tradingDate,
      fetchedAtShanghai: shanghaiNow(),
      itemCount: items.length,
      contractCount: items.reduce((sum, item) => sum + (item.contracts?.length || 0), 0),
      items
    };

    return Response.json(payload, {
      headers: {
        "Cache-Control": `public, max-age=300, s-maxage=${CACHE_SECONDS}`,
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load futures basis data"
    }, {
      status: 502,
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
