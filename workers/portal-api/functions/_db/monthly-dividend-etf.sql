CREATE TABLE IF NOT EXISTS monthly_dividend_funds (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  market TEXT NOT NULL,
  price REAL,
  dividend_ttm REAL,
  yield_ttm REAL,
  count_ttm INTEGER,
  stability TEXT,
  stability_text TEXT,
  trend TEXT,
  latest_register_date TEXT,
  as_of_date TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  data_status TEXT NOT NULL DEFAULT 'ok'
);

CREATE TABLE IF NOT EXISTS monthly_dividend_distributions (
  code TEXT NOT NULL,
  register_date TEXT NOT NULL,
  ex_date TEXT,
  per10 REAL NOT NULL,
  pay_date TEXT,
  source_url TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  PRIMARY KEY (code, register_date)
);

CREATE INDEX IF NOT EXISTS idx_monthly_dividend_register_date
  ON monthly_dividend_distributions (register_date DESC);

CREATE TABLE IF NOT EXISTS monthly_dividend_sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL,
  as_of_date TEXT NOT NULL,
  status TEXT NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  error_summary TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_monthly_dividend_sync_runs_finished
  ON monthly_dividend_sync_runs (finished_at DESC);
