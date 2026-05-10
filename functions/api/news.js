const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/rss+xml, application/xml, text/xml, application/json, text/plain"
};

const DEFAULT_ITEMS_PER_SOURCE = 18;
const SOURCE_ITEM_LIMITS = {
  chinafinance: 36,
  xhot: 30
};
const MAX_AGE_DAYS = 90;
const CACHE_SECONDS = 900;
const ARCHIVE_REFRESH_MS = 15 * 60 * 1000;
const TRANSLATE_LIMIT_PER_REQUEST = 72;
const TITLE_MAX_LENGTH = 220;
const SUMMARY_MAX_LENGTH = 700;

const SOURCES = [
  {
    category: "finance",
    source: "CNBC Finance",
    url: "https://www.cnbc.com/id/10000664/device/rss/rss.html"
  },
  {
    category: "finance",
    source: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/rssindex"
  },
  {
    category: "usmarket",
    source: "MarketWatch Markets",
    url: "https://feeds.content.dowjones.io/public/rss/mw_marketpulse"
  },
  {
    category: "usmarket",
    source: "CNBC Markets",
    url: "https://www.cnbc.com/id/15839135/device/rss/rss.html"
  },
  {
    category: "tech",
    source: "The Verge",
    url: "https://www.theverge.com/rss/index.xml"
  },
  {
    category: "tech",
    source: "Hacker News",
    url: "https://hnrss.org/frontpage"
  },
  {
    category: "income",
    source: "ETF Trends Income",
    url: "https://www.etftrends.com/category/fixed-income-channel/feed/"
  },
  {
    category: "income",
    source: "Google News Income ETF",
    url: "https://news.google.com/rss/search?q=income%20ETF%20covered%20call%20ETF%20JEPI%20JEPQ&hl=en-US&gl=US&ceid=US:en"
  },
  {
    category: "income",
    source: "Google News Covered Call ETF",
    url: "https://news.google.com/rss/search?q=covered%20call%20ETF%20income%20ETF%20yield&hl=en-US&gl=US&ceid=US:en"
  },
  {
    category: "income",
    source: "ETF Database",
    url: "https://etfdb.com/feed/"
  },
  {
    category: "etf",
    source: "ETF Trends",
    url: "https://www.etftrends.com/feed/"
  },
  {
    category: "etf",
    source: "ETF Trends ETF Building Blocks",
    url: "https://www.etftrends.com/category/etf-building-blocks-channel/feed/"
  },
  {
    category: "ai",
    source: "Ars Technica AI",
    url: "https://feeds.arstechnica.com/arstechnica/technology-lab"
  },
  {
    category: "ai",
    source: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/"
  },
  {
    category: "xhot",
    source: "AIHOT X 热点",
    url: "https://aihot.virxact.com/feed/all.xml",
    xOnly: true,
    sourceFromAuthor: true
  },
  {
    category: "github",
    source: "GitHub Trending",
    url: "https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml"
  },
  {
    category: "github",
    source: "GitHub Blog",
    url: "https://github.blog/feed/"
  },
  {
    category: "chinafinance",
    source: "Google News China Finance",
    url: "https://news.google.com/rss/search?q=%E4%B8%AD%E5%9B%BD%20%E8%B4%A2%E7%BB%8F%20%E8%82%A1%E5%B8%82&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
  },
  {
    category: "chinafinance",
    source: "Google News China Macro",
    url: "https://news.google.com/rss/search?q=%E4%B8%AD%E5%9B%BD%20%E7%BB%8F%E6%B5%8E%20%E9%87%91%E8%9E%8D&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
  },
  {
    category: "chinafinance",
    source: "Google News A/H Shares",
    url: "https://news.google.com/rss/search?q=A%E8%82%A1%20%E6%B8%AF%E8%82%A1%20%E4%B8%AD%E5%9B%BD%E8%82%A1%E5%B8%82&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
  },
  {
    category: "chinafinance",
    source: "Google News China ETF Funds",
    url: "https://news.google.com/rss/search?q=%E4%B8%AD%E5%9B%BD%20ETF%20%E5%9F%BA%E9%87%91%20%E5%80%BA%E5%88%B8&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
  },
  {
    category: "chinafinance",
    source: "Google News China Finance Media",
    url: "https://news.google.com/rss/search?q=%E8%B4%A2%E6%96%B0%20OR%20%E7%AC%AC%E4%B8%80%E8%B4%A2%E7%BB%8F%20OR%20%E8%B4%A2%E8%81%94%E7%A4%BE&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
  },
  {
    category: "chinafinance",
    source: "Xinhua Finance",
    url: "http://www.news.cn/fortune/news_fortune.xml"
  },
];

