ALTER TABLE rotation_signal_log
  ADD COLUMN execution_price TEXT NOT NULL DEFAULT 'legacy-close-to-close';

ALTER TABLE rotation_signal_log
  ADD COLUMN current_json TEXT NOT NULL DEFAULT '{}';
