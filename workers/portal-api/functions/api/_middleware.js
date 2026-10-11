const PATHS = new Set(['/api/total-return','/api/us-sectors','/api/us-sector-performance','/api/a-share-sectors','/api/a-share-sector-performance','/api/monthly-dividend-etfs','/api/us-etf-premium','/api/portfolio-quotes','/api/finance/futures-basis']);
function usable(path, body) {
  if (!body || body.error || body.ok === false) return false;
  if (path === '/api/total-return') return body.series?.length >= 2 && Number.isFinite(body.totalReturnPct);
  if (path.includes('sector')) return body.items?.some(row => Number.isFinite(row.price) || Number.isFinite(row.change1d) || Number.isFinite(row.returns?.d1));
  if (path === '/api/portfolio-quotes' || path === '/api/monthly-dividend-etfs') return body.items?.some(row => row.ok !== false && Number.isFinite(row.price));
  if (path === '/api/finance/futures-basis') return body.items?.some(row => Number.isFinite(row.spotPrice) && Number.isFinite(row.futuresPrice));
  return true;
}
function result(body, state, savedAt) {
  return Response.json(body, {headers:{'Access-Control-Allow-Origin':'*','Cache-Control':state === 'stale' ? 'public, max-age=30' : 'public, max-age=60','X-Data-Status':state,'X-Data-Saved-At':savedAt,'X-API-Release':'20261011-resilience-1'}});
}
export async function onRequest(context) {
  const url = new URL(context.request.url); url.searchParams.sort();
  const path = url.pathname.replace(/\/$/, '');
  if (context.request.method !== 'GET' || !PATHS.has(path)) return context.next();
  const key = path + url.search;
  const cacheKey = new Request('https://88220066.xyz/__api-cache/v1' + key);
  const hit = await caches.default.match(cacheKey);
  if (hit) return hit;
  let saved;
  try {
    if (context.env.NEWS_DB) saved = await context.env.NEWS_DB.prepare('SELECT payload,saved_at FROM api_success_snapshots WHERE cache_key=?').bind(key).first();
    if (saved && Date.now()-Date.parse(saved.saved_at)<300000) return result(JSON.parse(saved.payload),'cached',saved.saved_at);
  } catch (error) { console.warn(JSON.stringify({event:'snapshot-read-failed',path,error:error.message})); }
  let response;
  try {
    response = await context.next();
    if (response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
      const body = await response.clone().json();
      if (usable(path,body)) {
        const now = new Date().toISOString(); body.stale=false; body.fetchedAt=now;
        const reply = result(body,'live',now);
        context.waitUntil(caches.default.put(cacheKey,reply.clone()).catch(error=>console.warn(error.message)));
        if (context.env.NEWS_DB) context.waitUntil(context.env.NEWS_DB.prepare('INSERT INTO api_success_snapshots(cache_key,payload,saved_at) VALUES(?,?,?) ON CONFLICT(cache_key) DO UPDATE SET payload=excluded.payload,saved_at=excluded.saved_at').bind(key,JSON.stringify(body),now).run().catch(error=>console.warn(JSON.stringify({event:'snapshot-write-failed',path,error:error.message}))));
        return reply;
      }
    }
  } catch (error) { console.error(JSON.stringify({event:'api-failed',path,error:error.message})); response=Response.json({ok:false,error:'All data sources unavailable'},{status:502}); }
  const maxAge = (path === '/api/total-return' ? 7 : 3)*86400000;
  if (saved && Date.now()-Date.parse(saved.saved_at)<=maxAge) {
    const body=JSON.parse(saved.payload); body.stale=true; body.snapshotAt=saved.saved_at;
    body.notice='数据源暂不可用，显示最近成功数据；请核对数据时间。';
    if (body.source) body.source+=` (cached ${saved.saved_at})`;
    return result(body,'stale',saved.saved_at);
  }
  return response;
}