const CATEGORY_LABELS = {
  finance: { zh: "财经", en: "Finance" },
  usmarket: { zh: "美股市场", en: "U.S. Markets" },
  ipo: { zh: "新股申购", en: "IPO Subscriptions" },
  tech: { zh: "科技", en: "Tech" },
  income: { zh: "Income", en: "Income" },
  etf: { zh: "ETF / 基金", en: "ETF / Funds" },
  ai: { zh: "AI", en: "AI" },
  xhot: { zh: "X 热点", en: "X Hot" },
  github: { zh: "GitHub 热门", en: "GitHub Hot" },
  chinafinance: { zh: "中国财经", en: "China Finance" }
};

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function stableId(value = "") {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function clampText(value = "", maxLength = SUMMARY_MAX_LENGTH) {
  const normalized = String(value).replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

function stripTags(value = "") {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textBetween(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripTags(match[1]) : "";
}

function attrValue(xml, tag, attr) {
  const match = xml.match(new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "i"));
  return match ? decodeEntities(match[1]).trim() : "";
}

function itemBlocks(xml) {
  const rssItems = [...xml.matchAll(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  if (rssItems.length) return rssItems;
  return [...xml.matchAll(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
}

function normalizeDate(raw) {
  const date = raw ? new Date(stripTags(raw)) : null;
  if (!date || Number.isNaN(date.getTime())) return new Date();
  return date;
}

function cleanFeedAuthor(raw = "") {
  const value = stripTags(raw);
  const xAuthorStart = value.indexOf("(X：");
  if (xAuthorStart >= 0) {
    return value.slice(xAuthorStart + 1).replace(/\)$/, "").trim();
  }
  const wrapped = value.match(/\(([^)]+)\)\s*$/);
  return wrapped ? wrapped[1].trim() : value;
}

function isChineseText(value = "") {
  return /[\u3400-\u9fff]/.test(value);
}

function parseFeed(xml, sourceConfig) {
  const itemLimit = SOURCE_ITEM_LIMITS[sourceConfig.category] || DEFAULT_ITEMS_PER_SOURCE;
  return itemBlocks(xml)
    .slice(0, itemLimit)
    .map((block) => {
      const title = textBetween(block, "title");
      const link = textBetween(block, "link") || attrValue(block, "link", "href");
      const summary = textBetween(block, "description") || textBetween(block, "summary") || textBetween(block, "content");
      const author = cleanFeedAuthor(textBetween(block, "author"));
      const publishedAt = normalizeDate(textBetween(block, "pubDate") || textBetween(block, "updated") || textBetween(block, "published"));
      if (!title || !link) return null;
      if (sourceConfig.xOnly && !/^https:\/\/x\.com\//i.test(link) && !/^X：/.test(author)) return null;
      return {
        id: stableId(`${sourceConfig.category}:${link}`),
        category: sourceConfig.category,
        categoryLabel: CATEGORY_LABELS[sourceConfig.category],
        source: sourceConfig.sourceFromAuthor && author ? author : sourceConfig.source,
        title: clampText(title, TITLE_MAX_LENGTH),
        titleZh: "",
        summary: clampText(summary),
        summaryZh: "",
        url: link,
        publishedAt: publishedAt.toISOString(),
        ageHours: Math.max(0, Math.round((Date.now() - publishedAt.getTime()) / 36e5))
      };
    })
    .filter(Boolean);
}

async function fetchSource(sourceConfig) {
  try {
    const response = await fetch(sourceConfig.url, {
      headers: DEFAULT_HEADERS,
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const items = parseFeed(text, sourceConfig);
    return { source: sourceConfig.source, category: sourceConfig.category, ok: true, count: items.length, items };
  } catch (error) {
    return { source: sourceConfig.source, category: sourceConfig.category, ok: false, count: 0, items: [] };
  }
}

function uniqueByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url.replace(/[?#].*$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stripHtmlTableCell(value = "") {
  return decodeEntities(String(value)).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseDateToIso(value = "") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

async function fetchAshareIpoItems() {
  const today = new Date().toISOString().slice(0, 10);
  const url = new URL("https://datacenter-web.eastmoney.com/api/data/v1/get");
  Object.entries({
    reportName: "RPTA_APP_IPOAPPLY",
    columns: "SECURITY_CODE,SECURITY_NAME,APPLY_DATE,APPLY_CODE,TRADE_MARKET,MARKET_TYPE_NEW,ONLINE_APPLY_UPPER,ISSUE_NUM,SECUCODE",
    sortColumns: "APPLY_DATE,SECURITY_CODE",
    sortTypes: "-1,-1",
    pageSize: "20",
    pageNumber: "1",
    source: "WEB",
    client: "WEB",
    filter: `((APPLY_DATE>='${today}'))`
  }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url.toString(), {
    headers: { ...DEFAULT_HEADERS, Referer: "https://data.eastmoney.com/" },
    cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  return (payload?.result?.data || []).slice(0, 12).map((row) => {
    const applyDate = row.APPLY_DATE ? row.APPLY_DATE.slice(0, 10) : today;
    const market = [row.TRADE_MARKET, row.MARKET_TYPE_NEW].filter(Boolean).join(" / ");
    const limitText = row.ONLINE_APPLY_UPPER ? `申购上限 ${row.ONLINE_APPLY_UPPER}` : "申购上限待更新";
    const issueNum = row.ISSUE_NUM ? `发行 ${row.ISSUE_NUM} 万股` : "发行规模待更新";
    return {
      id: stableId(`ipo:ashare:${row.SECUCODE || row.SECURITY_CODE}`),
      category: "ipo",
      categoryLabel: CATEGORY_LABELS.ipo,
      source: "A股新股申购",
      title: `${row.SECURITY_NAME} ${applyDate} 申购`,
      titleZh: `${row.SECURITY_NAME} ${applyDate} 申购`,
      summary: `${market}. Apply code ${row.APPLY_CODE || "-"}. ${limitText}. ${issueNum}.`,
      summaryZh: `${market}。申购代码 ${row.APPLY_CODE || "-" }。${limitText}。${issueNum}。`,
      url: "https://data.eastmoney.com/xg/xg/default.html",
      publishedAt: parseDateToIso(applyDate),
      ageHours: 0
    };
  });
}

async function fetchUsIpoItems() {
  const response = await fetch("https://stockanalysis.com/ipos/calendar/", {
    headers: DEFAULT_HEADERS,
    cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const rows = [...html.matchAll(/<tr class="svelte-[^"]*">([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
  const currentYear = new Date().getFullYear();
  return rows.map((row) => {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => stripHtmlTableCell(cell[1]));
    if (cells.length < 4) return null;
    const [ipoDate, symbol, company, exchange, priceRange = "", shares = "", dealSize = ""] = cells;
    const parsedDate = new Date(`${ipoDate} ${currentYear}`);
    const thisYearIso = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
    const summary = [exchange, priceRange && `Price ${priceRange}`, shares && `Shares ${shares}`, dealSize && `Deal ${dealSize}`].filter(Boolean).join(". ");
    return {
      id: stableId(`ipo:us:${symbol}:${ipoDate}`),
      category: "ipo",
      categoryLabel: CATEGORY_LABELS.ipo,
      source: "港美股当日申购 / IPO",
      title: `${symbol} ${ipoDate} IPO`,
      titleZh: "",
      summary,
      summaryZh: "",
      url: `https://stockanalysis.com/stocks/${String(symbol).toLowerCase()}/`,
      publishedAt: thisYearIso,
      ageHours: 0
    };
  }).filter(Boolean).slice(0, 12);
}

async function fetchIpoItems(env) {
  const results = await Promise.allSettled([fetchAshareIpoItems(), fetchUsIpoItems()]);
  const items = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const unique = uniqueByUrl(items);
  if (!env.AI) return unique;
  const translated = await Promise.all(unique.slice(0, TRANSLATE_LIMIT_PER_REQUEST).map((item) => translateItem(env, item)));
  const translatedById = new Map(translated.map((item) => [item.id, item]));
  return unique.map((item) => translatedById.get(item.id) || item);
}

function hasD1(env = {}) {
  return Boolean(env.NEWS_DB?.prepare);
}

async function ensureSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      title_zh TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      summary_zh TEXT DEFAULT '',
      url TEXT NOT NULL UNIQUE,
      published_at TEXT NOT NULL,
      inserted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_news_published ON news_items (published_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_news_category_published ON news_items (category, published_at DESC)").run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS news_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
}

async function readLastRefresh(db) {
  const row = await db.prepare("SELECT value FROM news_meta WHERE key = 'last_refresh'").first();
  return row?.value ? new Date(row.value).getTime() : 0;
}

async function writeLastRefresh(db, value) {
  await db.prepare(`
    INSERT INTO news_meta (key, value, updated_at)
    VALUES ('last_refresh', ?1, ?1)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).bind(value).run();
}

async function pruneArchive(db, days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  await db.prepare("DELETE FROM news_items WHERE published_at < ?1").bind(cutoff).run();
}

function rowToItem(row) {
  return {
    id: row.id,
    category: row.category,
    categoryLabel: CATEGORY_LABELS[row.category],
    source: row.source,
    title: row.title,
    titleZh: row.title_zh || "",
    summary: row.summary || "",
    summaryZh: row.summary_zh || "",
    url: row.url,
    publishedAt: row.published_at,
    ageHours: Math.max(0, Math.round((Date.now() - new Date(row.published_at).getTime()) / 36e5))
  };
}

async function readArchivedItems(db, category, days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const statement = category === "all"
    ? db.prepare("SELECT * FROM news_items WHERE published_at >= ?1 ORDER BY published_at DESC LIMIT 240").bind(cutoff)
    : db.prepare("SELECT * FROM news_items WHERE category = ?1 AND published_at >= ?2 ORDER BY published_at DESC LIMIT 240").bind(category, cutoff);
  const result = await statement.all();
  return (result.results || []).map(rowToItem);
}

async function translateText(env, text) {
  if (!env.AI || !text) return "";
  try {
    const result = await env.AI.run("@cf/meta/m2m100-1.2b", {
      text: clampText(text, SUMMARY_MAX_LENGTH),
      source_lang: "en",
      target_lang: "zh"
    });
    return clampText(result?.translated_text || result?.translation || "", SUMMARY_MAX_LENGTH);
  } catch (error) {
    return "";
  }
}

async function translateItem(env, item) {
  if (isChineseText(`${item.title} ${item.summary}`)) {
    return {
      ...item,
      titleZh: item.titleZh || item.title,
      summaryZh: item.summaryZh || item.summary
    };
  }
  if (!env.AI) return item;
  const [titleZh, summaryZh] = await Promise.all([
    translateText(env, item.title),
    translateText(env, item.summary)
  ]);
  return {
    ...item,
    titleZh: titleZh || item.titleZh || "",
    summaryZh: summaryZh || item.summaryZh || ""
  };
}

async function upsertItems(db, items) {
  const nowIso = new Date().toISOString();
  const statements = items.map((item) => db.prepare(`
    INSERT INTO news_items (
      id, category, source, title, title_zh, summary, summary_zh, url, published_at, inserted_at, updated_at
    )
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
    ON CONFLICT(url) DO UPDATE SET
      category = excluded.category,
      source = excluded.source,
      title = excluded.title,
      title_zh = CASE WHEN news_items.title_zh = '' THEN excluded.title_zh ELSE news_items.title_zh END,
      summary = excluded.summary,
      summary_zh = CASE WHEN news_items.summary_zh = '' THEN excluded.summary_zh ELSE news_items.summary_zh END,
      published_at = excluded.published_at,
      updated_at = excluded.updated_at
  `).bind(
    item.id,
    item.category,
    item.source,
    item.title,
    item.titleZh || "",
    item.summary || "",
    item.summaryZh || "",
    item.url,
    item.publishedAt,
    nowIso
  ));

  if (statements.length) await db.batch(statements);
}

async function hydrateMissingTranslations(env, db, items) {
  if (!env.AI) return items;
  const missing = items
    .filter((item) => !item.titleZh)
    .slice(0, TRANSLATE_LIMIT_PER_REQUEST);
  if (!missing.length) return items;

  const translated = await Promise.all(missing.map((item) => translateItem(env, item)));
  await upsertItems(db, translated);
  const translatedById = new Map(translated.map((item) => [item.id, item]));
  return items.map((item) => translatedById.get(item.id) || item);
}

async function fetchFreshNews(env, category) {
  if (category === "ipo") {
    const items = await fetchIpoItems(env);
    return {
      sourceResults: [
        { source: "A股新股申购", category: "ipo", ok: items.some((item) => item.source === "A股新股申购"), count: items.filter((item) => item.source === "A股新股申购").length, items: [] },
        { source: "港美股当日申购 / IPO", category: "ipo", ok: items.some((item) => item.source === "港美股当日申购 / IPO"), count: items.filter((item) => item.source === "港美股当日申购 / IPO").length, items: [] }
      ],
      items
    };
  }
  if (category === "all") {
    const ipoItems = await fetchIpoItems(env);
    const selectedSources = SOURCES;
    const sourceResults = await Promise.all(selectedSources.map(fetchSource));
    const items = uniqueByUrl([...sourceResults.flatMap((result) => result.items), ...ipoItems]);
    return {
      sourceResults: [
        ...sourceResults,
        { source: "A股新股申购", category: "ipo", ok: ipoItems.some((item) => item.source === "A股新股申购"), count: ipoItems.filter((item) => item.source === "A股新股申购").length, items: [] },
        { source: "港美股当日申购 / IPO", category: "ipo", ok: ipoItems.some((item) => item.source === "港美股当日申购 / IPO"), count: ipoItems.filter((item) => item.source === "港美股当日申购 / IPO").length, items: [] }
      ],
      items
    };
  }
  const selectedSources = SOURCES.filter((source) => category === "all" || source.category === category);
  const sourceResults = await Promise.all(selectedSources.map(fetchSource));
  const items = uniqueByUrl(sourceResults.flatMap((result) => result.items));
  if (!env.AI) return { sourceResults, items };

  const translated = await Promise.all(items.slice(0, TRANSLATE_LIMIT_PER_REQUEST).map((item) => translateItem(env, item)));
  const translatedById = new Map(translated.map((item) => [item.id, item]));
  return {
    sourceResults,
    items: items.map((item) => translatedById.get(item.id) || item)
  };
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const env = context.env || {};
  const category = (url.searchParams.get("category") || "all").trim().toLowerCase();
  const translateCategory = (url.searchParams.get("translateCategory") || "").trim().toLowerCase();
  const daysParam = Math.max(1, Math.min(MAX_AGE_DAYS, Number(url.searchParams.get("days") || MAX_AGE_DAYS) || MAX_AGE_DAYS));
  const maxAgeMs = daysParam * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let sourceResults = [];
  let storage = "cloudflare-cache-only";
  let translation = "unavailable";
  let items = [];

  if (hasD1(env)) {
    const db = env.NEWS_DB;
    storage = "d1";
    translation = env.AI ? "cloudflare-ai" : "unavailable";
    await ensureSchema(db);
    const lastRefresh = await readLastRefresh(db);
    if (now - lastRefresh > ARCHIVE_REFRESH_MS) {
      const fresh = await fetchFreshNews(env, "all");
      sourceResults = fresh.sourceResults;
      await upsertItems(db, fresh.items);
      await pruneArchive(db, MAX_AGE_DAYS);
      await writeLastRefresh(db, new Date().toISOString());
    }
    const readCategory = translateCategory || category;
    items = await readArchivedItems(db, readCategory, daysParam);
    items = await hydrateMissingTranslations(env, db, items);
    if (translateCategory && category !== translateCategory) {
      const translatedById = new Map(items.map((item) => [item.id, item]));
      items = (await readArchivedItems(db, category, daysParam)).map((item) => translatedById.get(item.id) || item);
    }
  } else {
    const fresh = await fetchFreshNews(env, category);
    sourceResults = fresh.sourceResults;
    translation = env.AI ? "cloudflare-ai-live" : "unavailable";
    items = fresh.items
      .filter((item) => now - new Date(item.publishedAt).getTime() <= maxAgeMs)
      .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
  }

  items = items.slice(0, 160);

  return Response.json(
    {
      updatedAt: new Date().toISOString(),
      retentionDays: daysParam,
      storage,
      translation,
      categories: CATEGORY_LABELS,
      sources: sourceResults.map(({ source, category: sourceCategory, ok, count }) => ({ source, category: sourceCategory, ok, count })),
      items
    },
    {
      headers: {
        "Cache-Control": `public, max-age=300, s-maxage=${CACHE_SECONDS}`,
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
