const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  Referer: "https://fund.eastmoney.com/"
};

const CACHE_SECONDS = 900;
const MAX_CODES = 50;
const RETRY_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504, 522, 523, 524]);

function cleanCode(value) {
  const code = String(value || "").trim();
  return /^\d{6}$/.test(code) ? code : "";
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&apos;|&#39;/gi, "'");
}

function cleanText(value) {
  const text = decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text || text === "---" || text === "--") return "";
  return text;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractCell(html, label) {
  const pattern = new RegExp(`<td[^>]*>\\s*${escapeRegExp(label)}\\s*<\\/td>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, "i");
  const match = String(html || "").match(pattern);
  return match ? cleanText(match[1]) : "";
}

function extractTradeStatus(html) {
  const text = cleanText(html);
  const statusMatch = text.match(/交易状态：\s*([^（\s]+)(?:\s*（([^）]+)）)?/);
  if (!statusMatch) return { tradeStatus: "", tradeLimitHint: "" };
  return {
    tradeStatus: statusMatch[1] || "",
    tradeLimitHint: statusMatch[2] || ""
  };
}

function inferCanPurchase(purchaseStatus) {
  if (!purchaseStatus) return null;
  if (/开放申购/.test(purchaseStatus)) return true;
  if (/暂停|停止|不支持|场内交易|封闭期/.test(purchaseStatus)) return false;
  return null;
}

function inferCanRedeem(redemptionStatus) {
  if (!redemptionStatus) return null;
  if (/开放赎回/.test(redemptionStatus)) return true;
  if (/暂停|停止|不支持|场内交易|封闭期/.test(redemptionStatus)) return false;
  return null;
}

function limitText(item) {
  if (/场内交易/.test(item.purchaseStatus || "")) return "无场外申购额度";
  if (/暂停|停止|不支持|封闭期/.test(item.purchaseStatus || "")) return "当前不可申购";
  const parts = [];
  if (item.dailyPurchaseLimit && item.dailyPurchaseLimit !== "无限额") parts.push(`日限 ${item.dailyPurchaseLimit}`);
  if (item.holdingLimit && item.holdingLimit !== "无限额") parts.push(`持仓 ${item.holdingLimit}`);
  if (parts.length) return parts.join(" / ");
  if (item.tradeLimitHint) return item.tradeLimitHint;
  if (/开放申购/.test(item.purchaseStatus || "") && (item.dailyPurchaseLimit === "无限额" || item.holdingLimit === "无限额")) return "无限额";
  if (item.minPurchase) return `起点 ${item.minPurchase}`;
  return "";
}

function redemptionText(item) {
  if (/场内交易/.test(item.redemptionStatus || "")) return "无场外赎回数据";
  if (/暂停|停止|不支持|封闭期/.test(item.redemptionStatus || "")) return "当前不可赎回";
  if (/开放赎回/.test(item.redemptionStatus || "")) return "可赎回";
  return "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function friendlySourceError(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  const statusMatch = message.match(/\b(4\d\d|5\d\d)\b/);
  if (statusMatch) return `源站超时/限流 ${statusMatch[1]}`;
  return "源站暂不可用";
}

async function fetchFundStatus(code) {
  const response = await fetch(`https://fundf10.eastmoney.com/jjfl_${code}.html`, {
    headers: DEFAULT_HEADERS,
    cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
  });

  if (!response.ok) {
    throw new Error(`Eastmoney F10 returned ${response.status}`);
  }

  const html = await response.text();
  const trade = extractTradeStatus(html);
  const item = {
    code,
    purchaseStatus: extractCell(html, "申购状态") || trade.tradeStatus,
    redemptionStatus: extractCell(html, "赎回状态"),
    minPurchase: extractCell(html, "申购起点"),
    dailyPurchaseLimit: extractCell(html, "日累计申购限额"),
    holdingLimit: extractCell(html, "持仓上限"),
    buyConfirm: extractCell(html, "买入确认日"),
    sellConfirm: extractCell(html, "卖出确认日"),
    tradeStatus: trade.tradeStatus,
    tradeLimitHint: trade.tradeLimitHint,
    source: `https://fundf10.eastmoney.com/jjfl_${code}.html`
  };

  item.canPurchase = inferCanPurchase(item.purchaseStatus);
  item.canRedeem = inferCanRedeem(item.redemptionStatus);
  item.maxPurchaseText = limitText(item);
  item.redemptionText = redemptionText(item);
  item.hasPlatformAmountData = !/暂无相关数据/.test(cleanText(html));
  return item;
}

async function fetchFundStatusWithRetry(code) {
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetchFundStatus(code);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error || "");
      const status = Number(message.match(/\b(4\d\d|5\d\d)\b/)?.[1]);
      if (!RETRY_STATUS_CODES.has(status) || attempt === 2) break;
      await sleep(250 + attempt * 500);
    }
  }

  return {
    code,
    error: lastError instanceof Error ? lastError.message : "Unable to load purchase status",
    errorLabel: friendlySourceError(lastError)
  };
}

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const codes = [...new Set((url.searchParams.get("codes") || "")
      .split(",")
      .map(cleanCode)
      .filter(Boolean))]
      .slice(0, MAX_CODES);

    if (!codes.length) {
      return Response.json({
        ok: false,
        error: "Missing fund codes"
      }, {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const items = [];
    for (const code of codes) {
      items.push(await fetchFundStatusWithRetry(code));
      if (codes.length > 1) await sleep(120);
    }

    return Response.json({
      ok: true,
      updatedAt: new Date().toISOString(),
      cacheSeconds: CACHE_SECONDS,
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
      error: error instanceof Error ? error.message : "Unable to load fund purchase status"
    }, {
      status: 502,
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
