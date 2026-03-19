const baseItems = [
  { name: "OpenRouter", region: "region_global", compat: "compat_openai", freeType: "free_models", badge: "Free models", note: "Unified router for many providers.", summary: "Useful when you want one OpenAI-compatible entry point for multiple models.", tags: ["router", "openai", "docs"], url: "https://openrouter.ai/", accent: "#3f8cff" },
  { name: "GroqCloud", region: "region_global", compat: "compat_native", freeType: "free_daily", badge: "Fast", note: "Great for low-latency inference.", summary: "A strong choice for quick chat and lightweight tool integrations.", tags: ["speed", "chat", "inference"], url: "https://console.groq.com/", accent: "#ff8a34" },
  { name: "Gemini API", region: "region_global", compat: "compat_native", freeType: "free_daily", badge: "Multimodal", note: "Common pick for text plus image input.", summary: "Fits multimodal experiments and projects inside the Google ecosystem.", tags: ["google", "multimodal", "sdk"], url: "https://ai.google.dev/", accent: "#00b894" },
  { name: "Cloudflare Workers AI", region: "region_global", compat: "compat_native", freeType: "free_daily", badge: "Edge", note: "Pairs naturally with Cloudflare Workers.", summary: "Convenient if your app already runs on Cloudflare and you want edge inference.", tags: ["cloudflare", "edge", "deploy"], url: "https://developers.cloudflare.com/workers-ai/", accent: "#f6b93b" },
  { name: "GitHub Models", region: "region_global", compat: "compat_multi", freeType: "free_sandbox", badge: "Sandbox", note: "Friendly for GitHub-based prototyping.", summary: "Useful for comparing models and testing ideas during development.", tags: ["github", "compare", "prototype"], url: "https://github.com/marketplace/models", accent: "#8e7dff" },
  { name: "Hugging Face Inference", region: "region_global", compat: "compat_multi", freeType: "free_credits", badge: "Many models", note: "Good for exploring open-weight models.", summary: "Helpful when you want broad provider coverage and open-source model access.", tags: ["open-source", "models", "ecosystem"], url: "https://huggingface.co/inference-api", accent: "#ffd166" },
  { name: "Together AI", region: "region_global", compat: "compat_openai", freeType: "free_credits", badge: "Open models", note: "Often used for open-model experiments.", summary: "A practical option for trying text and image models with OpenAI-style APIs.", tags: ["open-models", "openai", "experiments"], url: "https://www.together.ai/", accent: "#5cc8ff" },
  { name: "Fireworks AI", region: "region_global", compat: "compat_openai", freeType: "free_credits", badge: "Engineering", note: "Feels production-oriented.", summary: "Handy for service-side integrations and more engineering-focused API work.", tags: ["backend", "openai", "engineering"], url: "https://fireworks.ai/", accent: "#ff6b81" },
  { name: "SiliconFlow", region: "region_cn", compat: "compat_openai", freeType: "free_models", badge: "CN friendly", note: "Common among Chinese developers.", summary: "A solid domestic option with open-model coverage and easy initial integration.", tags: ["china", "open-models", "cn"], url: "https://siliconflow.cn/", accent: "#00c2a8" },
  { name: "Aliyun Bailian", region: "region_cn", compat: "compat_native", freeType: "free_credits", badge: "Enterprise", note: "Strong domestic docs and ecosystem.", summary: "Well suited to enterprise-flavored projects and platform-style integrations.", tags: ["aliyun", "enterprise", "docs"], url: "https://bailian.console.aliyun.com/", accent: "#ffb347" },
  { name: "Volcengine Ark", region: "region_cn", compat: "compat_openai", freeType: "free_credits", badge: "CN platform", note: "Reasonable entry barrier.", summary: "Useful for trying multiple model APIs through a domestic platform workflow.", tags: ["volcengine", "china", "integration"], url: "https://www.volcengine.com/product/ark", accent: "#5f7cff" },
  { name: "Zhipu Open Platform", region: "region_cn", compat: "compat_native", freeType: "free_credits", badge: "Chinese models", note: "Often used for Chinese Q and A and agent tests.", summary: "A common choice for Chinese chat, writing, and lightweight agent scenarios.", tags: ["glm", "china", "agent"], url: "https://open.bigmodel.cn/", accent: "#36a2ff" },
  { name: "MiniMax Open Platform", region: "region_cn", compat: "compat_native", freeType: "free_credits", badge: "Multimodal", note: "Shows up in text and audio scenarios.", summary: "Useful for validating voice, multimodal, and conversation-oriented products.", tags: ["voice", "china", "multimodal"], url: "https://www.minimaxi.com/platform", accent: "#4fd1c5" },
  { name: "Moonshot Open Platform", region: "region_cn", compat: "compat_native", freeType: "free_credits", badge: "Long context", note: "Fits document-heavy apps.", summary: "Common for long-context understanding, document Q and A, and reading tools.", tags: ["long-context", "documents", "china"], url: "https://platform.moonshot.cn/", accent: "#8f7dff" },
  { name: "ModelScope API", region: "region_cn", compat: "compat_multi", freeType: "free_sandbox", badge: "Open-source", note: "More experimental in nature.", summary: "Helpful for quickly testing domestic open-source models and workflows.", tags: ["open-source", "china", "experiments"], url: "https://www.modelscope.cn/", accent: "#00a8ff" },
  { name: "Cerebras Inference", region: "region_global", compat: "compat_openai", freeType: "free_sandbox", badge: "Very fast", note: "Good for speed comparisons.", summary: "Worth trying if you want to feel especially fast text inference responses.", tags: ["speed", "openai", "developer"], url: "https://www.cerebras.ai/inference", accent: "#ff7675" }
];

