import { cacheKey, htmlPage, validCode } from "./_shared.js";

export async function onRequestGet({ request }) {
  const code = new URL(request.url).searchParams.get("code") || "";
  if (!validCode(code)) return htmlPage("取书码错误", '<h1>取书码错误</h1><p>请输入4位数字取书码。</p><a class="btn" href="/kindle/">返回取书页</a>', 400);
  const cached = await caches.default.match(cacheKey(request, code));
  if (!cached) return htmlPage("书不存在", '<h1>没有找到这本书</h1><p>取书码可能错误，或文件已经下载/超过10分钟。</p><a class="btn" href="/kindle/">重新输入</a>', 404);
  const name = cached.headers.get("X-Book-Name") || "book";
  return htmlPage("可以下载", `<h1>可以下载</h1><p>${name}</p><a class="btn" href="/api/kindle-share/download?code=${code}">下载并删除</a><p class="muted">下载请求发出后，临时文件会立即从缓存删除。</p>`);
}
