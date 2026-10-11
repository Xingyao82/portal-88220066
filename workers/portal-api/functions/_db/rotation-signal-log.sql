CREATE TABLE IF NOT EXISTS rotation_signal_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_key TEXT NOT NULL,
  market TEXT NOT NULL,
  source_date TEXT NOT NULL,
  signal_date TEXT NOT NULL,
  effective_date TEXT NOT NULL,
  action TEXT NOT NULL,
  risk_state TEXT NOT NULL,
  execution_price TEXT NOT NULL DEFAULT 'next-session-open',
  current_json TEXT NOT NULL,
  holdings_json TEXT NOT NULL,
  ranking_json TEXT NOT NULL,
  stats_json TEXT NOT NULL,
  rules_json TEXT NOT NULL,
  methodology TEXT NOT NULL,
  data_provider TEXT NOT NULL DEFAULT 'Yahoo query1/query2',
  recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(strategy_key, source_date)
);

CREATE INDEX IF NOT EXISTS idx_rotation_signal_market_date
  ON rotation_signal_log(market, source_date DESC);

CREATE TRIGGER IF NOT EXISTS rotation_signal_log_no_update
BEFORE UPDATE ON rotation_signal_log
BEGIN
  SELECT RAISE(ABORT, 'rotation signal records are immutable');
END;

CREATE TRIGGER IF NOT EXISTS rotation_signal_log_no_delete
BEFORE DELETE ON rotation_signal_log
BEGIN
  SELECT RAISE(ABORT, 'rotation signal records are append-only');
END;