const KV_KEY = "free-models:latest";
const CACHE_SECONDS = 300;

function buildPayload() {
  const now = new Date();
  return {
    source: "cloudflare-worker-kv",
    updatedAt: now.toISOString().slice(0, 10),
    lastSyncedAt: now.toISOString(),
    items: baseItems
  };
}

const jsonHeaders = {
  "content-type": "application/json; charset=UTF-8",
  "cache-control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
  "access-control-allow-origin": "*"
};

async function readPayload(env) {
  if (!env || !env.FREE_MODELS_KV) {
    return { payload: buildPayload(), storage: "embedded" };
  }

  const cached = await env.FREE_MODELS_KV.get(KV_KEY, "json");
  if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
    return { payload: cached, storage: "kv" };
  }

  const seeded = buildPayload();
  await env.FREE_MODELS_KV.put(KV_KEY, JSON.stringify(seeded));
  return { payload: seeded, storage: "seeded" };
}

async function refreshPayload(env, reason) {
  const payload = buildPayload();

  if (env && env.FREE_MODELS_KV) {
    await env.FREE_MODELS_KV.put(KV_KEY, JSON.stringify(payload));
  }

  console.log(JSON.stringify({
    type: "free-models-refresh",
    reason,
    providerCount: payload.items.length,
    updatedAt: payload.updatedAt,
    lastSyncedAt: payload.lastSyncedAt
  }));

  return payload;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...jsonHeaders,
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "content-type"
        }
      });
    }

    if (url.pathname === "/api/free-models") {
      const { payload } = await readPayload(env);
      return new Response(JSON.stringify(payload, null, 2), { headers: jsonHeaders });
    }

    if (url.pathname === "/api/free-models/health") {
      const { payload, storage } = await readPayload(env);
      return new Response(JSON.stringify({
        ok: true,
        source: payload.source,
        updatedAt: payload.updatedAt,
        lastSyncedAt: payload.lastSyncedAt || null,
        cron: "enabled",
        storage,
        kvConfigured: Boolean(env && env.FREE_MODELS_KV),
        note: "Worker serves data from KV when available and seeds storage automatically."
      }), { headers: jsonHeaders });
    }

    if (url.pathname === "/api/free-models/refresh") {
      const payload = await refreshPayload(env, "manual-fetch");
      return new Response(JSON.stringify({
        ok: true,
        refreshed: true,
        updatedAt: payload.updatedAt,
        lastSyncedAt: payload.lastSyncedAt,
        itemCount: payload.items.length
      }), { headers: jsonHeaders });
    }

    return new Response("Not found", { status: 404 });
  },

  async scheduled(controller, env) {
    await refreshPayload(env, controller.cron || "scheduled");
  }
};
