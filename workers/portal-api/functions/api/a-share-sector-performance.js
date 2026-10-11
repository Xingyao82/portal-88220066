import { onRequestGet as getSectors } from "./a-share-sectors.js";
function toReturns(row) {
  return {
    d1: row.change1d,
    d5: row.change5d,
    d20: row.change20d,
    d60: row.change60d,
    ytd: row.changeYtd
  };
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") || 20);
  const limit = Number.isFinite(requestedLimit) ? Math.min(1000, Math.max(1, Math.trunc(requestedLimit))) : 20;
  const type = url.searchParams.get("type") || "all";
  if (!["all", "industry", "concept"].includes(type)) {
    return Response.json({ ok: false, error: "Invalid sector type" }, { status: 400 });
  }
  const response = await getSectors(context);
  const payload = await response.json();
  const items = (payload.items || [])
    .filter((row) => type === "all" || row.category === type)
    .sort((a, b) => (Number.isFinite(b.change1d) ? b.change1d : -Infinity) - (Number.isFinite(a.change1d) ? a.change1d : -Infinity))
    .slice(0, limit)
    .map((row) => ({
    code: row.code,
    symbol: row.code,
    name: row.name,
    source: `/a-share-sectors/?code=${encodeURIComponent(row.code || "")}`,
    returns: toReturns(row)
  }));

  return Response.json({
    ok: payload.ok !== false,
    updatedAt: payload.updatedAt || new Date().toISOString(),
    dataSource: payload.dataSource,
    partial: payload.partial,
    cacheSeconds: payload.cacheSeconds || 300,
    itemCount: items.length,
    items
  }, {
    status: response.ok ? 200 : response.status,
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
