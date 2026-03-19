
    const labels = {
      all: "\u5168\u90e8",
      showing: "\u5f53\u524d\u663e\u793a",
      tools: "\u4e2a\u5de5\u5177",
      noMatch: "\u6ca1\u6709\u627e\u5230\u5339\u914d\u9879\uff0c\u6362\u4e2a\u5173\u952e\u8bcd\u6216\u7b5b\u9009\u8bd5\u8bd5\u3002",
      open: "\u6253\u5f00",
      region_all: "\u5168\u90e8\u5730\u533a",
      region_domestic: "\u56fd\u5185",
      region_global: "\u56fd\u5916",
      price_all: "\u5168\u90e8\u4ef7\u683c",
      price_free_partial: "\u90e8\u5206\u514d\u8d39",
      price_paid: "\u4ed8\u8d39",
      price_paid_main: "\u4ed8\u8d39\u4e3a\u4e3b",
      price_free_main: "\u514d\u8d39\u4e3a\u4e3b",
      access_all: "\u5168\u90e8\u4e0a\u624b\u65b9\u5f0f",
      access_preview: "\u6253\u5f00\u7f51\u9875\u5148\u770b\u770b",
      access_login: "\u767b\u5f55\u540e\u4f53\u9a8c\u66f4\u5b8c\u6574",
      level_all: "\u5168\u90e8\u4eba\u7fa4",
      level_beginner: "\u65b0\u624b\u4f18\u5148",
      level_advanced: "\u8fdb\u9636\u4e5f\u80fd\u7528",
      quick_jump: "\u5feb\u901f\u7b5b\u9009",
      cat_general: "\u901a\u7528\u804a\u5929",
      cat_search: "\u641c\u7d22\u77e5\u8bc6",
      cat_coding: "\u4ee3\u7801\u5f00\u53d1",
      cat_design: "\u8bbe\u8ba1\u524d\u7aef",
      cat_productivity: "\u6548\u7387\u529e\u516c",
      cat_video: "\u97f3\u89c6\u9891",
      cat_audio: "\u97f3\u9891",
      cat_chinese: "\u4e2d\u6587\u5de5\u5177"
    };

    const tools = [
      { name: "ChatGPT", categoryKey: "cat_general", url: "https://chatgpt.com/", summary: "\u901a\u7528\u5bf9\u8bdd\u3001\u5199\u4f5c\u3001\u4ee3\u7801\u548c\u65e5\u5e38\u4efb\u52a1\u5904\u7406\u3002", tags: ["\u804a\u5929", "\u5199\u4f5c", "\u4ee3\u7801"], priceKey: "price_free_partial", accent: "#7c68ff" },
      { name: "Claude", categoryKey: "cat_general", url: "https://claude.ai/", summary: "\u64c5\u957f\u957f\u6587\u672c\u7406\u89e3\u3001\u5199\u4f5c\u6574\u7406\u548c\u4ee3\u7801\u534f\u4f5c\u3002", tags: ["\u957f\u6587", "\u5199\u4f5c", "\u4ee3\u7801"], priceKey: "price_free_partial", accent: "#25c3a5" },
      { name: "Gemini", categoryKey: "cat_general", url: "https://gemini.google.com/", summary: "Google \u7684\u591a\u6a21\u6001 AI \u52a9\u624b\uff0c\u9002\u5408\u641c\u7d22\u4e0e\u95ee\u7b54\u3002", tags: ["\u641c\u7d22", "\u591a\u6a21\u6001", "\u95ee\u7b54"], priceKey: "price_free_partial", accent: "#4f8cff" },
      { name: "Perplexity", categoryKey: "cat_search", url: "https://www.perplexity.ai/", summary: "\u66f4\u50cf AI \u641c\u7d22\u5f15\u64ce\uff0c\u9002\u5408\u627e\u8d44\u6599\u548c\u5feb\u901f\u67e5\u8bc1\u3002", tags: ["\u641c\u7d22", "\u8d44\u6599", "\u95ee\u7b54"], priceKey: "price_free_partial", accent: "#00b3a4" },
      { name: "Kimi", categoryKey: "cat_chinese", url: "https://kimi.moonshot.cn/", summary: "\u504f\u4e2d\u6587\u573a\u666f\u7684\u957f\u6587\u9605\u8bfb\u548c\u8d44\u6599\u6574\u7406\u4f53\u9a8c\u4e0d\u9519\u3002", tags: ["\u4e2d\u6587", "\u957f\u6587", "\u9605\u8bfb"], priceKey: "price_free_partial", accent: "#2ec4b6" },
      { name: "Doubao", categoryKey: "cat_chinese", url: "https://www.doubao.com/", summary: "\u9002\u5408\u4e2d\u6587\u95ee\u7b54\u3001\u5199\u4f5c\u548c\u591a\u573a\u666f\u5185\u5bb9\u751f\u6210\u3002", tags: ["\u4e2d\u6587", "\u804a\u5929", "\u5199\u4f5c"], priceKey: "price_free_main", accent: "#5d8dff" },
      { name: "Tongyi", categoryKey: "cat_chinese", url: "https://tongyi.aliyun.com/", summary: "\u963f\u91cc\u7cfb AI \u5e73\u53f0\uff0c\u8986\u76d6\u5bf9\u8bdd\u3001\u7ed8\u56fe\u4e0e\u4f01\u4e1a\u80fd\u529b\u3002", tags: ["\u4e2d\u6587", "\u4f01\u4e1a", "\u5bf9\u8bdd"], priceKey: "price_free_partial", accent: "#ffb347" },
      { name: "\u5143\u5b9d", categoryKey: "cat_chinese", url: "https://yuanbao.tencent.com/", summary: "\u817e\u8baf AI \u52a9\u624b\uff0c\u9002\u5408\u4e2d\u6587\u95ee\u7b54\u3001\u6587\u6863\u6574\u7406\u548c\u591a\u8f6e\u5bf9\u8bdd\u3002", tags: ["\u4e2d\u6587", "\u95ee\u7b54", "\u817e\u8baf"], priceKey: "price_free_main", accent: "#4ea1ff" },
      { name: "GitHub Copilot", categoryKey: "cat_coding", url: "https://github.com/features/copilot", summary: "\u9762\u5411\u5f00\u53d1\u8005\u7684\u4ee3\u7801\u8865\u5168\u3001\u5bf9\u8bdd\u548c\u7f16\u7a0b\u8f85\u52a9\u3002", tags: ["\u4ee3\u7801", "IDE", "\u5f00\u53d1"], priceKey: "price_paid_main", accent: "#ff9d42" },
      { name: "Cursor", categoryKey: "cat_coding", url: "https://www.cursor.com/", summary: "AI \u539f\u751f\u4ee3\u7801\u7f16\u8f91\u5668\uff0c\u9002\u5408\u91cd\u6784\u548c\u534f\u4f5c\u5f0f\u7f16\u7a0b\u3002", tags: ["\u7f16\u8f91\u5668", "\u4ee3\u7801", "\u5f00\u53d1"], priceKey: "price_free_partial", accent: "#7c68ff" },
      { name: "Windsurf", categoryKey: "cat_coding", url: "https://windsurf.com/", summary: "AI \u7f16\u7a0b IDE\uff0c\u504f\u5411\u5b8c\u6574\u5f00\u53d1\u6d41\u7a0b\u548c Agent \u5f0f\u534f\u4f5c\u3002", tags: ["IDE", "Agent", "\u7f16\u7a0b"], priceKey: "price_free_partial", accent: "#62d0ff" },
      { name: "v0", categoryKey: "cat_design", url: "https://v0.dev/", summary: "\u8f93\u5165\u63cf\u8ff0\u5373\u53ef\u751f\u6210\u524d\u7aef UI \u4ee3\u7801\u548c\u9875\u9762\u8349\u56fe\u3002", tags: ["\u524d\u7aef", "UI", "\u539f\u578b"], priceKey: "price_free_partial", accent: "#a669ff" },
      { name: "Midjourney", categoryKey: "cat_design", url: "https://www.midjourney.com/", summary: "\u9ad8\u8d28\u91cf AI \u7ed8\u56fe\u5e73\u53f0\uff0c\u9002\u5408\u6982\u5ff5\u56fe\u548c\u89c6\u89c9\u63a2\u7d22\u3002", tags: ["\u7ed8\u56fe", "\u89c6\u89c9", "\u8bbe\u8ba1"], priceKey: "price_paid", accent: "#ff6e6e" },
      { name: "Canva AI", categoryKey: "cat_design", url: "https://www.canva.com/", summary: "\u8bbe\u8ba1\u6a21\u677f\u7ed3\u5408 AI \u6587\u6848\u548c\u56fe\u50cf\u80fd\u529b\uff0c\u9002\u5408\u5feb\u901f\u51fa\u56fe\u3002", tags: ["\u8bbe\u8ba1", "\u6a21\u677f", "\u6d77\u62a5"], priceKey: "price_free_partial", accent: "#00c4cc" },
      { name: "Leonardo AI", categoryKey: "cat_design", url: "https://leonardo.ai/", summary: "\u504f\u56fe\u50cf\u751f\u6210\u548c\u8d44\u4ea7\u98ce\u683c\u5316\uff0c\u9002\u5408\u7d20\u6750\u521b\u4f5c\u3002", tags: ["\u56fe\u50cf", "\u7d20\u6750", "\u751f\u6210"], priceKey: "price_free_partial", accent: "#8a6cff" },
      { name: "Runway", categoryKey: "cat_video", url: "https://runwayml.com/", summary: "\u89c6\u9891\u751f\u6210\u4e0e\u7f16\u8f91\u80fd\u529b\u8f83\u5f3a\uff0c\u9002\u5408\u521b\u610f\u5185\u5bb9\u5236\u4f5c\u3002", tags: ["\u89c6\u9891", "\u751f\u6210", "\u7f16\u8f91"], priceKey: "price_free_partial", accent: "#7effb2" },
      { name: "HeyGen", categoryKey: "cat_video", url: "https://www.heygen.com/", summary: "AI \u6570\u5b57\u4eba\u548c\u53e3\u64ad\u89c6\u9891\u751f\u6210\uff0c\u9002\u5408\u8425\u9500\u5c55\u793a\u3002", tags: ["\u89c6\u9891", "\u6570\u5b57\u4eba", "\u8425\u9500"], priceKey: "price_paid_main", accent: "#3bb2ff" },
      { name: "Pika", categoryKey: "cat_video", url: "https://pika.art/", summary: "\u66f4\u504f\u8f7b\u91cf\u7684 AI \u89c6\u9891\u751f\u6210\u5de5\u5177\uff0c\u9002\u5408\u5feb\u901f\u51fa\u6f14\u793a\u7d20\u6750\u3002", tags: ["\u89c6\u9891", "\u52a8\u753b", "\u751f\u6210"], priceKey: "price_free_partial", accent: "#ff7aa2" },
      { name: "ElevenLabs", categoryKey: "cat_audio", url: "https://elevenlabs.io/", summary: "\u9ad8\u8d28\u91cf AI \u8bed\u97f3\u751f\u6210\uff0c\u9002\u5408\u914d\u97f3\u548c\u97f3\u9891\u5185\u5bb9\u3002", tags: ["\u8bed\u97f3", "\u914d\u97f3", "\u97f3\u9891"], priceKey: "price_free_partial", accent: "#ffd166" },
      { name: "Suno", categoryKey: "cat_audio", url: "https://suno.com/", summary: "AI \u97f3\u4e50\u751f\u6210\u5de5\u5177\uff0c\u9002\u5408\u5feb\u901f\u751f\u6210 demo \u548c\u80cc\u666f\u97f3\u4e50\u3002", tags: ["\u97f3\u4e50", "\u751f\u6210", "\u6b4c\u66f2"], priceKey: "price_free_partial", accent: "#ffb84d" },
      { name: "Notion AI", categoryKey: "cat_productivity", url: "https://www.notion.so/product/ai", summary: "\u9002\u5408\u6574\u7406\u7b14\u8bb0\u3001\u6587\u6863\u603b\u7ed3\u548c\u56e2\u961f\u77e5\u8bc6\u7ba1\u7406\u3002", tags: ["\u7b14\u8bb0", "\u603b\u7ed3", "\u529e\u516c"], priceKey: "price_paid_main", accent: "#8b93a7" },
      { name: "Tome", categoryKey: "cat_productivity", url: "https://tome.app/", summary: "AI \u6f14\u793a\u6587\u7a3f\u5de5\u5177\uff0c\u9002\u5408\u5feb\u901f\u751f\u6210\u63d0\u6848\u548c\u5c55\u793a\u9875\u3002", tags: ["PPT", "\u6f14\u793a", "\u63d0\u6848"], priceKey: "price_free_partial", accent: "#ff8f5c" },
      { name: "Gamma", categoryKey: "cat_productivity", url: "https://gamma.app/", summary: "\u9002\u5408 AI \u751f\u6210\u6f14\u793a\u6587\u7a3f\u3001\u9875\u9762\u7ed3\u6784\u548c\u8f7b\u91cf\u63d0\u6848\u3002", tags: ["\u6f14\u793a", "\u6587\u7a3f", "\u7ed3\u6784"], priceKey: "price_free_partial", accent: "#8e7dff" },
      { name: "Perplexity Labs", categoryKey: "cat_search", url: "https://www.perplexity.ai/", summary: "\u7528 AI \u505a\u8d44\u6599\u68c0\u7d22\u3001\u95ee\u9898\u62c6\u89e3\u548c\u5feb\u901f\u94fe\u63a5\u53c2\u8003\u3002", tags: ["\u68c0\u7d22", "\u7814\u7a76", "\u94fe\u63a5"], priceKey: "price_free_partial", accent: "#22c1a1" },
      { name: "NotebookLM", categoryKey: "cat_search", url: "https://notebooklm.google/", summary: "\u9002\u5408\u57fa\u4e8e\u6587\u6863\u548c\u8d44\u6599\u5305\u505a\u603b\u7ed3\u3001\u95ee\u7b54\u548c\u5b66\u4e60\u8f85\u52a9\u3002", tags: ["\u6587\u6863", "\u603b\u7ed3", "\u5b66\u4e60"], priceKey: "price_free_partial", accent: "#4da3ff" },
      { name: "Grok", categoryKey: "cat_general", url: "https://grok.com/", summary: "xAI \u7684\u5bf9\u8bdd\u5de5\u5177\uff0c\u504f\u5feb\u901f\u95ee\u7b54\u548c\u70ed\u70b9\u8bdd\u9898\u68b3\u7406\u3002", tags: ["\u804a\u5929", "\u95ee\u7b54", "\u70ed\u70b9"], priceKey: "price_free_partial", accent: "#d5d7de" },
      { name: "DeepSeek", categoryKey: "cat_chinese", url: "https://chat.deepseek.com/", summary: "\u4e2d\u6587\u4f53\u9a8c\u4e0d\u9519\u7684 AI \u5bf9\u8bdd\u548c\u63a8\u7406\u5de5\u5177\uff0c\u9002\u5408\u95ee\u7b54\u4e0e\u4ee3\u7801\u8f85\u52a9\u3002", tags: ["\u4e2d\u6587", "\u63a8\u7406", "\u5bf9\u8bdd"], priceKey: "price_free_main", accent: "#4466ff" },
      { name: "Mistral Le Chat", categoryKey: "cat_general", url: "https://chat.mistral.ai/", summary: "\u6b27\u6d32 AI \u5bf9\u8bdd\u5de5\u5177\uff0c\u9002\u5408\u65e5\u5e38\u95ee\u7b54\u548c\u8f7b\u91cf\u6587\u6863\u5904\u7406\u3002", tags: ["\u804a\u5929", "\u6587\u6863", "\u6b27\u6d32"], priceKey: "price_free_partial", accent: "#ff6b3d" },
      { name: "Poe", categoryKey: "cat_general", url: "https://poe.com/", summary: "\u4e00\u9875\u91cc\u5207\u6362\u591a\u4e2a AI \u6a21\u578b\uff0c\u9002\u5408\u5bf9\u6bd4\u4f7f\u7528\u3002", tags: ["\u805a\u5408", "\u591a\u6a21\u578b", "\u5bf9\u6bd4"], priceKey: "price_free_partial", accent: "#8d5cf6" },
      { name: "Phind", categoryKey: "cat_search", url: "https://www.phind.com/", summary: "\u504f\u5f00\u53d1\u8005\u5411\u7684 AI \u641c\u7d22\uff0c\u9002\u5408\u67e5 API \u3001\u67e5\u9519\u548c\u6280\u672f\u8d44\u6599\u3002", tags: ["\u5f00\u53d1", "API", "\u641c\u7d22"], priceKey: "price_free_partial", accent: "#52d2ff" },
      { name: "Liner", categoryKey: "cat_search", url: "https://getliner.com/", summary: "\u9002\u5408 AI \u68c0\u7d22\u548c\u8d44\u6599\u5212\u91cd\u70b9\uff0c\u504f\u8f7b\u7814\u7a76\u6d41\u7a0b\u3002", tags: ["\u68c0\u7d22", "\u9605\u8bfb", "\u7814\u7a76"], priceKey: "price_free_partial", accent: "#00c8a7" },
      { name: "Bolt.new", categoryKey: "cat_coding", url: "https://bolt.new/", summary: "\u7528\u63d0\u793a\u8bcd\u5feb\u901f\u751f\u6210\u524d\u7aef\u9879\u76ee\u539f\u578b\uff0c\u9002\u5408 demo \u548c MVP\u3002", tags: ["\u524d\u7aef", "MVP", "\u539f\u578b"], priceKey: "price_free_partial", accent: "#ff6f61" },
      { name: "Replit AI", categoryKey: "cat_coding", url: "https://replit.com/", summary: "\u5728\u6d4f\u89c8\u5668\u91cc\u76f4\u63a5\u5199\u4ee3\u7801\u548c\u8fd0\u884c\uff0c\u9002\u5408\u8f7b\u5feb\u8bd5\u4f5c\u3002", tags: ["\u7f16\u7801", "\u5728\u7ebf IDE", "\u8bd5\u4f5c"], priceKey: "price_free_partial", accent: "#f26207" },
      { name: "Lovable", categoryKey: "cat_design", url: "https://lovable.dev/", summary: "\u9002\u5408\u7528\u63cf\u8ff0\u751f\u6210\u9875\u9762\u4e0e\u4ea4\u4e92\u539f\u578b\uff0c\u504f\u4ea7\u54c1 demo \u573a\u666f\u3002", tags: ["\u9875\u9762", "\u4ea4\u4e92", "\u539f\u578b"], priceKey: "price_free_partial", accent: "#ff4fa3" },
      { name: "Figma AI", categoryKey: "cat_design", url: "https://www.figma.com/ai/", summary: "\u5728 Figma \u91cc\u8f85\u52a9\u8bbe\u8ba1\u3001\u6587\u6848\u4e0e\u754c\u9762\u5feb\u901f\u642d\u5efa\u3002", tags: ["Figma", "\u8bbe\u8ba1", "\u754c\u9762"], priceKey: "price_free_partial", accent: "#7b61ff" },
      { name: "Luma AI", categoryKey: "cat_video", url: "https://lumalabs.ai/", summary: "\u504f AI \u89c6\u9891\u4e0e 3D \u751f\u6210\uff0c\u9002\u5408\u89c6\u89c9 demo \u548c\u573a\u666f\u6f14\u793a\u3002", tags: ["3D", "\u89c6\u9891", "\u89c6\u89c9"], priceKey: "price_free_partial", accent: "#9a7bff" },
      { name: "Descript", categoryKey: "cat_audio", url: "https://www.descript.com/", summary: "\u9002\u5408\u97f3\u89c6\u9891\u8f6c\u5f55\u3001\u526a\u8f91\u548c\u57fa\u7840 AI \u97f3\u9891\u5904\u7406\u3002", tags: ["\u8f6c\u5f55", "\u526a\u8f91", "\u97f3\u9891"], priceKey: "price_free_partial", accent: "#6ec1ff" },
      { name: "Otter", categoryKey: "cat_audio", url: "https://otter.ai/", summary: "\u4f1a\u8bae\u8bb0\u5f55\u3001\u8bed\u97f3\u8f6c\u5199\u548c\u603b\u7ed3\u573a\u666f\u975e\u5e38\u5e38\u7528\u3002", tags: ["\u4f1a\u8bae", "\u8f6c\u5199", "\u603b\u7ed3"], priceKey: "price_free_partial", accent: "#2bb3ff" },
      { name: "Fireflies", categoryKey: "cat_productivity", url: "https://fireflies.ai/", summary: "\u504f\u4f1a\u8bae\u8f6c\u5199\u3001\u5f52\u6863\u548c\u591a\u4eba\u534f\u4f5c\u6574\u7406\u3002", tags: ["\u4f1a\u8bae", "\u7eaa\u8981", "\u534f\u4f5c"], priceKey: "price_free_partial", accent: "#7e8cff" },
      { name: "Beautiful.ai", categoryKey: "cat_productivity", url: "https://www.beautiful.ai/", summary: "\u66f4\u504f AI \u6f14\u793a\u7a3f\u751f\u6210\u548c PPT \u5feb\u901f\u6392\u7248\u3002", tags: ["PPT", "\u6392\u7248", "\u6f14\u793a"], priceKey: "price_free_partial", accent: "#00bcd4" },
      { name: "You.com", categoryKey: "cat_search", url: "https://you.com/", summary: "\u6df7\u5408 AI \u95ee\u7b54\u4e0e\u641c\u7d22\u7ed3\u679c\uff0c\u9002\u5408\u5feb\u901f\u6d4f\u89c8\u4e0d\u540c\u6765\u6e90\u3002", tags: ["\u641c\u7d22", "\u805a\u5408", "\u95ee\u7b54"], priceKey: "price_free_partial", accent: "#7a8cff" },
      { name: "Qwen Chat", categoryKey: "cat_chinese", url: "https://chat.qwen.ai/", summary: "\u901a\u4e49\u7cfb\u7684\u5bf9\u8bdd\u5165\u53e3\uff0c\u9002\u5408\u4e2d\u6587\u95ee\u7b54\u3001\u5199\u4f5c\u548c\u65e5\u5e38\u4f7f\u7528\u3002", tags: ["\u4e2d\u6587", "\u5bf9\u8bdd", "\u5199\u4f5c"], priceKey: "price_free_partial", accent: "#ffb347" },
      { name: "Hailuo AI", categoryKey: "cat_video", url: "https://hailuoai.video/", summary: "\u504f\u5411\u4e2d\u6587\u573a\u666f\u7684 AI \u89c6\u9891\u751f\u6210\uff0c\u9002\u5408\u5feb\u901f\u51fa\u77ed\u89c6\u89c9\u7d20\u6750\u3002", tags: ["\u4e2d\u6587", "\u89c6\u9891", "\u751f\u6210"], priceKey: "price_free_partial", accent: "#7f7cff" },
      { name: "Cici", categoryKey: "cat_chinese", url: "https://www.ciciai.com/", summary: "\u504f\u793e\u4ea4\u548c\u8f7b\u5bf9\u8bdd\u7684 AI \u52a9\u624b\uff0c\u9002\u5408\u65e5\u5e38\u95ee\u7b54\u548c\u5185\u5bb9\u966a\u4f34\u3002", tags: ["\u4e2d\u6587", "\u793e\u4ea4", "\u5bf9\u8bdd"], priceKey: "price_free_main", accent: "#ff7e9c" },
      { name: "MiniMax", categoryKey: "cat_chinese", url: "https://www.minimaxi.com/", summary: "\u63d0\u4f9b\u6587\u672c\u3001\u8bed\u97f3\u548c\u591a\u6a21\u6001\u80fd\u529b\uff0c\u9002\u5408\u4ea7\u54c1\u8bd5\u7528\u548c\u63a5\u5165\u3002", tags: ["\u4e2d\u6587", "\u8bed\u97f3", "\u591a\u6a21\u6001"], priceKey: "price_free_partial", accent: "#50b5ff" },
      { name: "Moonvalley", categoryKey: "cat_video", url: "https://moonvalley.com/", summary: "\u66f4\u504f\u7535\u5f71\u611f\u7684 AI \u89c6\u9891\u751f\u6210\uff0c\u9002\u5408\u6982\u5ff5\u7247\u548c\u955c\u5934\u9884\u6f14\u3002", tags: ["\u89c6\u9891", "\u955c\u5934", "\u7535\u5f71"], priceKey: "price_paid_main", accent: "#6d85ff" },
      { name: "Synthesia", categoryKey: "cat_video", url: "https://www.synthesia.io/", summary: "\u6570\u5b57\u4eba\u914d\u97f3\u548c\u57f9\u8bad\u89c6\u9891\u5f88\u6210\u719f\uff0c\u9002\u5408\u4f01\u4e1a\u5185\u5bb9\u5236\u4f5c\u3002", tags: ["\u6570\u5b57\u4eba", "\u57f9\u8bad", "\u89c6\u9891"], priceKey: "price_paid_main", accent: "#3273ff" },
      { name: "Udio", categoryKey: "cat_audio", url: "https://www.udio.com/", summary: "\u7528\u63d0\u793a\u8bcd\u751f\u6210\u6b4c\u66f2\u548c\u97f3\u4e50\u7247\u6bb5\uff0c\u9002\u5408\u5feb\u901f\u51fa demo\u3002", tags: ["\u97f3\u4e50", "\u6b4c\u66f2", "demo"], priceKey: "price_free_partial", accent: "#ff9352" },
      { name: "Stable Audio", categoryKey: "cat_audio", url: "https://www.stableaudio.com/", summary: "\u504f\u80cc\u666f\u97f3\u4e50\u548c\u97f3\u6548\u751f\u6210\uff0c\u9002\u5408\u89c6\u9891\u914d\u4e50\u7d20\u6750\u3002", tags: ["\u97f3\u4e50", "\u97f3\u6548", "\u7d20\u6750"], priceKey: "price_free_partial", accent: "#ffb14e" },
      { name: "Mem", categoryKey: "cat_productivity", url: "https://mem.ai/", summary: "\u4e3b\u6253 AI \u7b14\u8bb0\u548c\u8054\u60f3\u68c0\u7d22\uff0c\u9002\u5408\u79c1\u4eba\u77e5\u8bc6\u7ba1\u7406\u3002", tags: ["\u7b14\u8bb0", "\u77e5\u8bc6\u5e93", "\u68c0\u7d22"], priceKey: "price_free_partial", accent: "#8d9eff" },
      { name: "Taskade AI", categoryKey: "cat_productivity", url: "https://www.taskade.com/", summary: "\u9002\u5408\u7528 AI \u62c6\u89e3\u4efb\u52a1\u3001\u751f\u6210\u6e05\u5355\u548c\u8f7b\u534f\u4f5c\u6d41\u7a0b\u3002", tags: ["\u4efb\u52a1", "\u534f\u4f5c", "\u6e05\u5355"], priceKey: "price_free_partial", accent: "#57d3c7" },
      { name: "Elicit", categoryKey: "cat_search", url: "https://elicit.com/", summary: "\u9762\u5411\u7814\u7a76\u68c0\u7d22\u548c\u8bba\u6587\u68b3\u7406\uff0c\u9002\u5408\u505a\u8d44\u6599\u7efc\u8ff0\u3002", tags: ["\u8bba\u6587", "\u7814\u7a76", "\u68b3\u7406"], priceKey: "price_free_partial", accent: "#5cc8ff" },
      { name: "Consensus", categoryKey: "cat_search", url: "https://consensus.app/", summary: "\u504f\u5b66\u672f\u95ee\u7b54\u548c\u7814\u7a76\u7ed3\u8bba\u68c0\u7d22\uff0c\u9002\u5408\u5feb\u901f\u627e\u8bba\u636e\u3002", tags: ["\u5b66\u672f", "\u95ee\u7b54", "\u8bba\u636e"], priceKey: "price_free_partial", accent: "#22c7d6" },
      { name: "Codeium", categoryKey: "cat_coding", url: "https://codeium.com/", summary: "\u514d\u8d39\u611f\u66f4\u5f3a\u7684 AI \u7f16\u7801\u8f85\u52a9\uff0c\u9002\u5408 IDE \u8865\u5168\u548c\u804a\u5929\u3002", tags: ["IDE", "\u8865\u5168", "\u4ee3\u7801"], priceKey: "price_free_main", accent: "#6f86ff" },
      { name: "Tabnine", categoryKey: "cat_coding", url: "https://www.tabnine.com/", summary: "\u8001\u724c AI \u4ee3\u7801\u8865\u5168\u5de5\u5177\uff0c\u9002\u5408\u5df2\u5728 IDE \u4e2d\u5de5\u4f5c\u7684\u5f00\u53d1\u8005\u3002", tags: ["IDE", "\u8865\u5168", "\u5f00\u53d1"], priceKey: "price_free_partial", accent: "#8a72ff" },
      { name: "Pixlr AI", categoryKey: "cat_design", url: "https://pixlr.com/", summary: "\u5728\u7ebf\u56fe\u50cf\u7f16\u8f91\u53e0\u52a0 AI \u4fee\u56fe\u80fd\u529b\uff0c\u9002\u5408\u5feb\u901f\u6539\u56fe\u3002", tags: ["\u4fee\u56fe", "\u56fe\u50cf", "\u8bbe\u8ba1"], priceKey: "price_free_partial", accent: "#11c5a4" },
      { name: "Ideogram", categoryKey: "cat_design", url: "https://ideogram.ai/", summary: "\u504f\u5e26\u6587\u5b57\u7684\u56fe\u50cf\u751f\u6210\uff0c\u9002\u5408\u6d77\u62a5\u3001\u6807\u9898\u56fe\u548c\u54c1\u724c\u89c6\u89c9\u3002", tags: ["\u6d77\u62a5", "\u5b57\u4f53", "\u56fe\u50cf"], priceKey: "price_free_partial", accent: "#ff5d8f" },
      { name: "CapCut AI", categoryKey: "cat_video", url: "https://www.capcut.com/ai-tools/", summary: "\u526a\u6620\u7cfb AI \u5de5\u5177\uff0c\u9002\u5408\u77ed\u89c6\u9891\u526a\u8f91\u3001\u5b57\u5e55\u548c\u8f7b\u751f\u6210\u3002", tags: ["\u526a\u8f91", "\u77ed\u89c6\u9891", "\u5b57\u5e55"], priceKey: "price_free_partial", accent: "#00c0ff" },
      { name: "Tripo AI", categoryKey: "cat_design", url: "https://www.tripo3d.ai/", summary: "\u5feb\u901f\u751f\u6210 3D \u6a21\u578b\uff0c\u9002\u5408\u6e38\u620f\u3001\u5c55\u793a\u548c\u7acb\u4f53\u7d20\u6750\u9884\u89c8\u3002", tags: ["3D", "\u6a21\u578b", "\u7d20\u6750"], priceKey: "price_free_partial", accent: "#9b7cff" },
      { name: "Mapify", categoryKey: "cat_productivity", url: "https://mapify.so/", summary: "\u628a\u957f\u6587\u3001\u89c6\u9891\u6216\u7f51\u9875\u5feb\u901f\u6574\u7406\u6210\u601d\u7ef4\u5bfc\u56fe\u548c\u7ed3\u6784\u5316\u7b14\u8bb0\u3002", tags: ["\u5bfc\u56fe", "\u603b\u7ed3", "\u7ed3\u6784"], priceKey: "price_free_partial", accent: "#49d3ff" }
    ];

    const domesticNames = new Set(["Kimi", "Doubao", "Tongyi", "\u5143\u5b9d", "DeepSeek", "Qwen Chat", "Hailuo AI", "Cici", "MiniMax", "CapCut AI"]);
    const previewNames = new Set(["ChatGPT", "Claude", "Perplexity", "Perplexity Labs", "You.com", "Poe", "Phind", "Liner", "Elicit", "Consensus", "Canva AI", "Gamma", "Beautiful.ai", "Mapify", "Ideogram", "Pixlr AI", "v0", "Lovable"]);
    const beginnerNames = new Set(["ChatGPT", "Claude", "Gemini", "Perplexity", "Kimi", "Doubao", "\u5143\u5b9d", "DeepSeek", "Qwen Chat", "Canva AI", "Gamma", "Beautiful.ai", "You.com", "Cici", "CapCut AI", "Mapify"]);
    const featuredNames = ["ChatGPT", "Claude", "DeepSeek", "Perplexity", "Cursor", "Gamma"];
    const categories = [labels.all, ...new Set(tools.map((tool) => labels[tool.categoryKey]))];
    const regions = [labels.region_all, labels.region_domestic, labels.region_global];
    const prices = [labels.price_all, labels.price_free_main, labels.price_free_partial, labels.price_paid_main, labels.price_paid];
    const accesses = [labels.access_all, labels.access_preview, labels.access_login];
    const levels = [labels.level_all, labels.level_beginner, labels.level_advanced];
    const quickFilters = [
      { name: "\u65b0\u624b\u5148\u770b", meta: "\u9002\u5408\u521d\u6b21\u4e0a\u624b", summary: "\u5148\u770b\u4e0a\u624b\u5feb\u3001\u754c\u9762\u76f4\u89c2\u3001\u514d\u8d39\u53ef\u7528\u611f\u66f4\u5f3a\u7684 AI \u4ea7\u54c1\u3002", accent: "#7c68ff", badge: "\u65b0\u624b", action: { level: labels.level_beginner } },
      { name: "\u4e2d\u6587\u4f18\u5148", meta: "\u56fd\u5185 / \u4e2d\u6587\u4ea7\u54c1", summary: "\u60f3\u8981\u4e2d\u6587\u95ee\u7b54\u3001\u4e2d\u6587\u5199\u4f5c\u6216\u56fd\u5185\u670d\u52a1\uff0c\u53ef\u4ee5\u5148\u770b\u8fd9\u7ec4\u3002", accent: "#4466ff", badge: "\u4e2d\u6587", action: { region: labels.region_domestic } },
      { name: "\u4ee3\u7801\u5f00\u53d1", meta: "\u7f16\u7801 / IDE / Agent", summary: "\u60f3\u5199\u4ee3\u7801\u3001\u505a demo \u6216\u8005\u4f18\u5316\u5f00\u53d1\u6d41\u7a0b\uff0c\u4ece\u8fd9\u7ec4\u8fdb\u53bb\u6700\u76f4\u63a5\u3002", accent: "#ff9d42", badge: "\u5f00\u53d1", action: { category: labels.cat_coding } },
      { name: "\u641c\u7d22\u7814\u7a76", meta: "\u68c0\u7d22 / \u8d44\u6599 / \u8bba\u6587", summary: "\u627e\u8d44\u6599\u3001\u505a\u7814\u7a76\u6216\u5feb\u901f\u67e5\u8bc1\uff0c\u8fd9\u7ec4\u5de5\u5177\u4f1a\u6bd4\u901a\u7528\u804a\u5929\u66f4\u5bf9\u8def\u3002", accent: "#00b3a4", badge: "\u68c0\u7d22", action: { category: labels.cat_search } },
      { name: "\u8bbe\u8ba1\u4e0e\u51fa\u56fe", meta: "UI / \u56fe\u50cf / \u6d77\u62a5", summary: "\u505a\u754c\u9762\u3001\u51fa\u56fe\u3001\u751f\u6210\u7d20\u6750\u6216\u539f\u578b\u65f6\uff0c\u53ef\u4ee5\u76f4\u63a5\u4ece\u8fd9\u7ec4\u5de5\u5177\u5f00\u59cb\u3002", accent: "#ff4fa3", badge: "\u8bbe\u8ba1", action: { category: labels.cat_design } },
      { name: "\u97f3\u89c6\u9891\u521b\u4f5c", meta: "\u89c6\u9891 / \u97f3\u9891 / \u914d\u97f3", summary: "\u60f3\u505a\u77ed\u89c6\u9891\u3001\u53e3\u64ad\u3001\u914d\u97f3\u6216\u97f3\u4e50\u7d20\u6750\uff0c\u53ef\u4ee5\u5148\u770b\u8fd9\u7ec4\u5de5\u5177\u3002", accent: "#7effb2", badge: "\u521b\u4f5c", action: { category: labels.cat_video } }
    ];
    const state = {
      category: labels.all,
      region: labels.region_all,
      price: labels.price_all,
      access: labels.access_all,
      level: labels.level_all,
      search: ""
    };
    const chipsEl = document.getElementById("chips");
    const regionChipsEl = document.getElementById("region-chips");
    const priceChipsEl = document.getElementById("price-chips");
    const accessChipsEl = document.getElementById("access-chips");
    const levelChipsEl = document.getElementById("level-chips");
    const quickGridEl = document.getElementById("quick-grid");
    const featuredGridEl = document.getElementById("featured-grid");
    const gridEl = document.getElementById("grid");
    const countEl = document.getElementById("count");
    const statTotalEl = document.getElementById("stat-total");
    const statFreeEl = document.getElementById("stat-free");
    const statDomesticEl = document.getElementById("stat-domestic");
    const statBeginnerEl = document.getElementById("stat-beginner");
    const searchEl = document.getElementById("search-input");

    function getRegionLabel(tool) {
      return domesticNames.has(tool.name) ? labels.region_domestic : labels.region_global;
    }

    function getAccessLabel(tool) {
      return previewNames.has(tool.name) ? labels.access_preview : labels.access_login;
    }

    function getLevelLabel(tool) {
      return beginnerNames.has(tool.name) ? labels.level_beginner : labels.level_advanced;
    }

    function renderChipGroup(container, values, key, current) {
      container.innerHTML = values.map((value) => `
        <button class="chip-btn ${value === current ? "active" : ""}" data-${key}="${value}" type="button">${value}</button>
      `).join("");
    }

    function renderChips() {
      renderChipGroup(chipsEl, categories, "category", state.category);
      renderChipGroup(regionChipsEl, regions, "region", state.region);
      renderChipGroup(priceChipsEl, prices, "price", state.price);
      renderChipGroup(accessChipsEl, accesses, "access", state.access);
      renderChipGroup(levelChipsEl, levels, "level", state.level);
    }

    function filteredTools() {
      return tools.filter((tool) => {
        const localizedCategory = labels[tool.categoryKey];
        const regionLabel = getRegionLabel(tool);
        const priceLabel = labels[tool.priceKey];
        const accessLabel = getAccessLabel(tool);
        const levelLabel = getLevelLabel(tool);
        const haystack = [tool.name, localizedCategory, regionLabel, priceLabel, accessLabel, levelLabel, tool.summary, ...tool.tags].join(" ").toLowerCase();
        return (state.category === labels.all || localizedCategory === state.category)
          && (state.region === labels.region_all || regionLabel === state.region)
          && (state.price === labels.price_all || priceLabel === state.price)
          && (state.access === labels.access_all || accessLabel === state.access)
          && (state.level === labels.level_all || levelLabel === state.level)
          && (!state.search || haystack.includes(state.search));
      });
    }

    function toolCardTemplate(tool) {
      return `
        <article class="tool-card" style="--tool-accent:${tool.accent}">
          <div class="tool-top">
            <div>
              <div class="meta">${labels[tool.categoryKey]} / ${getRegionLabel(tool)}</div>
              <h3>${tool.name}</h3>
            </div>
            <div class="btn-row">
              <span class="status-badge">${getAccessLabel(tool)}</span>
              <span class="badge">${labels[tool.priceKey]}</span>
            </div>
          </div>
          <p>${tool.summary}</p>
          <div class="tag-row">
            ${tool.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
            <span class="chip">${getLevelLabel(tool)}</span>
          </div>
          <div class="mini-list">
            <div><span>\u9002\u5408\u4eba\u7fa4</span><strong>${getLevelLabel(tool)}</strong></div>
            <div><span>\u4e0a\u624b\u65b9\u5f0f</span><strong>${getAccessLabel(tool)}</strong></div>
          </div>
          <div class="card-bottom">
            <span class="meta">${tool.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
            <a class="visit" href="${tool.url}" target="_blank" rel="noreferrer">${labels.open}</a>
          </div>
        </article>
      `;
    }

    function renderQuickGrid() {
      quickGridEl.innerHTML = quickFilters.map((item) => `
        <article class="quick-card" style="--tool-accent:${item.accent}">
          <div class="tool-top">
            <div>
              <div class="meta">${item.meta}</div>
              <h3>${item.name}</h3>
            </div>
            <span class="badge">${item.badge}</span>
          </div>
          <p>${item.summary}</p>
          <div class="card-bottom">
            <span class="meta">${labels.quick_jump}</span>
            <button class="visit" type="button" data-quick='${JSON.stringify(item.action)}'>查看</button>
          </div>
        </article>
      `).join("");
    }

    function renderFeaturedGrid() {
      const items = featuredNames.map((name) => tools.find((tool) => tool.name === name)).filter(Boolean);
      featuredGridEl.innerHTML = items.map(toolCardTemplate).join("");
    }

    function renderStats() {
      statTotalEl.textContent = `${tools.length} 个常用 AI 产品`;
      statFreeEl.textContent = `${tools.filter((tool) => tool.priceKey !== "price_paid" && tool.priceKey !== "price_paid_main").length} 个可先免费试用`;
      statDomesticEl.textContent = `${tools.filter((tool) => getRegionLabel(tool) === labels.region_domestic).length} 个中文优先入口`;
      statBeginnerEl.textContent = `${tools.filter((tool) => getLevelLabel(tool) === labels.level_beginner).length} 个适合先上手`;
    }

    function renderGrid() {
      const items = filteredTools();
      countEl.textContent = `${labels.showing} ${items.length} / ${tools.length} ${labels.tools}`;

      if (!items.length) {
        gridEl.innerHTML = `<div class="empty">${labels.noMatch}</div>`;
        return;
      }

      gridEl.innerHTML = items.map(toolCardTemplate).join("");
    }

    function bindChipEvents(container, key) {
      container.addEventListener("click", (event) => {
        const button = event.target.closest(`[data-${key}]`);
        if (!button) return;
        state[key] = button.dataset[key];
        renderChips();
        renderGrid();
      });
    }

    bindChipEvents(chipsEl, "category");
    bindChipEvents(regionChipsEl, "region");
    bindChipEvents(priceChipsEl, "price");
    bindChipEvents(accessChipsEl, "access");
    bindChipEvents(levelChipsEl, "level");

    quickGridEl.addEventListener("click", (event) => {
      const button = event.target.closest("[data-quick]");
      if (!button) return;
      const payload = JSON.parse(button.dataset.quick);
      state.category = payload.category || labels.all;
      state.region = payload.region || labels.region_all;
      state.price = labels.price_all;
      state.access = labels.access_all;
      state.level = payload.level || labels.level_all;
      state.search = "";
      searchEl.value = "";
      renderChips();
      renderGrid();
    });

    searchEl.addEventListener("input", () => {
      state.search = searchEl.value.trim().toLowerCase();
      renderGrid();
    });

    renderStats();
    renderChips();
    renderQuickGrid();
    renderFeaturedGrid();
    renderGrid();
  
