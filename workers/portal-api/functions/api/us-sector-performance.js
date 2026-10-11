import { onRequestGet as getSectors } from "./us-sectors.js";
function toReturns(row) {
  return {
    d1: row.change1d,
    d5: row.change5d,
    d20: row.change20d,
    d60: row.change60d
  };
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const response = await getSectors(context);
  const payload = await response.json();
  const items = (payload.items || []).map((row) => ({
    code: row.symbol,
    symbol: row.symbol,
    name: row.name,
    zh: row.zh,
    source: `/us-sectors/?symbol=${encodeURIComponent(row.symbol || "")}`,
    returns: toReturns(row)
  }));

  return Response.json({
    ok: payload.ok !== false,
    updatedAt: payload.updatedAt || new Date().toISOString(),
    dataSource: payload.dataSource,
    partial: payload.partial,
    cacheSeconds: payload.cacheSeconds || 900,
    itemCount: items.length,
    items
  }, {
    status: response.ok ? 200 : response.status,
    headers: {
      "Cache-Control": "public, max-age=120, s-maxage=900",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
