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
);

CREATE INDEX IF NOT EXISTS idx_news_published ON news_items (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category_published ON news_items (category, published_at DESC);

CREATE TABLE IF NOT EXISTS news_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
