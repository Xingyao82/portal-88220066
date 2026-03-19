const payload = {
  source: "cloudflare-worker",
  updatedAt: "2026-03-19",
  items: [
    { name: "OpenRouter", region: "region_global", compat: "compat_openai", freeType: "free_models", badge: "免费模型", note: "聚合很多模型，适合先统一接口。", summary: "能直接切不同模型，很多应用先从它做 OpenAI 兼容接入。", tags: ["聚合", "路由", "文档全"], url: "https://openrouter.ai/", accent: "#3f8cff" },
    { name: "GroqCloud", region: "region_global", compat: "compat_native", freeType: "free_daily", badge: "高速", note: "更适合追求低延迟。", summary: "推理快，聊天和轻量工具接起来很顺手。", tags: ["低延迟", "推理", "聊天"], url: "https://console.groq.com/", accent: "#ff8a34" },
    { name: "Gemini API", region: "region_global", compat: "compat_native", freeType: "free_daily", badge: "多模态", note: "文本和图像场景都常用。", summary: "适合多模态输入和 Google 生态里的实验项目。", tags: ["Google", "多模态", "官方 SDK"], url: "https://ai.google.dev/", accent: "#00b894" },
    { name: "Cloudflare Workers AI", region: "region_global", compat: "compat_native", freeType: "free_daily", badge: "边缘", note: "适合和 Worker 一起直接上线。", summary: "如果项目本来就在 Cloudflare 上，接入和部署链路很顺。", tags: ["Worker", "边缘", "部署方便"], url: "https://developers.cloudflare.com/workers-ai/", accent: "#f6b93b" },
    { name: "GitHub Models", region: "region_global", compat: "compat_multi", freeType: "free_sandbox", badge: "开发沙盒", note: "对 GitHub 用户很友好。", summary: "适合原型验证、对比不同模型和在开发阶段快速试用。", tags: ["GitHub", "对比", "原型"], url: "https://github.com/marketplace/models", accent: "#8e7dff" },
    { name: "Hugging Face Inference", region: "region_global", compat: "compat_multi", freeType: "free_credits", badge: "模型多", note: "适合试开源模型。", summary: "更适合找开源模型、试不同 provider，开发者生态丰富。", tags: ["开源", "模型广", "生态"], url: "https://huggingface.co/inference-api", accent: "#ffd166" },
    { name: "Together AI", region: "region_global", compat: "compat_openai", freeType: "free_credits", badge: "开源模型", note: "偏开源和推理实验。", summary: "常用来跑开源文本和图像模型，文档清楚。", tags: ["开源", "OpenAI 兼容", "实验"], url: "https://www.together.ai/", accent: "#5cc8ff" },
    { name: "Fireworks AI", region: "region_global", compat: "compat_openai", freeType: "free_credits", badge: "工程向", note: "偏生产接入体验。", summary: "做服务端接入比较顺，接口体验偏工程化。", tags: ["服务端", "OpenAI 兼容", "工程"], url: "https://fireworks.ai/", accent: "#ff6b81" },
    { name: "SiliconFlow", region: "region_cn", compat: "compat_openai", freeType: "free_models", badge: "国内友好", note: "中文开发者常用。", summary: "对国内接入很友好，开源模型选择多，常用来先跑通项目。", tags: ["国内", "开源", "中文"], url: "https://siliconflow.cn/", accent: "#00c2a8" },
    { name: "阿里云百炼", region: "region_cn", compat: "compat_native", freeType: "free_credits", badge: "企业向", note: "国内文档和生态完整。", summary: "国内常见大模型平台，适合做企业项目和工具接入。", tags: ["阿里云", "企业", "中文文档"], url: "https://bailian.console.aliyun.com/", accent: "#ffb347" },
    { name: "火山方舟", region: "region_cn", compat: "compat_openai", freeType: "free_credits", badge: "国内平台", note: "接入门槛不高。", summary: "偏平台化，适合试模型 API 和多模型接入方案。", tags: ["火山引擎", "中文", "接入快"], url: "https://www.volcengine.com/product/ark", accent: "#5f7cff" },
    { name: "智谱开放平台", region: "region_cn", compat: "compat_native", freeType: "free_credits", badge: "中文模型", note: "适合中文问答和 Agent 试验。", summary: "中文能力常被拿来做聊天、写作和轻量 Agent 场景。", tags: ["中文", "GLM", "Agent"], url: "https://open.bigmodel.cn/", accent: "#36a2ff" },
    { name: "MiniMax 开放平台", region: "region_cn", compat: "compat_native", freeType: "free_credits", badge: "多模态", note: "文本和语音场景都能碰到。", summary: "更适合语音、多模态和对话型产品的接口验证。", tags: ["语音", "中文", "多模态"], url: "https://www.minimaxi.com/platform", accent: "#4fd1c5" },
    { name: "Moonshot Open Platform", region: "region_cn", compat: "compat_native", freeType: "free_credits", badge: "长上下文", note: "适合文档和阅读型应用。", summary: "做长文理解、资料问答和中文文档类应用比较常见。", tags: ["长上下文", "文档", "中文"], url: "https://platform.moonshot.cn/", accent: "#8f7dff" },
    { name: "ModelScope API", region: "region_cn", compat: "compat_multi", freeType: "free_sandbox", badge: "开源生态", note: "更偏模型试验。", summary: "适合找国内开源模型做快速体验和验证。", tags: ["开源", "国内", "试验"], url: "https://www.modelscope.cn/", accent: "#00a8ff" },
    { name: "Cerebras Inference", region: "region_global", compat: "compat_openai", freeType: "free_sandbox", badge: "超快推理", note: "适合压测响应速度。", summary: "如果你想试特别快的文本推理体验，可以先从这里摸一遍。", tags: ["速度", "OpenAI 兼容", "开发者"], url: "https://www.cerebras.ai/inference", accent: "#ff7675" }
  ]
};

const jsonHeaders = {
  "content-type": "application/json; charset=UTF-8",
  "cache-control": "public, max-age=300, s-maxage=300",
  "access-control-allow-origin": "*"
};

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

addEventListener("scheduled", (event) => {
  event.waitUntil(handleScheduled(event.scheduledTime, event.cron));
});

async function handleRequest(request) {
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
    return new Response(JSON.stringify(payload, null, 2), { headers: jsonHeaders });
  }

  if (url.pathname === "/api/free-models/health") {
    return new Response(JSON.stringify({
      ok: true,
      source: payload.source,
      updatedAt: payload.updatedAt,
      cron: "enabled",
      note: "Current worker serves live JSON and supports scheduled refresh hooks."
    }), { headers: jsonHeaders });
  }

  return new Response("Not found", { status: 404 });
}

async function handleScheduled(scheduledTime, cron) {
  console.log(JSON.stringify({
    type: "free-models-refresh",
    scheduledTime,
    cron,
    providerCount: payload.items.length,
    updatedAt: payload.updatedAt
  }));
}
