import { cacheKey, htmlPage, randomCode, TTL_SECONDS, validateBook } from "./_shared.js";

export async function onRequestPost({ request }) {
  try {
    const form = await request.formData();
    const file = form.get("book");
    const error = validateBook(file);
    if (error) return htmlPage("上传失败", `<h1>上传失败</h1><p>${error}</p><a class="btn" href="/kindle-upload/">返回上传</a>`, 400);
    const cache = caches.default;
    let code = "";
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidate = randomCode();
      if (!(await cache.match(cacheKey(request, candidate)))) { code = candidate; break; }
    }
    if (!code) throw new Error("暂时无法生成取书码，请重试");
    const headers = new Headers({
      "Content-Type": file.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.name}"`,
      "X-Book-Name": file.name,
      "Cache-Control": `public, max-age=${TTL_SECONDS}`,
      "Expires": new Date(Date.now() + TTL_SECONDS * 1000).toUTCString()
    });
    await cache.put(cacheKey(request, code), new Response(file.stream(), { headers }));
    return htmlPage("上传成功", `<h1>上传成功</h1><p>取书码：</p><div class="code">${code}</div><p class="muted">10分钟内在 Kindle 取书页输入此码。下载后文件会从临时缓存删除。</p><a class="btn" href="/kindle/?code=${code}">打开取书页</a><a class="btn" href="/kindle-upload/">再传一本</a>`);
  } catch (error) {
    return htmlPage("上传失败", `<h1>上传失败</h1><p>${error instanceof Error ? error.message : "临时服务不可用"}</p><a class="btn" href="/kindle-upload/">返回上传</a>`, 500);
  }
}
