const MAX_FRESH_HOURS = 36;

function isFresh(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) && Date.now() - timestamp <= MAX_FRESH_HOURS * 60 * 60 * 1000;
}

export async function onRequestGet({ env }) {
  if (!env.NEWS_DB?.prepare) {
    return Response.json({ ok: false, error: "D1 数据库未连接" }, { status: 503 });
  }

  const [fundsResult, runResult] = await Promise.all([
    env.NEWS_DB.prepare(`
      SELECT code, name, type, market, price, dividend_ttm, yield_ttm, count_ttm,
             stability, stability_text, trend, latest_register_date, as_of_date,
             updated_at, data_status
      FROM monthly_dividend_funds
      WHERE data_status = 'ok'
      ORDER BY yield_ttm DESC, code ASC
    `).all(),
    env.NEWS_DB.prepare(`
      SELECT finished_at, as_of_date, status, success_count, failure_count, error_summary
      FROM monthly_dividend_sync_runs
      ORDER BY id DESC
      LIMIT 1
    `).first()
  ]);

  const items = (fundsResult.results || []).map((row) => ({
    code: row.code,
    name: row.name,
    type: row.type,
    market: row.market,
    price: Number(row.price),
    dividend: Number(row.dividend_ttm),
    yield: Number(row.yield_ttm),
    count: Number(row.count_ttm),
    stability: row.stability,
    stabilityText: row.stability_text,
    trend: row.trend,
    latest: row.latest_register_date,
    asOfDate: row.as_of_date,
    updatedAt: row.updated_at,
    source: `https://fundf10.eastmoney.com/fhsp_${row.code}.html`
  }));

  const lastSuccessfulAt = ["ok", "partial"].includes(runResult?.status) ? runResult.finished_at : null;
  const fresh = Boolean(runResult?.status === "ok" && lastSuccessfulAt && isFresh(lastSuccessfulAt));
  return Response.json({
    ok: items.length > 0,
    items,
    asOfDate: runResult?.as_of_date || items[0]?.asOfDate || null,
    lastSuccessfulAt,
    fresh,
    status: runResult?.status || "never",
    successCount: Number(runResult?.success_count || 0),
    failureCount: Number(runResult?.failure_count || 0),
    errorSummary: runResult?.error_summary || "",
    staleAfterHours: MAX_FRESH_HOURS
  }, {
    status: items.length > 0 ? 200 : 503,
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
