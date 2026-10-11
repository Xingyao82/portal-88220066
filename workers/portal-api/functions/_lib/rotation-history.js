function parse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapRecord(row) {
  return {
    id: row.id,
    strategyKey: row.strategy_key,
    market: row.market,
    sourceDate: row.source_date,
    signalDate: row.signal_date,
    effectiveDate: row.effective_date,
    action: row.action,
    riskState: row.risk_state,
    executionPrice: row.execution_price,
    current: parse(row.current_json, {}),
    holdings: parse(row.holdings_json, []),
    ranking: parse(row.ranking_json, []),
    stats: parse(row.stats_json, {}),
    rules: parse(row.rules_json, []),
    methodology: row.methodology,
    dataProvider: row.data_provider,
    recordedAt: row.recorded_at
  };
}

export async function readRotationHistory(db, strategyKey, limit = 30) {
  if (!db?.prepare) return [];
  const safeLimit = Math.max(1, Math.min(Number(limit) || 30, 100));
  const result = await db.prepare(`
    SELECT id, strategy_key, market, source_date, signal_date, effective_date,
           action, risk_state, execution_price, current_json, holdings_json, ranking_json, stats_json,
           rules_json, methodology, data_provider, recorded_at
    FROM rotation_signal_log
    WHERE strategy_key = ?1
    ORDER BY source_date DESC, id DESC
    LIMIT ?2
  `).bind(strategyKey, safeLimit).all();
  return (result.results || []).map(mapRecord);
}

export async function publishRotationSignal(db, snapshot) {
  if (!db?.prepare) return { ok: false, inserted: false, error: "D1未绑定", history: [] };
  try {
    const result = await db.prepare(`
      INSERT OR IGNORE INTO rotation_signal_log (
        strategy_key, market, source_date, signal_date, effective_date,
        action, risk_state, execution_price, current_json, holdings_json,
        ranking_json, stats_json, rules_json, methodology
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
    `).bind(
      snapshot.strategyKey,
      snapshot.market,
      snapshot.sourceDate,
      snapshot.current.signalDate || snapshot.sourceDate,
      snapshot.current.effectiveDate || "下一交易日",
      snapshot.current.action,
      snapshot.current.riskState,
      snapshot.executionPrice,
      JSON.stringify(snapshot.current),
      JSON.stringify(snapshot.current.holdings || []),
      JSON.stringify((snapshot.ranking || []).map((item) => ({
        symbol: item.symbol,
        name: item.name,
        type: item.type,
        score: item.score,
        qualified: item.qualified,
        returns: item.returns
      }))),
      JSON.stringify(snapshot.stats || {}),
      JSON.stringify(snapshot.rules || []),
      snapshot.methodology
    ).run();
    const history = await readRotationHistory(db, snapshot.strategyKey, 30);
    const current = history.find((row) => row.sourceDate === snapshot.sourceDate) || null;
    return {
      ok: true,
      inserted: Number(result.meta?.changes || 0) > 0,
      immutable: true,
      recordedAt: current?.recordedAt || null,
      history
    };
  } catch (error) {
    return { ok: false, inserted: false, error: error instanceof Error ? error.message : "D1写入失败", history: [] };
  }
}
