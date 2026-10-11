CREATE TABLE IF NOT EXISTS us_fundamental_snapshots (
  as_of_date TEXT NOT NULL,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  in_sp500 INTEGER NOT NULL DEFAULT 0,
  market_cap_rank INTEGER,
  market_cap REAL NOT NULL,
  price REAL NOT NULL,
  average_dollar_volume REAL NOT NULL,
  adjusted_net_income REAL NOT NULL,
  adjusted_earnings_growth_yoy REAL NOT NULL,
  ebit REAL NOT NULL,
  enterprise_value REAL NOT NULL,
  operating_cash_flow REAL NOT NULL,
  capex REAL NOT NULL,
  dividends_paid REAL NOT NULL DEFAULT 0,
  share_repurchases REAL NOT NULL DEFAULT 0,
  share_issuance REAL NOT NULL DEFAULT 0,
  book_value REAL,
  revenue REAL,
  debt_to_assets REAL NOT NULL,
  interest_coverage REAL NOT NULL,
  roic REAL NOT NULL,
  source TEXT NOT NULL,
  filed_at TEXT,
  ingested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (as_of_date, symbol)
);

CREATE INDEX IF NOT EXISTS idx_us_fundamentals_date_cap
ON us_fundamental_snapshots(as_of_date DESC, market_cap DESC);

CREATE INDEX IF NOT EXISTS idx_us_fundamentals_symbol_date
ON us_fundamental_snapshots(symbol, as_of_date DESC);
