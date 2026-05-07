const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/rss+xml, application/xml, text/xml, application/json, text/plain"
};

const MAX_ITEMS_PER_SOURCE = 18;
const MAX_AGE_DAYS = 90;
const CACHE_SECONDS = 900;

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
        id: `${sourceConfig.category}:${link}`,
        category: sourceConfig.category,
        categoryLabel: CATEGORY_LABELS[sourceConfig.category],
        source: sourceConfig.source,
        title,
        summary,
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

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const category = (url.searchParams.get("category") || "all").trim().toLowerCase();
  const daysParam = Math.max(1, Math.min(MAX_AGE_DAYS, Number(url.searchParams.get("days") || MAX_AGE_DAYS) || MAX_AGE_DAYS));
  const maxAgeMs = daysParam * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const selectedSources = SOURCES.filter((source) => category === "all" || source.category === category);
  const sourceResults = await Promise.all(selectedSources.map(fetchSource));
  const items = uniqueByUrl(sourceResults.flatMap((result) => result.items))
    .filter((item) => now - new Date(item.publishedAt).getTime() <= maxAgeMs)
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())
    .slice(0, 160);

  return Response.json(
    {
      updatedAt: new Date().toISOString(),
      retentionDays: daysParam,
      storage: "cloudflare-cache-only",
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
