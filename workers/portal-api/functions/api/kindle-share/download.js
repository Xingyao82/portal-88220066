import { cacheKey, htmlPage, validCode } from "./_shared.js";

export async function onRequestGet({ request, waitUntil }) {
  const code = new URL(request.url).searchParams.get("code") || "";
  if (!validCode(code)) return htmlPage("取书码错误", "<h1>取书码错误</h1>", 400);
  const cache = caches.default;
  const key = cacheKey(request, code);
  const cached = await cache.match(key);
  if (!cached) return htmlPage("书不存在", '<h1>文件已不存在</h1><p>可能已下载或超过10分钟。</p><a class="btn" href="/kindle/">返回</a>', 404);
  waitUntil(cache.delete(key));
  const headers = new Headers(cached.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(cached.body, { status: 200, headers });
}
