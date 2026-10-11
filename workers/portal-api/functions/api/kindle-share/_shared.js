const TTL_SECONDS = 600;
const ALLOWED_EXTENSIONS = new Set(["azw", "prc", "mobi", "txt"]);
const MAX_BYTES = 24 * 1024 * 1024;

export function cacheKey(request, code) {
  const url = new URL(request.url);
  return new Request(`${url.origin}/__kindle-cache/${code}`, { method: "GET" });
}

export function validCode(code) {
  return /^\d{4}$/.test(String(code || ""));
}

export function validateBook(file) {
  if (!(file instanceof File) || !file.size) return "请选择一本书";
  if (file.size > MAX_BYTES) return "文件超过24MB上限";
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(extension)) return "只支持 azw、prc、mobi、txt";
  if (!/^[A-Za-z0-9._-]+$/.test(file.name)) return "文件名只能使用英文字母、数字、点、下划线和短横线";
  return "";
}

export function randomCode() {
  const bytes = new Uint16Array(1);
  crypto.getRandomValues(bytes);
  return String(1000 + (bytes[0] % 9000));
}

export function htmlPage(title, body, status = 200) {
  return new Response(`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{margin:0;background:#f8f6f2;color:#221b14;font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.box{width:min(680px,calc(100% - 28px));margin:48px auto;padding:28px;background:#fff;border:1px solid #e4ddd5;border-radius:8px}h1{margin-top:0}.code{font-size:48px;font-weight:800;letter-spacing:.18em;color:#3677ff}.btn{display:inline-flex;padding:10px 16px;background:#3677ff;color:#fff;text-decoration:none;border-radius:8px;margin-right:8px}.muted{color:#756b61}</style></head><body><main class="box">${body}</main></body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export { TTL_SECONDS };
