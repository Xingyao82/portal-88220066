const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/rss+xml, application/xml, text/xml, application/json, text/plain"
};

const MAX_ITEMS_PER_SOURCE = 18;
const MAX_AGE_DAYS = 90;
const CACHE_SECONDS = 900;
const ARCHIVE_REFRESH_MS = 15 * 60 * 1000;
const TRANSLATE_LIMIT_PER_REQUEST = 24;
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
    source: "ETF.com",
    url: "https://www.etf.com/feeds/news"
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
    category: "x",
    source: "Google News X Hot",
    url: "https://news.google.com/rss/search?q=Twitter%20X%20trending%20AI%20markets&hl=en-US&gl=US&ceid=US:en"
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
    category: "reddit",
    source: "Google News Reddit Tech",
    url: "https://news.google.com/rss/search?q=reddit%20technology%20AI%20github&hl=en-US&gl=US&ceid=US:en"
  },
  {
    category: "reddit",
    source: "Google News Reddit Investing",
    url: "https://news.google.com/rss/search?q=reddit%20investing%20stocks%20ETF&hl=en-US&gl=US&ceid=US:en"
  }
];

const CATEGORY_LABELS = {
  finance: { zh: "财经", en: "Finance" },
  tech: { zh: "科技", en: "Tech" },
  income: { zh: "Income", en: "Income" },
  ai: { zh: "AI", en: "AI" },
  x: { zh: "X 热门", en: "X Hot" },
  github: { zh: "GitHub 热门", en: "GitHub Hot" },
  reddit: { zh: "Reddit 热门", en: "Reddit Hot" }
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

function parseFeed(xml, sourceConfig) {
  return itemBlocks(xml)
    .slice(0, MAX_ITEMS_PER_SOURCE)
    .map((block) => {
      const title = textBetween(block, "title");
      const link = textBetween(block, "link") || attrValue(block, "link", "href");
      const summary = textBetween(block, "description") || textBetween(block, "summary") || textBetween(block, "content");
      const publishedAt = normalizeDate(textBetween(block, "pubDate") || textBetween(block, "updated") || textBetween(block, "published"));
      if (!title || !link) return null;
      return {
        id: stableId(`${sourceConfig.category}:${link}`),
        category: sourceConfig.category,
        categoryLabel: CATEGORY_LABELS[sourceConfig.category],
        source: sourceConfig.source,
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
    items = await readArchivedItems(db, category, daysParam);
    items = await hydrateMissingTranslations(env, db, items);
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
