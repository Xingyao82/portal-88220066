(() => {
  const STORAGE_KEYS = {
    favorites: "asterlab:favorites",
    lastTool: "asterlab:last-tool",
    focus: "asterlab:focus",
    resume: "asterlab:resume",
    invoice: "asterlab:invoice",
    budget: "asterlab:budget",
    shift: "asterlab:shift",
    formBuilder: "asterlab:form-builder",
    design: "asterlab:design",
  };

  const dom = {
    toolSearch: document.getElementById("tool-search"),
    categoryChips: document.getElementById("category-chips"),
    toolGrid: document.getElementById("tool-grid"),
    workspaceTitle: document.getElementById("workspace-title"),
    activeToolName: document.getElementById("active-tool-name"),
    activeToolSummary: document.getElementById("active-tool-summary"),
    activeToolTags: document.getElementById("active-tool-tags"),
    favoritesList: document.getElementById("favorites-list"),
    workspacePanel: document.getElementById("workspace-panel"),
    toggleFavoriteBtn: document.getElementById("toggle-favorite-btn"),
    openSampleBtn: document.getElementById("open-sample-btn"),
    metricToolCount: document.getElementById("metric-tool-count"),
  };

  const runtime = {
    currentToolApi: null,
    currentCleanup: null,
  };

  const tools = [
    {
      id: "data-factory",
      name: "开发数据工坊",
      category: "编程类",
      badge: "DF",
      accent: "#ff8f5c",
      summary: "处理 JSON、YAML、CSV，适合前端、后端和运营数据清洗场景。",
      tags: ["JSON", "YAML", "CSV", "格式化"],
      highlights: [
        { label: "输入", value: "JSON / YAML / CSV" },
        { label: "输出", value: "支持互转" },
        { label: "模式", value: "浏览器本地" },
      ],
      render: renderDataFactory,
      mount: mountDataFactory,
    },
    {
      id: "markdown-studio",
      name: "Markdown Studio",
      category: "图片文本类",
      badge: "MD",
      accent: "#2ec4b6",
      summary: "编辑、预览、导出 Markdown 文档，适合文档站、文章草稿和说明页。",
      tags: ["Markdown", "预览", "HTML 导出"],
      highlights: [
        { label: "能力", value: "编辑与预览" },
        { label: "导出", value: "HTML / MD" },
        { label: "适合", value: "文档与文章" },
      ],
      render: renderMarkdownStudio,
      mount: mountMarkdownStudio,
    },
    {
      id: "text-workshop",
      name: "文本工坊",
      category: "图片文本类",
      badge: "TX",
      accent: "#f4d35e",
      summary: "做文本清洗、去重、查敏感词，并给标题做基础评分和改写建议。",
      tags: ["文本清洗", "标题优化", "敏感词"],
      highlights: [
        { label: "清洗", value: "去重 / 替换 / 排序" },
        { label: "分析", value: "标题评分" },
        { label: "提醒", value: "敏感词提示" },
      ],
      render: renderTextWorkshop,
      mount: mountTextWorkshop,
    },
    {
      id: "regex-lab",
      name: "正则实验室",
      category: "编程类",
      badge: "RX",
      accent: "#6fb7ff",
      summary: "测试正则匹配和替换逻辑，直接查看命中内容、分组和替换结果。",
      tags: ["正则", "匹配", "替换"],
      highlights: [
        { label: "支持", value: "flags / groups" },
        { label: "输出", value: "命中列表" },
        { label: "适合", value: "调试与学习" },
      ],
      render: renderRegexLab,
      mount: mountRegexLab,
    },
    {
      id: "dev-toolbox",
      name: "开发工具箱",
      category: "编程类",
      badge: "DV",
      accent: "#ff8f5c",
      summary: "Base64、JWT、UUID 和 SHA-256 集中在一个面板里，适合高频小操作。",
      tags: ["Base64", "JWT", "UUID", "Hash"],
      highlights: [
        { label: "编码", value: "Base64" },
        { label: "令牌", value: "JWT 解码" },
        { label: "摘要", value: "SHA-256" },
      ],
      render: renderDevToolbox,
      mount: mountDevToolbox,
    },
    {
      id: "time-zone",
      name: "时间与时区",
      category: "编程类",
      badge: "TZ",
      accent: "#2ec4b6",
      summary: "时间戳、ISO 时间、本地时间和多个常用时区同屏联动。",
      tags: ["时间戳", "时区", "ISO"],
      highlights: [
        { label: "同步", value: "日期联动" },
        { label: "覆盖", value: "6 个常用时区" },
        { label: "适合", value: "接口与运营" },
      ],
      render: renderTimeZoneTool,
      mount: mountTimeZoneTool,
    },
    {
      id: "pdf-workbench",
      name: "PDF 工作台",
      category: "图片文本类",
      badge: "PF",
      accent: "#f4d35e",
      summary: "浏览器内完成 PDF 合并和拆分，适合静态站的小型文档处理。",
      tags: ["PDF 合并", "PDF 拆分", "文件工具"],
      highlights: [
        { label: "模式", value: "本地处理" },
        { label: "功能", value: "合并 / 拆分" },
        { label: "限制", value: "依赖浏览器内存" },
      ],
      render: renderPdfWorkbench,
      mount: mountPdfWorkbench,
    },
    {
      id: "image-lab",
      name: "图片实验室",
      category: "图片文本类",
      badge: "IM",
      accent: "#6fb7ff",
      summary: "完成图片压缩、裁剪、加水印和格式导出，适合纯前端工具站。",
      tags: ["压缩", "裁剪", "水印", "PNG/JPG"],
      highlights: [
        { label: "能力", value: "压缩 / 裁剪" },
        { label: "导出", value: "PNG / JPEG / WebP" },
        { label: "模式", value: "Canvas 本地处理" },
      ],
      render: renderImageLab,
      mount: mountImageLab,
    },
    {
      id: "resume-builder",
      name: "简历生成器",
      category: "生活类",
      badge: "CV",
      accent: "#ff8f5c",
      summary: "用表单驱动出一版简洁简历，支持预览、打印和 HTML 导出。",
      tags: ["简历", "打印", "求职"],
      highlights: [
        { label: "输出", value: "打印版简历" },
        { label: "形式", value: "结构化表单" },
        { label: "适合", value: "作品集与求职" },
      ],
      render: renderResumeBuilder,
      mount: mountResumeBuilder,
    },
    {
      id: "invoice-studio",
      name: "报价单工作台",
      category: "生活类",
      badge: "IV",
      accent: "#2ec4b6",
      summary: "为自由职业者和小团队生成报价单或发票预览，直接计算税额和总价。",
      tags: ["报价单", "发票", "打印"],
      highlights: [
        { label: "对象", value: "自由职业 / 小团队" },
        { label: "输出", value: "打印 / HTML" },
        { label: "内置", value: "税率计算" },
      ],
      render: renderInvoiceStudio,
      mount: mountInvoiceStudio,
    },
    {
      id: "calculator-center",
      name: "计算中心",
      category: "生活类",
      badge: "CL",
      accent: "#f4d35e",
      summary: "房贷、复利、BMI、体脂和热量估算放在同一处，方便做生活和财务测算。",
      tags: ["房贷", "复利", "BMI", "热量"],
      highlights: [
        { label: "房贷", value: "月供与总利息" },
        { label: "健康", value: "BMI / 体脂 / 热量" },
        { label: "财务", value: "复利增长" },
      ],
      render: renderCalculatorCenter,
      mount: mountCalculatorCenter,
    },
    {
      id: "focus-board",
      name: "番茄与任务",
      category: "生活类",
      badge: "FO",
      accent: "#6fb7ff",
      summary: "带任务清单和习惯勾选的专注工作台，支持本地存储和持续计时。",
      tags: ["番茄钟", "任务", "习惯"],
      highlights: [
        { label: "定时", value: "25 / 50 分钟" },
        { label: "记录", value: "任务与习惯" },
        { label: "存储", value: "localStorage" },
      ],
      render: renderFocusBoard,
      mount: mountFocusBoard,
    },
    {
      id: "budget-planner",
      name: "预算规划器",
      category: "生活类",
      badge: "BG",
      accent: "#ff8f5c",
      summary: "做简单的收入、支出、结余和储蓄目标测算，适合个人与小团队预算。",
      tags: ["预算", "记账", "结余"],
      highlights: [
        { label: "覆盖", value: "收入 / 支出 / 目标" },
        { label: "适合", value: "个人月度预算" },
        { label: "模式", value: "本地保存" },
      ],
      render: renderBudgetPlanner,
      mount: mountBudgetPlanner,
    },
    {
      id: "shift-planner",
      name: "排班生成器",
      category: "生活类",
      badge: "SH",
      accent: "#2ec4b6",
      summary: "给门店、运营和小团队生成轮班表，支持自定义班次序列和人员偏移。",
      tags: ["排班", "轮班", "值班表"],
      highlights: [
        { label: "输入", value: "班次序列" },
        { label: "输出", value: "表格排班" },
        { label: "适合", value: "运营 / 门店 / 团队" },
      ],
      render: renderShiftPlanner,
      mount: mountShiftPlanner,
    },
    {
      id: "form-builder",
      name: "表单构建器",
      category: "生活类",
      badge: "FM",
      accent: "#f4d35e",
      summary: "配置字段后生成 HTML 表单和 JSON Schema，适合配置导出和表单原型。",
      tags: ["表单", "JSON Schema", "HTML"],
      highlights: [
        { label: "输出", value: "表单 HTML" },
        { label: "结构", value: "JSON Schema" },
        { label: "适合", value: "原型与配置" },
      ],
      render: renderFormBuilder,
      mount: mountFormBuilder,
    },
    {
      id: "design-lab",
      name: "设计工坊",
      category: "图片文本类",
      badge: "DS",
      accent: "#6fb7ff",
      summary: "快速生成配色、渐变、阴影和圆角 CSS，适合前端和设计协同。",
      tags: ["配色", "渐变", "阴影", "CSS"],
      highlights: [
        { label: "输出", value: "CSS 变量" },
        { label: "展示", value: "实时预览" },
        { label: "适合", value: "界面打样" },
      ],
      render: renderDesignLab,
      mount: mountDesignLab,
    },
    {
      id: "poster-maker",
      name: "海报生成器",
      category: "图片文本类",
      badge: "PS",
      accent: "#ff8f5c",
      summary: "通过画布生成活动海报或社媒封面，适合静态模板化场景。",
      tags: ["海报", "封面", "PNG 导出"],
      highlights: [
        { label: "画布", value: "实时绘制" },
        { label: "导出", value: "PNG" },
        { label: "适合", value: "活动宣传" },
      ],
      render: renderPosterMaker,
      mount: mountPosterMaker,
    },
    {
      id: "flow-mapper",
      name: "流程图预览",
      category: "图片文本类",
      badge: "FL",
      accent: "#2ec4b6",
      summary: "将缩进文本转换成可视化流程图 SVG，适合草拟业务流程和脑图结构。",
      tags: ["流程图", "脑图", "SVG"],
      highlights: [
        { label: "输入", value: "缩进文本" },
        { label: "输出", value: "SVG 图形" },
        { label: "适合", value: "梳理流程" },
      ],
      render: renderFlowMapper,
      mount: mountFlowMapper,
    },
  ];

  const categories = ["全部", ...new Set(tools.map((tool) => tool.category))];
  const toolMap = new Map(tools.map((tool) => [tool.id, tool]));
  const state = {
    search: "",
    category: "全部",
    favorites: loadStorage(STORAGE_KEYS.favorites, []),
    activeTool: loadStorage(STORAGE_KEYS.lastTool, tools[0].id),
  };

  init();

  function init() {
    dom.metricToolCount.textContent = String(tools.length);
    bindJumpButtons();
    bindGlobalEvents();
    renderCategoryChips();
    renderToolGrid();
    renderWorkspace();
  }

  function bindJumpButtons() {
    document.querySelectorAll("[data-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById(button.getAttribute("data-jump"))?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function bindGlobalEvents() {
    dom.toolSearch.addEventListener("input", (event) => {
      state.search = event.target.value.trim().toLowerCase();
      renderToolGrid();
    });

    dom.categoryChips.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-category]");
      if (!chip) return;
      state.category = chip.getAttribute("data-category");
      renderCategoryChips();
      renderToolGrid();
    });

    dom.toolGrid.addEventListener("click", (event) => {
      const favoriteButton = event.target.closest("[data-action='favorite']");
      if (favoriteButton) {
        toggleFavorite(favoriteButton.getAttribute("data-tool-id"));
        return;
      }
      const card = event.target.closest("[data-tool-id]");
      if (!card) return;
      openTool(card.getAttribute("data-tool-id"));
    });

    dom.toggleFavoriteBtn.addEventListener("click", () => toggleFavorite(state.activeTool));
    dom.openSampleBtn.addEventListener("click", () => runtime.currentToolApi?.loadSample?.());
  }

  function renderCategoryChips() {
    dom.categoryChips.innerHTML = categories
      .map(
        (category) => `
          <button type="button" class="chip-btn ${category === state.category ? "active" : ""}" data-category="${category}">
            ${escapeHtml(category)}
          </button>
        `
      )
      .join("");
  }

  function renderToolGrid() {
    const filteredTools = tools.filter((tool) => {
      const matchesCategory = state.category === "全部" || tool.category === state.category;
      const searchText = `${tool.name} ${tool.summary} ${tool.tags.join(" ")}`.toLowerCase();
      const matchesSearch = !state.search || searchText.includes(state.search);
      return matchesCategory && matchesSearch;
    });

    if (!filteredTools.length) {
      dom.toolGrid.innerHTML = `
        <article class="tool-card active">
          <div class="tool-card-head">
            <div>
              <p class="tool-card-category">No Results</p>
              <h3>Try a shorter keyword</h3>
            </div>
            <div class="tool-card-badge" style="background:#2ec4b6;">00</div>
          </div>
          <p>You can search by tool name, scenario, or tag. Try terms like JSON, PDF, resume, poster, or shift.</p>
        </article>
      `;
      return;
    }

    dom.toolGrid.innerHTML = filteredTools
      .map((tool) => {
        const favored = state.favorites.includes(tool.id);
        return `
          <article class="tool-card ${state.activeTool === tool.id ? "active" : ""}" data-tool-id="${tool.id}">
            <div class="tool-card-head">
              <div>
                <p class="tool-card-category">${escapeHtml(tool.category)}</p>
                <h3>${escapeHtml(tool.name)}</h3>
              </div>
              <div class="tool-card-badge" style="background:${tool.accent};">${escapeHtml(tool.badge)}</div>
            </div>
            <p>${escapeHtml(tool.summary)}</p>
            <div class="tool-card-tags">
              ${tool.tags.slice(0, 3).map((tag) => `<span class="tool-chip">${escapeHtml(tag)}</span>`).join("")}
            </div>
            <div class="tool-card-footer">
              <button type="button" class="mini-btn">打开工作台</button>
              <button type="button" class="tool-action-btn ${favored ? "favored" : ""}" data-action="favorite" data-tool-id="${tool.id}">
                ${favored ? "已收藏" : "收藏"}
              </button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderWorkspace() {
    const tool = toolMap.get(state.activeTool) || tools[0];

    if (runtime.currentCleanup) {
      runtime.currentCleanup();
      runtime.currentCleanup = null;
    }

    dom.workspaceTitle.textContent = tool.name;
    dom.activeToolName.textContent = tool.name;
    dom.activeToolSummary.textContent = tool.summary;
    dom.activeToolTags.innerHTML = tool.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    dom.toggleFavoriteBtn.textContent = state.favorites.includes(tool.id) ? "取消收藏" : "收藏当前工具";
    dom.workspacePanel.innerHTML = tool.render(tool);
    runtime.currentToolApi = tool.mount(dom.workspacePanel, tool) || {};
    runtime.currentCleanup = runtime.currentToolApi.cleanup || null;
    dom.openSampleBtn.disabled = !runtime.currentToolApi.loadSample;
    dom.openSampleBtn.textContent = runtime.currentToolApi.loadSample ? "载入示例" : "该工具无示例";
    renderFavoritesList();
    saveStorage(STORAGE_KEYS.lastTool, tool.id);
  }

  function renderFavoritesList() {
    if (!state.favorites.length) {
      dom.favoritesList.innerHTML = `<p class="meta-small">还没有收藏工具。收藏后会显示在这里，方便快速切换。</p>`;
      return;
    }
    dom.favoritesList.innerHTML = state.favorites
      .map((toolId) => {
        const tool = toolMap.get(toolId);
        if (!tool) return "";
        return `<button type="button" class="favorite-chip" data-open-tool="${tool.id}">${escapeHtml(tool.name)}</button>`;
      })
      .join("");
    dom.favoritesList.querySelectorAll("[data-open-tool]").forEach((button) => {
      button.addEventListener("click", () => openTool(button.getAttribute("data-open-tool")));
    });
  }

  function openTool(toolId) {
    if (!toolMap.has(toolId)) return;
    state.activeTool = toolId;
    renderToolGrid();
    renderWorkspace();
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleFavorite(toolId) {
    const favorites = new Set(state.favorites);
    if (favorites.has(toolId)) favorites.delete(toolId);
    else favorites.add(toolId);
    state.favorites = [...favorites];
    saveStorage(STORAGE_KEYS.favorites, state.favorites);
    renderToolGrid();
    dom.toggleFavoriteBtn.textContent = state.favorites.includes(state.activeTool) ? "取消收藏" : "收藏当前工具";
    renderFavoritesList();
  }

  function buildToolPanel(tool, innerHtml) {
    return `
      <section class="tool-panel" data-tool="${tool.id}">
        <div class="panel-head">
          <div class="panel-head-copy">
            <span class="card-label">${escapeHtml(tool.category)}</span>
            <h3>${escapeHtml(tool.name)}</h3>
            <p>${escapeHtml(tool.summary)}</p>
          </div>
          <div class="tool-stat-row">
            ${tool.highlights
              .map(
                (item) => `
                  <article class="tool-stat">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
        ${innerHtml}
      </section>
    `;
  }

  function loadStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  }

  function downloadText(fileName, content, type = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function uniqueFlags(flags, extra = "") {
    return [...new Set(`${flags}${extra}`.split("").filter(Boolean))].join("");
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return /[,"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (char === '"') {
        if (inQuotes && text[index + 1] === '"') {
          value += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(value);
        value = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && text[index + 1] === "\n") {
          index += 1;
        }
        row.push(value);
        rows.push(row);
        row = [];
        value = "";
      } else {
        value += char;
      }
    }

    row.push(value);
    rows.push(row);
    return rows.filter((item) => item.some((cell) => cell.trim() !== ""));
  }

  function rowsToObjects(rows) {
    if (rows.length <= 1) {
      return [];
    }
    const headers = rows[0].map((header, index) => header || `field_${index + 1}`);
    return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  }

  function objectsToCsv(items) {
    if (!items.length) {
      return "";
    }
    const headers = [...new Set(items.flatMap((item) => Object.keys(item)))];
    return [
      headers.map(csvEscape).join(","),
      ...items.map((item) => headers.map((header) => csvEscape(item[header])).join(",")),
    ].join("\n");
  }

  function parseStructured(text, format) {
    if (!text.trim()) {
      throw new Error("Please input content first.");
    }
    if (format === "json") {
      return JSON.parse(text);
    }
    if (format === "yaml") {
      if (!window.jsyaml) {
        throw new Error("YAML library is unavailable.");
      }
      return window.jsyaml.load(text);
    }
    if (format === "csv") {
      return rowsToObjects(parseCsv(text));
    }
    throw new Error(`Unsupported format: ${format}`);
  }

  function stringifyStructured(value, format, indent = 2) {
    if (format === "json") {
      return JSON.stringify(value, null, indent);
    }
    if (format === "yaml") {
      if (!window.jsyaml) {
        throw new Error("YAML library is unavailable.");
      }
      return window.jsyaml.dump(value);
    }
    if (format === "csv") {
      return objectsToCsv(Array.isArray(value) ? value : [value]);
    }
    throw new Error(`Unsupported format: ${format}`);
  }

  function renderMarkdownToHtml(text) {
    const safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (window.marked?.parse) {
      return window.marked.parse(safe, { breaks: true, gfm: true });
    }
    return safe
      .split(/\n{2,}/)
      .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function base64ToUtf8(text) {
    const binary = atob(text);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function decodeJwt(token) {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload) {
      throw new Error("Invalid JWT token.");
    }
    return {
      header: JSON.parse(base64UrlDecode(header)),
      payload: JSON.parse(base64UrlDecode(payload)),
      signature: signature || "",
    };
  }

  function base64UrlDecode(segment) {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return base64ToUtf8(padded);
  }

  async function hashSha256(text) {
    if (!window.crypto?.subtle) {
      throw new Error("Web Crypto is unavailable in this browser.");
    }
    const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function toTitleCase(text) {
    return text.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
  }

  function scoreTitle(title) {
    if (!title) return 0;
    let score = 55;
    const length = title.length;
    if (length >= 12 && length <= 28) score += 20;
    else if (length < 8 || length > 36) score -= 12;
    if (/[0-9一二三四五六七八九十]/.test(title)) score += 10;
    if (/(方法|清单|步骤|模板|方案|技巧)/.test(title)) score += 10;
    if (/(最强|绝对|无敌|暴涨|稳赚)/.test(title)) score -= 15;
    return clampNumber(score, 0, 100);
  }

  function buildTitleSuggestions(title) {
    if (!title) {
      return ["Add a concrete object, number, or outcome to make the title sharper."];
    }
    const core = title.replace(/[!?！？。]/g, "").trim();
    return [
      `${core}：practical steps and reusable templates`,
      `${core} from idea to launch`,
      `5 details to avoid missing when doing ${core}`,
    ];
  }

  function findSensitiveWords(text) {
    const words = ["最强", "绝对", "无敌", "稳赚", "第一", "顶级", "暴涨", "内幕"];
    return [...new Set(words.filter((word) => text.includes(word)))];
  }

  function toDatetimeLocalValue(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}`;
  }

  function buildStandaloneHtml(title, body) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: "Noto Sans SC", sans-serif; margin: 0; padding: 32px; color: #10222d; background: #f6f4ef; }
    h1, h2, h3 { font-family: "Syne", "Noto Sans SC", sans-serif; }
    pre { white-space: pre-wrap; }
    code { padding: 2px 6px; border-radius: 8px; background: #eef2f4; }
  </style>
</head>
<body>${body}</body>
</html>`;
  }

  function bindTabs(root, initialPane) {
    const buttons = root.querySelectorAll("[data-tab-target]");
    const panes = root.querySelectorAll("[data-tab-pane]");

    function activate(target) {
      buttons.forEach((button) => button.classList.toggle("active", button.getAttribute("data-tab-target") === target));
      panes.forEach((pane) => pane.classList.toggle("active", pane.getAttribute("data-tab-pane") === target));
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => activate(button.getAttribute("data-tab-target")));
    });

    activate(initialPane);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function createDownloadLink(blob, fileName, label) {
    const link = document.createElement("a");
    link.className = "download-btn";
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.textContent = label;
    return link;
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    });
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  function openPrintWindow(title, html) {
    const win = window.open("", "_blank", "width=960,height=1200");
    if (!win) return;
    win.document.write(buildStandaloneHtml(title, html));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  }

  function formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u4e00-\u9fa5-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function createRandomPalette() {
    const palettes = [
      { primary: "#ff7d4d", secondary: "#35c6ba", surface: "#10222d" },
      { primary: "#f24f13", secondary: "#f7d24b", surface: "#17212a" },
      { primary: "#0081a7", secondary: "#f07167", surface: "#10212f" },
      { primary: "#60d394", secondary: "#ffd97d", surface: "#15252a" },
    ];
    return palettes[Math.floor(Math.random() * palettes.length)];
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    const lines = [];
    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });
    if (line) lines.push(line);
    lines.forEach((current, index) => {
      ctx.fillText(current, x, y + index * lineHeight);
    });
  }

  function parseIndentedTree(text) {
    const lines = text
      .replace(/\t/g, "  ")
      .split("\n")
      .map((line) => ({ raw: line, value: line.trim() }))
      .filter((item) => item.value);
    const roots = [];
    const stack = [];
    lines.forEach((item) => {
      const indent = item.raw.match(/^ */)[0].length / 2;
      const node = { label: item.value, children: [] };
      while (stack.length && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      if (!stack.length) roots.push(node);
      else stack[stack.length - 1].node.children.push(node);
      stack.push({ indent, node });
    });
    return roots;
  }

  function layoutTree(node, depth, layoutState) {
    node.depth = depth;
    layoutState.maxDepth = Math.max(layoutState.maxDepth, depth);
    if (!node.children.length) {
      layoutState.leafIndex += 1;
      node.x = depth * 240 + 140;
      node.y = layoutState.leafIndex * 100;
      return;
    }
    node.children.forEach((child) => layoutTree(child, depth + 1, layoutState));
    node.x = depth * 240 + 140;
    node.y = node.children.reduce((sum, child) => sum + child.y, 0) / Math.max(1, node.children.length);
  }

  function collectFlowItems(node, nodes, links) {
    nodes.push(node);
    node.children.forEach((child) => {
      links.push({ x1: node.x, y1: node.y, x2: child.x, y2: child.y });
      collectFlowItems(child, nodes, links);
    });
  }

  function buildFlowSvg(forest) {
    const virtualRoot = { label: "ROOT", children: forest };
    const layoutState = { leafIndex: 0, maxDepth: 0 };
    layoutTree(virtualRoot, 0, layoutState);
    const nodes = [];
    const links = [];
    collectFlowItems(virtualRoot, nodes, links);
    const width = Math.max(900, (layoutState.maxDepth + 1) * 260);
    const height = Math.max(420, layoutState.leafIndex * 110 + 120);
    return `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff8f5c" />
            <stop offset="100%" stop-color="#2ec4b6" />
          </linearGradient>
        </defs>
        ${links
          .map(
            (link) => `
              <path d="M ${link.x1} ${link.y1} C ${link.x1 + 80} ${link.y1}, ${link.x2 - 80} ${link.y2}, ${link.x2} ${link.y2}"
                    fill="none" stroke="url(#line-gradient)" stroke-width="3" opacity="0.85" />
            `
          )
          .join("")}
        ${nodes
          .filter((node) => node.label !== "ROOT")
          .map(
            (node) => `
              <g>
                <rect x="${node.x - 84}" y="${node.y - 26}" width="168" height="52" rx="16" fill="rgba(11,22,30,0.94)" stroke="rgba(255,255,255,0.16)" />
                <text x="${node.x}" y="${node.y + 8}" fill="#f4f3ee" font-family="Noto Sans SC" font-size="16" text-anchor="middle">${escapeHtml(
                  node.label
                )}</text>
              </g>
            `
          )
          .join("")}
      </svg>
    `;
  }

  function renderDataFactory(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Input</h4>
            <div class="preview-grid">
              <label class="field">
                <span>From</span>
                <select id="data-input-format">
                  <option value="json">JSON</option>
                  <option value="yaml">YAML</option>
                  <option value="csv">CSV</option>
                </select>
              </label>
              <label class="field">
                <span>To</span>
                <select id="data-output-format">
                  <option value="json">JSON</option>
                  <option value="yaml">YAML</option>
                  <option value="csv">CSV</option>
                </select>
              </label>
            </div>
            <label class="text-area-wrap">
              <span>Source</span>
              <textarea id="data-input" class="panel-textarea" spellcheck="false"></textarea>
            </label>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="data-convert-btn">Convert</button>
              <button type="button" class="action-pill" id="data-pretty-btn">Pretty JSON</button>
              <button type="button" class="action-pill" id="data-minify-btn">Minify JSON</button>
              <button type="button" class="action-pill" id="data-swap-btn">Swap</button>
            </div>
          </section>
          <section class="result-card">
            <h4>Output</h4>
            <div class="output-meta">
              <article><span>Type</span><strong id="data-output-kind">-</strong></article>
              <article><span>Count</span><strong id="data-output-count">0</strong></article>
              <article><span>Chars</span><strong id="data-output-length">0</strong></article>
            </div>
            <pre id="data-output" class="code-output"></pre>
            <p id="data-status" class="status-text">Ready.</p>
            <div class="result-actions">
              <button type="button" class="download-btn" id="data-download-btn">Download</button>
              <button type="button" class="download-btn" id="data-copy-btn">Copy</button>
            </div>
          </section>
        </div>
      `
    );
  }

  function mountDataFactory(root) {
    const input = root.querySelector("#data-input");
    const inputFormat = root.querySelector("#data-input-format");
    const outputFormat = root.querySelector("#data-output-format");
    const output = root.querySelector("#data-output");
    const kind = root.querySelector("#data-output-kind");
    const count = root.querySelector("#data-output-count");
    const length = root.querySelector("#data-output-length");
    const status = root.querySelector("#data-status");

    const sample = JSON.stringify(
      [
        { name: "JSON Formatter", users: 1200, category: "developer" },
        { name: "PDF Merge", users: 820, category: "document" },
        { name: "Resume Builder", users: 610, category: "business" }
      ],
      null,
      2
    );

    function updateMetrics(value, text) {
      kind.textContent = Array.isArray(value) ? "array" : typeof value;
      count.textContent = String(Array.isArray(value) ? value.length : Object.keys(value || {}).length || 1);
      length.textContent = String(text.length);
    }

    function convert(mode = "convert") {
      try {
        const parsed = parseStructured(input.value, inputFormat.value);
        if (mode === "pretty" || mode === "minify") {
          outputFormat.value = "json";
        }
        const result = stringifyStructured(parsed, outputFormat.value, mode === "minify" ? 0 : 2);
        output.textContent = result;
        updateMetrics(parsed, result);
        status.textContent = "Converted successfully.";
        status.className = "status-text good";
      } catch (error) {
        output.textContent = "";
        kind.textContent = "-";
        count.textContent = "0";
        length.textContent = "0";
        status.textContent = error.message;
        status.className = "status-text bad";
      }
    }

    root.querySelector("#data-convert-btn").addEventListener("click", () => convert("convert"));
    root.querySelector("#data-pretty-btn").addEventListener("click", () => convert("pretty"));
    root.querySelector("#data-minify-btn").addEventListener("click", () => convert("minify"));
    root.querySelector("#data-swap-btn").addEventListener("click", () => {
      const current = inputFormat.value;
      inputFormat.value = outputFormat.value;
      outputFormat.value = current;
    });
    root.querySelector("#data-download-btn").addEventListener("click", () => {
      if (!output.textContent.trim()) return;
      downloadText(`asterlab-output.${outputFormat.value === "yaml" ? "yml" : outputFormat.value}`, output.textContent);
    });
    root.querySelector("#data-copy-btn").addEventListener("click", async () => {
      if (!output.textContent.trim()) return;
      await copyText(output.textContent);
      status.textContent = "Copied to clipboard.";
      status.className = "status-text good";
    });

    function loadSample() {
      input.value = sample;
      inputFormat.value = "json";
      outputFormat.value = "yaml";
      convert();
    }

    loadSample();
    return { loadSample };
  }
  function renderMarkdownStudio(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Editor</h4>
            <label class="text-area-wrap">
              <span>Markdown</span>
              <textarea id="md-input" class="panel-textarea" spellcheck="false"></textarea>
            </label>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="md-render-btn">Render</button>
              <button type="button" class="action-pill" id="md-download-md-btn">Download MD</button>
              <button type="button" class="action-pill" id="md-download-html-btn">Export HTML</button>
              <button type="button" class="action-pill" id="md-copy-html-btn">Copy HTML</button>
            </div>
          </section>
          <section class="preview-card">
            <h4>Preview</h4>
            <div class="output-meta">
              <article><span>Chars</span><strong id="md-char-count">0</strong></article>
              <article><span>Words</span><strong id="md-word-count">0</strong></article>
              <article><span>Headings</span><strong id="md-heading-count">0</strong></article>
            </div>
            <div id="md-preview" class="preview-scroll markdown-preview"></div>
            <p id="md-status" class="status-text">Preview updates on input.</p>
          </section>
        </div>
      `
    );
  }

  function mountMarkdownStudio(root) {
    const input = root.querySelector("#md-input");
    const preview = root.querySelector("#md-preview");
    const charCount = root.querySelector("#md-char-count");
    const wordCount = root.querySelector("#md-word-count");
    const headingCount = root.querySelector("#md-heading-count");
    const status = root.querySelector("#md-status");

    const sample = `# AsterLab Tools\n\nTurn small front-end workflows into deployable products.\n\n## Why it works\n\n- local-first\n- GitHub Pages ready\n- easy to expand\n\n> Start with one useful feature, then stack polish and exports.\n`;

    function render() {
      const text = input.value;
      preview.innerHTML = renderMarkdownToHtml(text);
      charCount.textContent = String(text.length);
      wordCount.textContent = String(text.trim() ? text.trim().split(/\s+/).length : 0);
      headingCount.textContent = String((text.match(/^#{1,6}\s+/gm) || []).length);
      status.textContent = "Preview updated.";
      status.className = "status-text good";
    }

    input.addEventListener("input", debounce(render, 150));
    root.querySelector("#md-render-btn").addEventListener("click", render);
    root.querySelector("#md-download-md-btn").addEventListener("click", () => downloadText("asterlab-note.md", input.value));
    root.querySelector("#md-download-html-btn").addEventListener("click", () => {
      downloadText("asterlab-note.html", buildStandaloneHtml("Markdown Export", preview.innerHTML), "text/html");
    });
    root.querySelector("#md-copy-html-btn").addEventListener("click", async () => {
      await copyText(preview.innerHTML);
      status.textContent = "HTML copied.";
      status.className = "status-text good";
    });

    function loadSample() {
      input.value = sample;
      render();
    }

    loadSample();
    return { loadSample };
  }

  function renderTextWorkshop(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Cleaner</h4>
            <label class="text-area-wrap">
              <span>Source text</span>
              <textarea id="text-source" class="panel-textarea" spellcheck="false"></textarea>
            </label>
            <div class="preview-grid">
              <label class="field"><span>Case</span><select id="text-case"><option value="none">None</option><option value="upper">UPPER</option><option value="lower">lower</option><option value="title">Title</option></select></label>
              <label class="field"><span>Sort</span><select id="text-sort"><option value="none">None</option><option value="asc">ASC</option><option value="desc">DESC</option></select></label>
              <label class="field"><span>Find</span><input id="text-find" class="panel-input" type="text" /></label>
              <label class="field"><span>Replace</span><input id="text-replace" class="panel-input" type="text" /></label>
            </div>
            <div class="compact-actions">
              <label><input id="text-trim" type="checkbox" checked /> trim</label>
              <label><input id="text-empty" type="checkbox" checked /> drop empty lines</label>
              <label><input id="text-dedupe" type="checkbox" /> dedupe</label>
            </div>
            <label class="field" style="margin-top:16px;"><span>Title analysis</span><input id="title-input" class="panel-input" type="text" /></label>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="text-process-btn">Process</button>
              <button type="button" class="action-pill" id="title-analyze-btn">Analyze title</button>
            </div>
          </section>
          <section class="result-card">
            <h4>Result</h4>
            <div class="output-meta">
              <article><span>Lines</span><strong id="text-line-count">0</strong></article>
              <article><span>Unique</span><strong id="text-unique-count">0</strong></article>
              <article><span>Title score</span><strong id="title-score">0</strong></article>
            </div>
            <pre id="text-output" class="plain-output"></pre>
            <div id="text-analysis" class="analysis-list"></div>
          </section>
        </div>
      `
    );
  }

  function mountTextWorkshop(root) {
    const source = root.querySelector("#text-source");
    const output = root.querySelector("#text-output");
    const titleInput = root.querySelector("#title-input");
    const analysis = root.querySelector("#text-analysis");
    const lineCount = root.querySelector("#text-line-count");
    const uniqueCount = root.querySelector("#text-unique-count");
    const titleScore = root.querySelector("#title-score");

    function process() {
      let lines = source.value.replace(/\r\n/g, "\n").split("\n");
      if (root.querySelector("#text-trim").checked) lines = lines.map((line) => line.trim());
      if (root.querySelector("#text-empty").checked) lines = lines.filter(Boolean);
      const uniqueLines = [...new Set(lines)];
      if (root.querySelector("#text-dedupe").checked) lines = uniqueLines;
      const findText = root.querySelector("#text-find").value;
      const replaceText = root.querySelector("#text-replace").value;
      if (findText) lines = lines.map((line) => line.split(findText).join(replaceText));
      const caseMode = root.querySelector("#text-case").value;
      if (caseMode === "upper") lines = lines.map((line) => line.toUpperCase());
      else if (caseMode === "lower") lines = lines.map((line) => line.toLowerCase());
      else if (caseMode === "title") lines = lines.map((line) => toTitleCase(line));
      const sortMode = root.querySelector("#text-sort").value;
      if (sortMode === "asc") lines = [...lines].sort((a, b) => a.localeCompare(b, "zh-CN"));
      else if (sortMode === "desc") lines = [...lines].sort((a, b) => b.localeCompare(a, "zh-CN"));
      output.textContent = lines.join("\n");
      lineCount.textContent = String(lines.length);
      uniqueCount.textContent = String(uniqueLines.length);
      analyzeTitle();
      analyzeBody(lines.join("\n"));
    }

    function analyzeTitle() {
      const title = titleInput.value.trim();
      const score = scoreTitle(title);
      titleScore.textContent = String(score);
      const sensitive = findSensitiveWords(title);
      analysis.innerHTML = `
        <article class="analysis-item">
          <strong>Title suggestions</strong>
          <div class="tool-list">
            ${buildTitleSuggestions(title).map((item) => `<div class="timeline-item">${escapeHtml(item)}</div>`).join("")}
          </div>
        </article>
        <article class="analysis-item">
          <strong>Sensitive words in title</strong>
          <p class="muted">${sensitive.length ? escapeHtml(sensitive.join(", ")) : "No preset risky words found."}</p>
        </article>
      `;
    }

    function analyzeBody(text) {
      const sensitive = findSensitiveWords(text);
      const card = document.createElement("article");
      card.className = "analysis-item";
      card.innerHTML = `<strong>Body scan</strong><p class="muted">${sensitive.length ? escapeHtml(sensitive.join(", ")) : "No preset risky words found."}</p>`;
      const cards = analysis.querySelectorAll(".analysis-item");
      if (cards[2]) cards[2].replaceWith(card);
      else analysis.appendChild(card);
    }

    root.querySelector("#text-process-btn").addEventListener("click", process);
    root.querySelector("#title-analyze-btn").addEventListener("click", analyzeTitle);

    function loadSample() {
      source.value = "  tool page  \nfront-end tool page\nfront-end tool page\nGitHub Pages\nstatic hosting\n";
      titleInput.value = "How to build a front-end tool page that can ship fast";
      root.querySelector("#text-find").value = "tool";
      root.querySelector("#text-replace").value = "utility";
      process();
    }

    loadSample();
    return { loadSample };
  }
  function renderRegexLab(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Pattern</h4>
            <div class="preview-grid">
              <label class="field"><span>Regex</span><input id="regex-pattern" class="panel-input mono" type="text" spellcheck="false" placeholder="\\btool\\w*\\b" /></label>
              <label class="field"><span>Flags</span><input id="regex-flags" class="panel-input mono" type="text" value="gi" /></label>
            </div>
            <label class="field"><span>Replacement</span><input id="regex-replacement" class="panel-input mono" type="text" value="[[$&]]" /></label>
            <label class="text-area-wrap"><span>Source</span><textarea id="regex-source" class="panel-textarea" spellcheck="false"></textarea></label>
            <div class="panel-actions"><button type="button" class="action-pill" id="regex-run-btn">Run</button></div>
          </section>
          <section class="result-card">
            <h4>Matches</h4>
            <div class="output-meta">
              <article><span>Count</span><strong id="regex-match-count">0</strong></article>
              <article><span>Output chars</span><strong id="regex-output-length">0</strong></article>
              <article><span>Status</span><strong id="regex-state">idle</strong></article>
            </div>
            <div id="regex-matches" class="list-output"></div>
            <h4 style="margin-top:18px;">Replacement preview</h4>
            <pre id="regex-output" class="plain-output"></pre>
          </section>
        </div>
      `
    );
  }

  function mountRegexLab(root) {
    const pattern = root.querySelector("#regex-pattern");
    const flags = root.querySelector("#regex-flags");
    const replacement = root.querySelector("#regex-replacement");
    const source = root.querySelector("#regex-source");
    const matches = root.querySelector("#regex-matches");
    const count = root.querySelector("#regex-match-count");
    const outputLength = root.querySelector("#regex-output-length");
    const stateEl = root.querySelector("#regex-state");
    const output = root.querySelector("#regex-output");

    function run() {
      try {
        const regex = new RegExp(pattern.value, flags.value);
        const listRegex = new RegExp(pattern.value, uniqueFlags(flags.value, "g"));
        const allMatches = Array.from(source.value.matchAll(listRegex));
        count.textContent = String(allMatches.length);
        stateEl.textContent = "success";
        matches.innerHTML = allMatches.length
          ? allMatches
              .map((match, index) => {
                const groups = match.slice(1).filter((item) => item !== undefined);
                return `
                  <div class="timeline-item">
                    <strong>#${index + 1} @ ${match.index}</strong>
                    <div class="mono">${escapeHtml(match[0])}</div>
                    <div class="muted">${groups.length ? `groups: ${escapeHtml(groups.join(" | "))}` : "no extra groups"}</div>
                  </div>
                `;
              })
              .join("")
          : `<div class="timeline-item">No matches.</div>`;
        const replaced = source.value.replace(regex, replacement.value);
        output.textContent = replaced;
        outputLength.textContent = String(replaced.length);
      } catch (error) {
        count.textContent = "0";
        outputLength.textContent = "0";
        stateEl.textContent = "error";
        matches.innerHTML = `<div class="timeline-item">${escapeHtml(error.message)}</div>`;
        output.textContent = "";
      }
    }

    root.querySelector("#regex-run-btn").addEventListener("click", run);

    function loadSample() {
      source.value = "tool toolkit Tooling text front-end tool studio";
      run();
    }

    loadSample();
    return { loadSample };
  }

  function renderDevToolbox(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="tool-panel-tabs" data-tab-group="dev-toolbox">
          <button type="button" class="active" data-tab-target="base64">Base64</button>
          <button type="button" data-tab-target="jwt">JWT</button>
          <button type="button" data-tab-target="uuid-hash">UUID / Hash</button>
        </div>
        <div class="tab-pane active" data-tab-pane="base64">
          <div class="panel-grid">
            <section class="sub-panel">
              <h4>Base64</h4>
              <label class="text-area-wrap"><span>Input</span><textarea id="base64-input" class="panel-textarea" spellcheck="false"></textarea></label>
              <div class="panel-actions">
                <button type="button" class="action-pill" id="base64-encode-btn">Encode</button>
                <button type="button" class="action-pill" id="base64-decode-btn">Decode</button>
              </div>
            </section>
            <section class="result-card"><h4>Result</h4><pre id="base64-output" class="plain-output"></pre></section>
          </div>
        </div>
        <div class="tab-pane" data-tab-pane="jwt">
          <div class="panel-grid">
            <section class="sub-panel">
              <h4>JWT decode</h4>
              <label class="text-area-wrap"><span>Token</span><textarea id="jwt-input" class="panel-textarea mono" spellcheck="false"></textarea></label>
              <div class="panel-actions"><button type="button" class="action-pill" id="jwt-decode-btn">Decode token</button></div>
            </section>
            <section class="result-card"><h4>Payload</h4><pre id="jwt-output" class="code-output"></pre></section>
          </div>
        </div>
        <div class="tab-pane" data-tab-pane="uuid-hash">
          <div class="panel-grid">
            <section class="sub-panel">
              <h4>UUID</h4>
              <label class="field"><span>Count</span><input id="uuid-count" class="panel-input" type="number" value="5" min="1" max="50" /></label>
              <div class="panel-actions"><button type="button" class="action-pill" id="uuid-generate-btn">Generate UUIDs</button></div>
              <pre id="uuid-output" class="plain-output"></pre>
            </section>
            <section class="result-card">
              <h4>SHA-256</h4>
              <label class="text-area-wrap"><span>Input</span><textarea id="hash-input" class="panel-textarea" spellcheck="false"></textarea></label>
              <div class="panel-actions"><button type="button" class="action-pill" id="hash-generate-btn">Hash text</button></div>
              <pre id="hash-output" class="plain-output"></pre>
            </section>
          </div>
        </div>
      `
    );
  }

  function mountDevToolbox(root) {
    bindTabs(root, "base64");
    const base64Input = root.querySelector("#base64-input");
    const base64Output = root.querySelector("#base64-output");
    const jwtInput = root.querySelector("#jwt-input");
    const jwtOutput = root.querySelector("#jwt-output");
    const uuidOutput = root.querySelector("#uuid-output");
    const hashInput = root.querySelector("#hash-input");
    const hashOutput = root.querySelector("#hash-output");

    root.querySelector("#base64-encode-btn").addEventListener("click", () => {
      base64Output.textContent = utf8ToBase64(base64Input.value);
    });
    root.querySelector("#base64-decode-btn").addEventListener("click", () => {
      try {
        base64Output.textContent = base64ToUtf8(base64Input.value);
      } catch (error) {
        base64Output.textContent = error.message;
      }
    });
    root.querySelector("#jwt-decode-btn").addEventListener("click", () => {
      try {
        jwtOutput.textContent = JSON.stringify(decodeJwt(jwtInput.value), null, 2);
      } catch (error) {
        jwtOutput.textContent = error.message;
      }
    });
    root.querySelector("#uuid-generate-btn").addEventListener("click", () => {
      const total = clampNumber(Number(root.querySelector("#uuid-count").value) || 1, 1, 50);
      uuidOutput.textContent = Array.from({ length: total }, () => crypto.randomUUID()).join("\n");
    });
    root.querySelector("#hash-generate-btn").addEventListener("click", async () => {
      try {
        hashOutput.textContent = await hashSha256(hashInput.value);
      } catch (error) {
        hashOutput.textContent = error.message;
      }
    });

    function loadSample() {
      base64Input.value = "AsterLab Tools";
      base64Output.textContent = utf8ToBase64(base64Input.value);
      jwtInput.value =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0IjoiQXN0ZXJMYWIiLCJyb2xlIjoiZGV2ZWxvcGVyIiwiaWF0IjoxNzEyMDAwMDAwfQ.signature";
      jwtOutput.textContent = JSON.stringify(decodeJwt(jwtInput.value), null, 2);
      uuidOutput.textContent = Array.from({ length: 3 }, () => crypto.randomUUID()).join("\n");
      hashInput.value = "ship static tools to GitHub Pages";
      hashSha256(hashInput.value).then((value) => {
        hashOutput.textContent = value;
      });
    }

    loadSample();
    return { loadSample };
  }

  function renderTimeZoneTool(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Time input</h4>
            <div class="panel-stack">
              <label class="field"><span>Local datetime</span><input id="tz-local" class="panel-input" type="datetime-local" /></label>
              <label class="field"><span>Unix ms</span><input id="tz-ms" class="panel-input mono" type="number" /></label>
              <label class="field"><span>Unix sec</span><input id="tz-sec" class="panel-input mono" type="number" /></label>
              <div class="panel-actions"><button type="button" class="action-pill" id="tz-now-btn">Use current time</button></div>
            </div>
          </section>
          <section class="result-card">
            <h4>Zone view</h4>
            <div class="output-meta">
              <article><span>ISO</span><strong id="tz-iso">-</strong></article>
              <article><span>Weekday</span><strong id="tz-weekday">-</strong></article>
              <article><span>Local label</span><strong id="tz-local-label">-</strong></article>
            </div>
            <div id="tz-grid" class="timezone-grid"></div>
          </section>
        </div>
      `
    );
  }

  function mountTimeZoneTool(root) {
    const localInput = root.querySelector("#tz-local");
    const msInput = root.querySelector("#tz-ms");
    const secInput = root.querySelector("#tz-sec");
    const iso = root.querySelector("#tz-iso");
    const weekday = root.querySelector("#tz-weekday");
    const localLabel = root.querySelector("#tz-local-label");
    const grid = root.querySelector("#tz-grid");
    const zones = [
      { label: "Shanghai", zone: "Asia/Shanghai" },
      { label: "Tokyo", zone: "Asia/Tokyo" },
      { label: "London", zone: "Europe/London" },
      { label: "New York", zone: "America/New_York" },
      { label: "Los Angeles", zone: "America/Los_Angeles" },
      { label: "UTC", zone: "UTC" },
    ];

    function setFromDate(date) {
      if (Number.isNaN(date.getTime())) return;
      localInput.value = toDatetimeLocalValue(date);
      msInput.value = String(date.getTime());
      secInput.value = String(Math.floor(date.getTime() / 1000));
      iso.textContent = date.toISOString();
      weekday.textContent = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
      localLabel.textContent = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "medium" }).format(date);
      grid.innerHTML = zones
        .map((item) => {
          const text = new Intl.DateTimeFormat("en-US", { timeZone: item.zone, dateStyle: "medium", timeStyle: "short" }).format(date);
          return `
            <article class="timezone-card">
              <span>${escapeHtml(item.zone)}</span>
              <strong>${escapeHtml(item.label)}</strong>
              <p class="muted">${escapeHtml(text)}</p>
            </article>
          `;
        })
        .join("");
    }

    localInput.addEventListener("change", () => setFromDate(new Date(localInput.value)));
    msInput.addEventListener("change", () => setFromDate(new Date(Number(msInput.value))));
    secInput.addEventListener("change", () => setFromDate(new Date(Number(secInput.value) * 1000)));
    root.querySelector("#tz-now-btn").addEventListener("click", () => setFromDate(new Date()));

    function loadSample() {
      setFromDate(new Date());
    }

    loadSample();
    return { loadSample };
  }
  function renderPdfWorkbench(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Upload PDFs</h4>
            <label class="dropzone">
              <input id="pdf-input" type="file" accept="application/pdf" multiple />
              <strong>Select PDF files</strong>
              <span>Merge uses all files. Split uses the first file only.</span>
            </label>
            <label class="field">
              <span>Split ranges</span>
              <input id="pdf-ranges" class="panel-input mono" type="text" placeholder="blank = each page, or 1-2,4" />
            </label>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="pdf-merge-btn">Merge PDFs</button>
              <button type="button" class="action-pill" id="pdf-split-btn">Split PDF</button>
            </div>
            <div id="pdf-file-list" class="pdf-list"></div>
          </section>
          <section class="result-card">
            <h4>Output</h4>
            <p id="pdf-status" class="status-text">Upload PDF files to start.</p>
            <div id="pdf-output" class="list-output"></div>
          </section>
        </div>
      `
    );
  }

  function mountPdfWorkbench(root) {
    const input = root.querySelector("#pdf-input");
    const rangesInput = root.querySelector("#pdf-ranges");
    const list = root.querySelector("#pdf-file-list");
    const output = root.querySelector("#pdf-output");
    const status = root.querySelector("#pdf-status");
    let files = [];

    function renderFiles() {
      list.innerHTML = files.length
        ? files
            .map(
              (file) => `
                <div class="pdf-item">
                  <span>${escapeHtml(file.name)}</span>
                  <span class="muted">${formatBytes(file.size)}</span>
                </div>
              `
            )
            .join("")
        : `<p class="muted">No files selected yet.</p>`;
    }

    function parseRanges(text, totalPages) {
      if (!text.trim()) {
        return Array.from({ length: totalPages }, (_, index) => [index + 1]);
      }
      return text
        .split(",")
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk) => {
          if (chunk.includes("-")) {
            const [start, end] = chunk.split("-").map((value) => clampNumber(Number(value) || 1, 1, totalPages));
            return Array.from({ length: end - start + 1 }, (_, index) => start + index);
          }
          return [clampNumber(Number(chunk) || 1, 1, totalPages)];
        });
    }

    input.addEventListener("change", () => {
      files = Array.from(input.files || []);
      renderFiles();
      status.textContent = files.length ? `${files.length} PDF file(s) ready.` : "Upload PDF files to start.";
      status.className = "status-text";
    });

    root.querySelector("#pdf-merge-btn").addEventListener("click", async () => {
      if (!files.length) {
        status.textContent = "Please select PDF files first.";
        status.className = "status-text bad";
        return;
      }
      if (!window.PDFLib?.PDFDocument) {
        status.textContent = "pdf-lib is not available.";
        status.className = "status-text bad";
        return;
      }
      try {
        output.innerHTML = "";
        status.textContent = "Merging PDFs...";
        status.className = "status-text warn";
        const merged = await window.PDFLib.PDFDocument.create();
        for (const file of files) {
          const source = await window.PDFLib.PDFDocument.load(await file.arrayBuffer());
          const pages = await merged.copyPages(source, source.getPageIndices());
          pages.forEach((page) => merged.addPage(page));
        }
        const bytes = await merged.save();
        output.appendChild(createDownloadLink(new Blob([bytes], { type: "application/pdf" }), "asterlab-merged.pdf", "Download merged PDF"));
        status.textContent = "Merge complete.";
        status.className = "status-text good";
      } catch (error) {
        status.textContent = error.message;
        status.className = "status-text bad";
      }
    });

    root.querySelector("#pdf-split-btn").addEventListener("click", async () => {
      if (!files.length) {
        status.textContent = "Upload at least one PDF first.";
        status.className = "status-text bad";
        return;
      }
      if (!window.PDFLib?.PDFDocument) {
        status.textContent = "pdf-lib is not available.";
        status.className = "status-text bad";
        return;
      }
      try {
        output.innerHTML = "";
        status.textContent = "Splitting PDF...";
        status.className = "status-text warn";
        const source = await window.PDFLib.PDFDocument.load(await files[0].arrayBuffer());
        const totalPages = source.getPageCount();
        const groups = parseRanges(rangesInput.value, totalPages);
        for (const group of groups) {
          const doc = await window.PDFLib.PDFDocument.create();
          const pages = await doc.copyPages(source, group.map((page) => page - 1));
          pages.forEach((page) => doc.addPage(page));
          const bytes = await doc.save();
          output.appendChild(
            createDownloadLink(new Blob([bytes], { type: "application/pdf" }), `asterlab-pages-${group.join("-")}.pdf`, `Download pages ${group.join(", ")}`)
          );
        }
        status.textContent = `Generated ${groups.length} split file(s).`;
        status.className = "status-text good";
      } catch (error) {
        status.textContent = error.message;
        status.className = "status-text bad";
      }
    });

    renderFiles();
    return {};
  }

  function renderImageLab(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Image processing</h4>
            <label class="dropzone">
              <input id="image-input" type="file" accept="image/*" />
              <strong>Select an image</strong>
              <span>Crop, resize, watermark, and export locally.</span>
            </label>
            <div class="preview-grid">
              <label class="field"><span>Crop X</span><input id="crop-x" class="panel-input" type="number" value="0" min="0" /></label>
              <label class="field"><span>Crop Y</span><input id="crop-y" class="panel-input" type="number" value="0" min="0" /></label>
              <label class="field"><span>Crop W</span><input id="crop-w" class="panel-input" type="number" value="0" min="1" /></label>
              <label class="field"><span>Crop H</span><input id="crop-h" class="panel-input" type="number" value="0" min="1" /></label>
              <label class="field"><span>Scale %</span><input id="image-scale" class="panel-input" type="number" value="100" min="10" max="200" /></label>
              <label class="field"><span>Quality</span><input id="image-quality" class="panel-input" type="number" value="0.85" min="0.1" max="1" step="0.05" /></label>
              <label class="field"><span>Format</span><select id="image-format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></label>
              <label class="field"><span>Watermark</span><input id="watermark-text" class="panel-input" type="text" placeholder="AsterLab" /></label>
            </div>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="image-apply-btn">Render</button>
              <button type="button" class="action-pill" id="image-reset-btn">Reset crop</button>
              <button type="button" class="action-pill" id="image-download-btn">Download image</button>
            </div>
          </section>
          <section class="result-card">
            <h4>Preview</h4>
            <div class="output-meta">
              <article><span>Original</span><strong id="image-original-size">-</strong></article>
              <article><span>Output</span><strong id="image-result-size">-</strong></article>
              <article><span>File size</span><strong id="image-result-bytes">-</strong></article>
            </div>
            <div class="canvas-frame"><canvas id="image-canvas" width="900" height="560"></canvas></div>
            <p id="image-status" class="status-text">Select an image to start.</p>
          </section>
        </div>
      `
    );
  }

  function mountImageLab(root) {
    const input = root.querySelector("#image-input");
    const canvas = root.querySelector("#image-canvas");
    const ctx = canvas.getContext("2d");
    const originalSize = root.querySelector("#image-original-size");
    const resultSize = root.querySelector("#image-result-size");
    const resultBytes = root.querySelector("#image-result-bytes");
    const status = root.querySelector("#image-status");
    let image = null;
    let lastBlob = null;

    function drawPlaceholder() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#081117";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#9bb0b8";
      ctx.font = "28px Noto Sans SC";
      ctx.fillText("Upload an image to preview here", 36, 80);
    }

    function syncCropFields() {
      if (!image) return;
      root.querySelector("#crop-x").value = "0";
      root.querySelector("#crop-y").value = "0";
      root.querySelector("#crop-w").value = String(image.width);
      root.querySelector("#crop-h").value = String(image.height);
    }

    async function renderImage() {
      if (!image) {
        status.textContent = "Please select an image first.";
        status.className = "status-text bad";
        return;
      }
      const cropX = clampNumber(Number(root.querySelector("#crop-x").value) || 0, 0, image.width - 1);
      const cropY = clampNumber(Number(root.querySelector("#crop-y").value) || 0, 0, image.height - 1);
      const cropW = clampNumber(Number(root.querySelector("#crop-w").value) || image.width, 1, image.width - cropX);
      const cropH = clampNumber(Number(root.querySelector("#crop-h").value) || image.height, 1, image.height - cropY);
      const scale = clampNumber(Number(root.querySelector("#image-scale").value) || 100, 10, 200) / 100;
      const width = Math.max(1, Math.round(cropW * scale));
      const height = Math.max(1, Math.round(cropH * scale));
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, width, height);
      const watermark = root.querySelector("#watermark-text").value.trim();
      if (watermark) {
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.82)";
        ctx.font = `${Math.max(18, Math.round(width * 0.036))}px Syne`;
        ctx.textAlign = "right";
        ctx.fillText(watermark, width - 18, height - 22);
        ctx.restore();
      }
      const format = root.querySelector("#image-format").value;
      const quality = clampNumber(Number(root.querySelector("#image-quality").value) || 0.85, 0.1, 1);
      lastBlob = await canvasToBlob(canvas, format, quality);
      originalSize.textContent = `${image.width} × ${image.height}`;
      resultSize.textContent = `${width} × ${height}`;
      resultBytes.textContent = formatBytes(lastBlob.size);
      status.textContent = "Preview rendered.";
      status.className = "status-text good";
    }

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          image = img;
          syncCropFields();
          renderImage();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    root.querySelector("#image-apply-btn").addEventListener("click", renderImage);
    root.querySelector("#image-reset-btn").addEventListener("click", () => {
      syncCropFields();
      renderImage();
    });
    root.querySelector("#image-download-btn").addEventListener("click", () => {
      if (!lastBlob) return;
      const format = root.querySelector("#image-format").value;
      const extension = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
      createDownloadLink(lastBlob, `asterlab-image.${extension}`, "Download").click();
    });

    drawPlaceholder();
    return {};
  }
  function renderResumeBuilder(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Resume data</h4>
            <div class="resume-grid">
              <label class="field"><span>Name</span><input id="resume-name" class="panel-input" type="text" /></label>
              <label class="field"><span>Role</span><input id="resume-role" class="panel-input" type="text" /></label>
              <label class="field"><span>City</span><input id="resume-city" class="panel-input" type="text" /></label>
              <label class="field"><span>Email</span><input id="resume-email" class="panel-input" type="email" /></label>
              <label class="field"><span>Phone</span><input id="resume-phone" class="panel-input" type="text" /></label>
              <label class="field"><span>Website</span><input id="resume-site" class="panel-input" type="text" /></label>
            </div>
            <label class="text-area-wrap"><span>Summary</span><textarea id="resume-summary" class="panel-textarea"></textarea></label>
            <label class="field"><span>Skills (comma separated)</span><input id="resume-skills" class="panel-input" type="text" /></label>
            <label class="text-area-wrap"><span>Experience (title | company | time | detail)</span><textarea id="resume-exp" class="panel-textarea"></textarea></label>
            <label class="text-area-wrap"><span>Education (school | major | time)</span><textarea id="resume-edu" class="panel-textarea"></textarea></label>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="resume-render-btn">Render resume</button>
              <button type="button" class="action-pill" id="resume-print-btn">Print</button>
              <button type="button" class="action-pill" id="resume-download-btn">Export HTML</button>
            </div>
          </section>
          <section class="preview-card">
            <h4>Resume preview</h4>
            <div id="resume-preview" class="preview-scroll resume-preview"></div>
          </section>
        </div>
      `
    );
  }

  function mountResumeBuilder(root) {
    const keys = ["name", "role", "city", "email", "phone", "site", "summary", "skills", "exp", "edu"];
    const preview = root.querySelector("#resume-preview");

    function readData() {
      const data = Object.fromEntries(keys.map((key) => [key, root.querySelector(`#resume-${key}`).value.trim()]));
      saveStorage(STORAGE_KEYS.resume, data);
      return data;
    }

    function buildPreview(data) {
      const skills = data.skills.split(",").map((item) => item.trim()).filter(Boolean);
      const experience = data.exp
        .split("\n")
        .map((line) => line.split("|").map((part) => part.trim()))
        .filter((parts) => parts[0]);
      const education = data.edu
        .split("\n")
        .map((line) => line.split("|").map((part) => part.trim()))
        .filter((parts) => parts[0]);

      return `
        <div class="resume-header">
          <div>
            <h1>${escapeHtml(data.name || "Your Name")}</h1>
            <p class="muted">${escapeHtml(data.role || "Target Role")}</p>
            <p class="muted">${escapeHtml([data.city, data.email, data.phone].filter(Boolean).join(" / "))}</p>
          </div>
          <div class="muted">${escapeHtml(data.site || "")}</div>
        </div>
        <section class="resume-section">
          <h5>Summary</h5>
          <p>${escapeHtml(data.summary || "Write a short introduction here.")}</p>
        </section>
        <section class="resume-section">
          <h5>Skills</h5>
          <div class="tag-row">${skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
        </section>
        <section class="resume-section">
          <h5>Experience</h5>
          <div class="resume-list">
            ${experience
              .map(
                (parts) => `
                  <div class="resume-list-item">
                    <strong>${escapeHtml(parts[0])}</strong>
                    <div class="muted">${escapeHtml(parts[1] || "")}${parts[2] ? ` / ${escapeHtml(parts[2])}` : ""}</div>
                    <p>${escapeHtml(parts[3] || "")}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
        <section class="resume-section">
          <h5>Education</h5>
          <div class="resume-list">
            ${education
              .map(
                (parts) => `
                  <div class="resume-list-item">
                    <strong>${escapeHtml(parts[0])}</strong>
                    <div class="muted">${escapeHtml(parts[1] || "")}${parts[2] ? ` / ${escapeHtml(parts[2])}` : ""}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
      `;
    }

    function render() {
      preview.innerHTML = buildPreview(readData());
    }

    root.querySelector("#resume-render-btn").addEventListener("click", render);
    root.querySelector("#resume-print-btn").addEventListener("click", () => openPrintWindow("Resume", preview.innerHTML));
    root.querySelector("#resume-download-btn").addEventListener("click", () => {
      downloadText("asterlab-resume.html", buildStandaloneHtml("Resume", preview.innerHTML), "text/html");
    });
    keys.forEach((key) => root.querySelector(`#resume-${key}`).addEventListener("input", debounce(render, 120)));

    function loadSample() {
      const sample = {
        name: "Chen Xingyao",
        role: "Front-end Engineer / Tool Product Builder",
        city: "Shanghai",
        email: "hello@example.com",
        phone: "138-0000-0000",
        site: "github.com/yourname",
        summary: "I focus on turning repetitive workflows into polished static tools that can ship fast and still feel like products.",
        skills: "HTML, CSS, JavaScript, Canvas, GitHub Pages, UX Writing",
        exp:
          "Front-end Engineer | AsterLab Studio | 2024-now | Built multi-tool static products and refined interaction details\nIndependent Maker | Personal Projects | 2022-2024 | Launched several pure front-end tools across content, image, and productivity use cases",
        edu: "Tongji University | Digital Media Technology | 2018-2022",
      };
      keys.forEach((key) => {
        root.querySelector(`#resume-${key}`).value = sample[key];
      });
      render();
    }

    const stored = loadStorage(STORAGE_KEYS.resume, null);
    if (stored) {
      keys.forEach((key) => {
        root.querySelector(`#resume-${key}`).value = stored[key] || "";
      });
      render();
    } else {
      loadSample();
    }
    return { loadSample };
  }

  function renderInvoiceStudio(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Invoice setup</h4>
            <div class="invoice-grid">
              <label class="field"><span>Seller</span><input id="invoice-seller" class="panel-input" type="text" /></label>
              <label class="field"><span>Client</span><input id="invoice-client" class="panel-input" type="text" /></label>
              <label class="field"><span>Invoice No.</span><input id="invoice-no" class="panel-input" type="text" /></label>
              <label class="field"><span>Date</span><input id="invoice-date" class="panel-input" type="date" /></label>
              <label class="field"><span>Tax (%)</span><input id="invoice-tax" class="panel-input" type="number" value="6" min="0" max="100" /></label>
            </div>
            <div id="invoice-items"></div>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="invoice-add-item">Add item</button>
              <button type="button" class="action-pill" id="invoice-render-btn">Render invoice</button>
              <button type="button" class="action-pill" id="invoice-print-btn">Print</button>
              <button type="button" class="action-pill" id="invoice-download-btn">Export HTML</button>
            </div>
          </section>
          <section class="preview-card">
            <h4>Invoice preview</h4>
            <div id="invoice-preview" class="preview-scroll invoice-preview"></div>
          </section>
        </div>
      `
    );
  }

  function mountInvoiceStudio(root) {
    const itemsWrap = root.querySelector("#invoice-items");
    const preview = root.querySelector("#invoice-preview");
    let rowIds = [];

    function addRow(item = {}) {
      const id = crypto.randomUUID();
      rowIds.push(id);
      const row = document.createElement("div");
      row.className = "invoice-item-row";
      row.dataset.rowId = id;
      row.innerHTML = `
        <label class="field"><span>Item</span><input type="text" class="panel-input" data-key="name" value="${escapeHtml(item.name || "")}" /></label>
        <label class="field"><span>Qty</span><input type="number" class="panel-input" data-key="qty" value="${escapeHtml(String(item.qty || 1))}" min="0" /></label>
        <label class="field"><span>Price</span><input type="number" class="panel-input" data-key="price" value="${escapeHtml(String(item.price || 0))}" min="0" step="0.01" /></label>
        <label class="field"><span>Note</span><input type="text" class="panel-input" data-key="note" value="${escapeHtml(item.note || "")}" /></label>
        <button type="button" class="mini-btn danger" data-remove-row="${id}">Delete</button>
      `;
      itemsWrap.appendChild(row);
    }

    function readData() {
      const data = {
        seller: root.querySelector("#invoice-seller").value.trim(),
        client: root.querySelector("#invoice-client").value.trim(),
        no: root.querySelector("#invoice-no").value.trim(),
        date: root.querySelector("#invoice-date").value,
        tax: Number(root.querySelector("#invoice-tax").value) || 0,
        items: rowIds
          .map((id) => {
            const row = itemsWrap.querySelector(`[data-row-id="${id}"]`);
            if (!row) return null;
            return {
              name: row.querySelector('[data-key="name"]').value.trim(),
              qty: Number(row.querySelector('[data-key="qty"]').value) || 0,
              price: Number(row.querySelector('[data-key="price"]').value) || 0,
              note: row.querySelector('[data-key="note"]').value.trim(),
            };
          })
          .filter(Boolean)
          .filter((item) => item.name),
      };
      saveStorage(STORAGE_KEYS.invoice, data);
      return data;
    }

    function buildPreview(data) {
      const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
      const taxAmount = subtotal * ((data.tax || 0) / 100);
      const total = subtotal + taxAmount;
      return `
        <div class="invoice-header">
          <div>
            <h1>Invoice</h1>
            <p class="muted">${escapeHtml(data.seller || "Seller")}</p>
          </div>
          <div>
            <div class="muted">No. ${escapeHtml(data.no || "-")}</div>
            <div class="muted">${escapeHtml(data.date || "-")}</div>
            <div class="muted">${escapeHtml(data.client || "-")}</div>
          </div>
        </div>
        <section class="invoice-section">
          <table class="invoice-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
            <tbody>
              ${data.items
                .map(
                  (item) => `
                    <tr>
                      <td>${escapeHtml(item.name)}<div class="muted">${escapeHtml(item.note || "")}</div></td>
                      <td>${item.qty}</td>
                      <td>${formatCurrency(item.price)}</td>
                      <td>${formatCurrency(item.qty * item.price)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
          <div class="invoice-totals">
            <div class="invoice-total-row"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
            <div class="invoice-total-row"><span>Tax</span><strong>${formatCurrency(taxAmount)}</strong></div>
            <div class="invoice-total-row"><span>Total</span><strong>${formatCurrency(total)}</strong></div>
          </div>
        </section>
      `;
    }

    function render() {
      preview.innerHTML = buildPreview(readData());
    }

    itemsWrap.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-row]");
      if (!removeButton) return;
      const id = removeButton.getAttribute("data-remove-row");
      rowIds = rowIds.filter((rowId) => rowId !== id);
      itemsWrap.querySelector(`[data-row-id="${id}"]`)?.remove();
      render();
    });
    itemsWrap.addEventListener("input", debounce(render, 100));
    root.querySelector("#invoice-add-item").addEventListener("click", () => addRow());
    root.querySelector("#invoice-render-btn").addEventListener("click", render);
    root.querySelector("#invoice-print-btn").addEventListener("click", () => openPrintWindow("Invoice", preview.innerHTML));
    root.querySelector("#invoice-download-btn").addEventListener("click", () => {
      downloadText("asterlab-invoice.html", buildStandaloneHtml("Invoice", preview.innerHTML), "text/html");
    });
    ["seller", "client", "no", "date", "tax"].forEach((key) => {
      root.querySelector(`#invoice-${key}`).addEventListener("input", debounce(render, 120));
    });

    function loadSample() {
      rowIds = [];
      itemsWrap.innerHTML = "";
      root.querySelector("#invoice-seller").value = "AsterLab Studio";
      root.querySelector("#invoice-client").value = "North Harbor Media";
      root.querySelector("#invoice-no").value = "AST-2026-0310";
      root.querySelector("#invoice-date").value = new Date().toISOString().slice(0, 10);
      root.querySelector("#invoice-tax").value = "6";
      addRow({ name: "Landing page design", qty: 1, price: 3800, note: "2 revision rounds" });
      addRow({ name: "Front-end development", qty: 1, price: 6200, note: "desktop + mobile" });
      addRow({ name: "Deployment support", qty: 1, price: 800, note: "GitHub Pages" });
      render();
    }

    const stored = loadStorage(STORAGE_KEYS.invoice, null);
    if (stored) {
      root.querySelector("#invoice-seller").value = stored.seller || "";
      root.querySelector("#invoice-client").value = stored.client || "";
      root.querySelector("#invoice-no").value = stored.no || "";
      root.querySelector("#invoice-date").value = stored.date || "";
      root.querySelector("#invoice-tax").value = String(stored.tax ?? 6);
      rowIds = [];
      itemsWrap.innerHTML = "";
      (stored.items || []).forEach((item) => addRow(item));
      if (!(stored.items || []).length) addRow();
      render();
    } else {
      loadSample();
    }
    return { loadSample };
  }
  function renderCalculatorCenter(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="tool-panel-tabs" data-tab-group="calculator-center">
          <button type="button" class="active" data-tab-target="mortgage">Mortgage</button>
          <button type="button" data-tab-target="compound">Compound</button>
          <button type="button" data-tab-target="health">Health</button>
        </div>
        <div class="tab-pane active" data-tab-pane="mortgage">
          <div class="panel-grid">
            <section class="sub-panel">
              <h4>Mortgage</h4>
              <div class="preview-grid">
                <label class="field"><span>Principal</span><input id="mortgage-principal" class="panel-input" type="number" value="1200000" /></label>
                <label class="field"><span>Years</span><input id="mortgage-years" class="panel-input" type="number" value="30" /></label>
                <label class="field"><span>Rate %</span><input id="mortgage-rate" class="panel-input" type="number" value="3.85" step="0.01" /></label>
              </div>
              <div class="panel-actions"><button type="button" class="action-pill" id="mortgage-calc-btn">Calculate</button></div>
            </section>
            <section class="result-card"><h4>Result</h4><div id="mortgage-result" class="result-box"></div></section>
          </div>
        </div>
        <div class="tab-pane" data-tab-pane="compound">
          <div class="panel-grid">
            <section class="sub-panel">
              <h4>Compound growth</h4>
              <div class="preview-grid">
                <label class="field"><span>Initial</span><input id="compound-principal" class="panel-input" type="number" value="50000" /></label>
                <label class="field"><span>Monthly add</span><input id="compound-monthly" class="panel-input" type="number" value="2000" /></label>
                <label class="field"><span>Rate %</span><input id="compound-rate" class="panel-input" type="number" value="8" /></label>
                <label class="field"><span>Years</span><input id="compound-years" class="panel-input" type="number" value="10" /></label>
              </div>
              <div class="panel-actions"><button type="button" class="action-pill" id="compound-calc-btn">Calculate</button></div>
            </section>
            <section class="result-card"><h4>Result</h4><div id="compound-result" class="result-box"></div></section>
          </div>
        </div>
        <div class="tab-pane" data-tab-pane="health">
          <div class="panel-grid">
            <section class="sub-panel">
              <h4>Health estimates</h4>
              <div class="preview-grid">
                <label class="field"><span>Height cm</span><input id="health-height" class="panel-input" type="number" value="175" /></label>
                <label class="field"><span>Weight kg</span><input id="health-weight" class="panel-input" type="number" value="70" /></label>
                <label class="field"><span>Age</span><input id="health-age" class="panel-input" type="number" value="28" /></label>
                <label class="field"><span>Sex</span><select id="health-sex"><option value="male">Male</option><option value="female">Female</option></select></label>
                <label class="field"><span>Activity</span><select id="health-activity"><option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55" selected>Moderate</option><option value="1.725">High</option></select></label>
              </div>
              <div class="panel-actions"><button type="button" class="action-pill" id="health-calc-btn">Calculate</button></div>
            </section>
            <section class="result-card"><h4>Result</h4><div id="health-result" class="result-box"></div></section>
          </div>
        </div>
      `
    );
  }

  function mountCalculatorCenter(root) {
    bindTabs(root, "mortgage");

    function calcMortgage() {
      const principal = Number(root.querySelector("#mortgage-principal").value) || 0;
      const years = Number(root.querySelector("#mortgage-years").value) || 0;
      const annualRate = (Number(root.querySelector("#mortgage-rate").value) || 0) / 100;
      const months = years * 12;
      const monthlyRate = annualRate / 12;
      const monthly =
        monthlyRate === 0
          ? principal / months
          : (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);
      const total = monthly * months;
      const interest = total - principal;
      root.querySelector("#mortgage-result").innerHTML = `
        <div class="summary-grid">
          <article class="timeline-item"><strong>Monthly payment</strong><div>${formatCurrency(monthly)}</div></article>
          <article class="timeline-item"><strong>Total paid</strong><div>${formatCurrency(total)}</div></article>
          <article class="timeline-item"><strong>Total interest</strong><div>${formatCurrency(interest)}</div></article>
        </div>
      `;
    }

    function calcCompound() {
      const principal = Number(root.querySelector("#compound-principal").value) || 0;
      const monthly = Number(root.querySelector("#compound-monthly").value) || 0;
      const annualRate = (Number(root.querySelector("#compound-rate").value) || 0) / 100;
      const years = Number(root.querySelector("#compound-years").value) || 0;
      const monthlyRate = annualRate / 12;
      const months = years * 12;
      let amount = principal;
      for (let index = 0; index < months; index += 1) {
        amount = amount * (1 + monthlyRate) + monthly;
      }
      const invested = principal + monthly * months;
      root.querySelector("#compound-result").innerHTML = `
        <div class="summary-grid">
          <article class="timeline-item"><strong>Final amount</strong><div>${formatCurrency(amount)}</div></article>
          <article class="timeline-item"><strong>Total invested</strong><div>${formatCurrency(invested)}</div></article>
          <article class="timeline-item"><strong>Estimated gain</strong><div>${formatCurrency(amount - invested)}</div></article>
        </div>
      `;
    }

    function calcHealth() {
      const heightCm = Number(root.querySelector("#health-height").value) || 0;
      const weight = Number(root.querySelector("#health-weight").value) || 0;
      const age = Number(root.querySelector("#health-age").value) || 0;
      const sex = root.querySelector("#health-sex").value;
      const activity = Number(root.querySelector("#health-activity").value) || 1.2;
      const height = heightCm / 100;
      const bmi = weight / (height * height);
      const bodyFat = 1.2 * bmi + 0.23 * age - (sex === "male" ? 16.2 : 5.4);
      const bmr =
        sex === "male"
          ? 10 * weight + 6.25 * heightCm - 5 * age + 5
          : 10 * weight + 6.25 * heightCm - 5 * age - 161;
      const calories = bmr * activity;
      root.querySelector("#health-result").innerHTML = `
        <div class="summary-grid">
          <article class="timeline-item"><strong>BMI</strong><div>${bmi.toFixed(1)}</div></article>
          <article class="timeline-item"><strong>Body fat</strong><div>${bodyFat.toFixed(1)}%</div></article>
          <article class="timeline-item"><strong>Maintenance calories</strong><div>${Math.round(calories)} kcal/day</div></article>
        </div>
        <p class="muted">These are general estimates and not medical advice.</p>
      `;
    }

    root.querySelector("#mortgage-calc-btn").addEventListener("click", calcMortgage);
    root.querySelector("#compound-calc-btn").addEventListener("click", calcCompound);
    root.querySelector("#health-calc-btn").addEventListener("click", calcHealth);

    function loadSample() {
      calcMortgage();
      calcCompound();
      calcHealth();
    }

    loadSample();
    return { loadSample };
  }

  function renderFocusBoard(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Pomodoro</h4>
            <div class="timer-display" id="focus-display">25:00</div>
            <div class="timer-ring"><div id="focus-progress" class="timer-ring-fill"></div></div>
            <div class="preview-grid" style="margin-top:16px;">
              <label class="field"><span>Focus minutes</span><input id="focus-minutes" class="panel-input" type="number" value="25" min="5" max="120" /></label>
              <label class="field"><span>Break minutes</span><input id="break-minutes" class="panel-input" type="number" value="5" min="1" max="60" /></label>
            </div>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="focus-start-btn">Start</button>
              <button type="button" class="action-pill" id="focus-pause-btn">Pause</button>
              <button type="button" class="action-pill" id="focus-reset-btn">Reset</button>
              <button type="button" class="action-pill" id="focus-preset-btn">Toggle 50/10</button>
            </div>
          </section>
          <section class="result-card">
            <h4>Tasks and habits</h4>
            <label class="field"><span>New task</span><input id="focus-task-input" class="panel-input" type="text" placeholder="Add a task for this session" /></label>
            <div class="panel-actions"><button type="button" class="action-pill" id="focus-add-task-btn">Add task</button></div>
            <div id="focus-task-list" class="task-list"></div>
            <div id="focus-habits" class="habit-grid"></div>
          </section>
        </div>
      `
    );
  }

  function mountFocusBoard(root) {
    const display = root.querySelector("#focus-display");
    const progress = root.querySelector("#focus-progress");
    const focusMinutesInput = root.querySelector("#focus-minutes");
    const breakMinutesInput = root.querySelector("#break-minutes");
    const taskInput = root.querySelector("#focus-task-input");
    const taskList = root.querySelector("#focus-task-list");
    const habitsWrap = root.querySelector("#focus-habits");

    const focusState = loadStorage(STORAGE_KEYS.focus, {
      focusMinutes: 25,
      breakMinutes: 5,
      remainingSeconds: 25 * 60,
      mode: "focus",
      running: false,
      endsAt: null,
      tasks: [
        { id: crypto.randomUUID(), text: "Ship the current tool page", done: false },
        { id: crypto.randomUUID(), text: "Review responsive states", done: false },
      ],
      habits: ["Plan today", "Review yesterday", "Read 20 minutes", "Stretch"].map((name) => ({
        id: crypto.randomUUID(),
        name,
        done: false,
      })),
    });

    let intervalId = null;

    function saveFocus() {
      saveStorage(STORAGE_KEYS.focus, focusState);
    }

    function renderTasks() {
      taskList.innerHTML = focusState.tasks.length
        ? focusState.tasks
            .map(
              (task) => `
                <div class="task-item ${task.done ? "done" : ""}">
                  <strong>${escapeHtml(task.text)}</strong>
                  <div class="compact-actions" style="margin-top:10px;">
                    <button type="button" class="mini-btn" data-task-toggle="${task.id}">${task.done ? "Undo" : "Done"}</button>
                    <button type="button" class="mini-btn danger" data-task-remove="${task.id}">Delete</button>
                  </div>
                </div>
              `
            )
            .join("")
        : `<div class="task-item"><strong>No tasks yet.</strong><p class="muted">Add one to start a session.</p></div>`;
    }

    function renderHabits() {
      habitsWrap.innerHTML = focusState.habits
        .map(
          (habit) => `
            <label class="habit-item">
              <input type="checkbox" data-habit-toggle="${habit.id}" ${habit.done ? "checked" : ""} />
              <strong>${escapeHtml(habit.name)}</strong>
            </label>
          `
        )
        .join("");
    }

    function renderTimer() {
      const total = (focusState.mode === "focus" ? focusState.focusMinutes : focusState.breakMinutes) * 60;
      const ratio = clampNumber((total - focusState.remainingSeconds) / total, 0, 1);
      display.textContent = formatSeconds(focusState.remainingSeconds);
      progress.style.width = `${ratio * 100}%`;
      focusMinutesInput.value = String(focusState.focusMinutes);
      breakMinutesInput.value = String(focusState.breakMinutes);
      renderTasks();
      renderHabits();
    }

    function startTicker() {
      if (intervalId) return;
      intervalId = window.setInterval(() => {
        if (!focusState.running || !focusState.endsAt) return;
        focusState.remainingSeconds = Math.max(0, Math.round((focusState.endsAt - Date.now()) / 1000));
        if (focusState.remainingSeconds <= 0) {
          focusState.running = false;
          focusState.endsAt = null;
          focusState.mode = focusState.mode === "focus" ? "break" : "focus";
          focusState.remainingSeconds = (focusState.mode === "focus" ? focusState.focusMinutes : focusState.breakMinutes) * 60;
        }
        saveFocus();
        renderTimer();
      }, 1000);
    }

    function pause() {
      if (!focusState.running || !focusState.endsAt) return;
      focusState.remainingSeconds = Math.max(0, Math.round((focusState.endsAt - Date.now()) / 1000));
      focusState.running = false;
      focusState.endsAt = null;
      saveFocus();
      renderTimer();
    }

    function reset(mode = "focus") {
      focusState.mode = mode;
      focusState.running = false;
      focusState.endsAt = null;
      focusState.remainingSeconds = (mode === "focus" ? focusState.focusMinutes : focusState.breakMinutes) * 60;
      saveFocus();
      renderTimer();
    }

    root.querySelector("#focus-start-btn").addEventListener("click", () => {
      focusState.focusMinutes = clampNumber(Number(focusMinutesInput.value) || 25, 5, 120);
      focusState.breakMinutes = clampNumber(Number(breakMinutesInput.value) || 5, 1, 60);
      focusState.running = true;
      focusState.endsAt = Date.now() + focusState.remainingSeconds * 1000;
      saveFocus();
      renderTimer();
    });
    root.querySelector("#focus-pause-btn").addEventListener("click", pause);
    root.querySelector("#focus-reset-btn").addEventListener("click", () => reset("focus"));
    root.querySelector("#focus-preset-btn").addEventListener("click", () => {
      const longMode = focusState.focusMinutes === 25;
      focusState.focusMinutes = longMode ? 50 : 25;
      focusState.breakMinutes = longMode ? 10 : 5;
      reset("focus");
    });
    root.querySelector("#focus-add-task-btn").addEventListener("click", () => {
      const text = taskInput.value.trim();
      if (!text) return;
      focusState.tasks.unshift({ id: crypto.randomUUID(), text, done: false });
      taskInput.value = "";
      saveFocus();
      renderTimer();
    });

    taskList.addEventListener("click", (event) => {
      const toggleButton = event.target.closest("[data-task-toggle]");
      if (toggleButton) {
        const task = focusState.tasks.find((item) => item.id === toggleButton.getAttribute("data-task-toggle"));
        if (task) {
          task.done = !task.done;
          saveFocus();
          renderTimer();
        }
        return;
      }
      const removeButton = event.target.closest("[data-task-remove]");
      if (removeButton) {
        focusState.tasks = focusState.tasks.filter((item) => item.id !== removeButton.getAttribute("data-task-remove"));
        saveFocus();
        renderTimer();
      }
    });

    habitsWrap.addEventListener("change", (event) => {
      const checkbox = event.target.closest("[data-habit-toggle]");
      if (!checkbox) return;
      const habit = focusState.habits.find((item) => item.id === checkbox.getAttribute("data-habit-toggle"));
      if (habit) {
        habit.done = checkbox.checked;
        saveFocus();
      }
    });

    startTicker();
    renderTimer();

    function loadSample() {
      focusState.focusMinutes = 25;
      focusState.breakMinutes = 5;
      focusState.remainingSeconds = 25 * 60;
      focusState.mode = "focus";
      focusState.running = false;
      focusState.endsAt = null;
      focusState.tasks = [
        { id: crypto.randomUUID(), text: "Finish the hero section polish", done: false },
        { id: crypto.randomUUID(), text: "Verify GitHub Pages deployment path", done: false },
      ];
      focusState.habits = ["Plan today", "Review yesterday", "Read 20 minutes", "Stretch"].map((name) => ({
        id: crypto.randomUUID(),
        name,
        done: false,
      }));
      saveFocus();
      renderTimer();
    }

    return {
      loadSample,
      cleanup: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },
    };
  }
  function renderBudgetPlanner(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Budget input</h4>
            <div class="preview-grid">
              <label class="field"><span>Monthly income</span><input id="budget-income" class="panel-input" type="number" value="18000" /></label>
              <label class="field"><span>Savings goal</span><input id="budget-goal" class="panel-input" type="number" value="5000" /></label>
            </div>
            <div id="budget-items"></div>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="budget-add-item">Add expense</button>
              <button type="button" class="action-pill" id="budget-run-btn">Calculate</button>
            </div>
          </section>
          <section class="result-card">
            <h4>Budget summary</h4>
            <div id="budget-result" class="result-box"></div>
          </section>
        </div>
      `
    );
  }

  function mountBudgetPlanner(root) {
    const itemsWrap = root.querySelector("#budget-items");
    const result = root.querySelector("#budget-result");
    let rowIds = [];

    function addExpense(item = {}) {
      const id = crypto.randomUUID();
      rowIds.push(id);
      const row = document.createElement("div");
      row.className = "budget-item-row";
      row.dataset.rowId = id;
      row.innerHTML = `
        <label class="field"><span>Name</span><input type="text" class="panel-input" data-key="name" value="${escapeHtml(item.name || "")}" /></label>
        <label class="field"><span>Amount</span><input type="number" class="panel-input" data-key="amount" value="${escapeHtml(String(item.amount || 0))}" /></label>
        <button type="button" class="mini-btn danger" data-remove-budget="${id}">Delete</button>
      `;
      itemsWrap.appendChild(row);
    }

    function calculate() {
      const income = Number(root.querySelector("#budget-income").value) || 0;
      const goal = Number(root.querySelector("#budget-goal").value) || 0;
      const expenses = rowIds
        .map((id) => {
          const row = itemsWrap.querySelector(`[data-row-id="${id}"]`);
          if (!row) return null;
          return {
            name: row.querySelector('[data-key="name"]').value.trim() || "Unnamed",
            amount: Number(row.querySelector('[data-key="amount"]').value) || 0,
          };
        })
        .filter(Boolean);
      const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
      const remaining = income - totalExpense;
      const gap = remaining - goal;
      result.innerHTML = `
        <div class="summary-grid">
          <article class="timeline-item"><strong>Total expense</strong><div>${formatCurrency(totalExpense)}</div></article>
          <article class="timeline-item"><strong>Remaining</strong><div>${formatCurrency(remaining)}</div></article>
          <article class="timeline-item"><strong>Goal gap</strong><div>${formatCurrency(gap)}</div></article>
        </div>
        <div class="timeline-list" style="margin-top:16px;">
          ${expenses.map((item) => `<div class="timeline-item"><strong>${escapeHtml(item.name)}</strong><div>${formatCurrency(item.amount)}</div></div>`).join("")}
        </div>
      `;
      saveStorage(STORAGE_KEYS.budget, { income, goal, expenses });
    }

    itemsWrap.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-budget]");
      if (!removeButton) return;
      const id = removeButton.getAttribute("data-remove-budget");
      rowIds = rowIds.filter((rowId) => rowId !== id);
      itemsWrap.querySelector(`[data-row-id="${id}"]`)?.remove();
      calculate();
    });
    itemsWrap.addEventListener("input", debounce(calculate, 100));
    root.querySelector("#budget-income").addEventListener("input", debounce(calculate, 100));
    root.querySelector("#budget-goal").addEventListener("input", debounce(calculate, 100));
    root.querySelector("#budget-add-item").addEventListener("click", () => addExpense());
    root.querySelector("#budget-run-btn").addEventListener("click", calculate);

    function loadSample() {
      rowIds = [];
      itemsWrap.innerHTML = "";
      root.querySelector("#budget-income").value = "18000";
      root.querySelector("#budget-goal").value = "5000";
      addExpense({ name: "Rent", amount: 4200 });
      addExpense({ name: "Food", amount: 2200 });
      addExpense({ name: "Transport", amount: 600 });
      addExpense({ name: "Subscriptions", amount: 399 });
      calculate();
    }

    const stored = loadStorage(STORAGE_KEYS.budget, null);
    if (stored) {
      root.querySelector("#budget-income").value = String(stored.income || 0);
      root.querySelector("#budget-goal").value = String(stored.goal || 0);
      rowIds = [];
      itemsWrap.innerHTML = "";
      (stored.expenses || []).forEach((item) => addExpense(item));
      calculate();
    } else {
      loadSample();
    }
    return { loadSample };
  }

  function renderShiftPlanner(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Schedule setup</h4>
            <div class="preview-grid">
              <label class="field"><span>Start date</span><input id="shift-start-date" class="panel-input" type="date" /></label>
              <label class="field"><span>Days</span><input id="shift-days" class="panel-input" type="number" value="14" min="1" max="31" /></label>
              <label class="field field-full"><span>Shift sequence</span><input id="shift-seq" class="panel-input" type="text" value="早班,中班,晚班,休" /></label>
            </div>
            <div id="shift-people"></div>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="shift-add-person">Add person</button>
              <button type="button" class="action-pill" id="shift-run-btn">Generate schedule</button>
            </div>
          </section>
          <section class="result-card">
            <h4>Schedule table</h4>
            <div id="shift-output" class="preview-scroll schedule-table-wrap"></div>
          </section>
        </div>
      `
    );
  }

  function mountShiftPlanner(root) {
    const peopleWrap = root.querySelector("#shift-people");
    const output = root.querySelector("#shift-output");
    let rowIds = [];

    function addPerson(person = {}) {
      const id = crypto.randomUUID();
      rowIds.push(id);
      const row = document.createElement("div");
      row.className = "shift-person-row";
      row.dataset.rowId = id;
      row.innerHTML = `
        <label class="field"><span>Name</span><input type="text" class="panel-input" data-key="name" value="${escapeHtml(person.name || "")}" /></label>
        <label class="field"><span>Offset</span><input type="number" class="panel-input" data-key="offset" value="${escapeHtml(String(person.offset || 0))}" min="0" /></label>
        <label class="field"><span>Note</span><input type="text" class="panel-input" data-key="note" value="${escapeHtml(person.note || "")}" /></label>
        <button type="button" class="mini-btn danger" data-remove-person="${id}">Delete</button>
      `;
      peopleWrap.appendChild(row);
    }

    function generate() {
      const start = new Date(root.querySelector("#shift-start-date").value);
      const days = clampNumber(Number(root.querySelector("#shift-days").value) || 14, 1, 31);
      const shifts = root.querySelector("#shift-seq").value.split(",").map((item) => item.trim()).filter(Boolean);
      const people = rowIds
        .map((id) => {
          const row = peopleWrap.querySelector(`[data-row-id="${id}"]`);
          if (!row) return null;
          return {
            name: row.querySelector('[data-key="name"]').value.trim(),
            offset: Number(row.querySelector('[data-key="offset"]').value) || 0,
            note: row.querySelector('[data-key="note"]').value.trim(),
          };
        })
        .filter(Boolean)
        .filter((person) => person.name);
      const head = Array.from({ length: days }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return `<th>${escapeHtml(date.toISOString().slice(5, 10))}</th>`;
      }).join("");
      const rows = people
        .map((person) => {
          const cols = Array.from({ length: days }, (_, index) => {
            const shift = shifts[(person.offset + index) % shifts.length] || "";
            return `<td>${escapeHtml(shift)}</td>`;
          }).join("");
          return `<tr><th>${escapeHtml(person.name)}</th>${cols}</tr>`;
        })
        .join("");
      output.innerHTML = `
        <table class="schedule-table">
          <thead><tr><th>Member</th>${head}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
      saveStorage(STORAGE_KEYS.shift, {
        startDate: root.querySelector("#shift-start-date").value,
        days,
        seq: root.querySelector("#shift-seq").value,
        people,
      });
    }

    peopleWrap.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-person]");
      if (!removeButton) return;
      const id = removeButton.getAttribute("data-remove-person");
      rowIds = rowIds.filter((rowId) => rowId !== id);
      peopleWrap.querySelector(`[data-row-id="${id}"]`)?.remove();
      generate();
    });
    peopleWrap.addEventListener("input", debounce(generate, 100));
    root.querySelector("#shift-start-date").addEventListener("input", debounce(generate, 100));
    root.querySelector("#shift-days").addEventListener("input", debounce(generate, 100));
    root.querySelector("#shift-seq").addEventListener("input", debounce(generate, 100));
    root.querySelector("#shift-add-person").addEventListener("click", () => addPerson());
    root.querySelector("#shift-run-btn").addEventListener("click", generate);

    function loadSample() {
      rowIds = [];
      peopleWrap.innerHTML = "";
      root.querySelector("#shift-start-date").value = new Date().toISOString().slice(0, 10);
      root.querySelector("#shift-days").value = "14";
      root.querySelector("#shift-seq").value = "早班,中班,晚班,休";
      addPerson({ name: "Xiao Lin", offset: 0, note: "A" });
      addPerson({ name: "A Che", offset: 1, note: "B" });
      addPerson({ name: "Mina", offset: 2, note: "C" });
      generate();
    }

    const stored = loadStorage(STORAGE_KEYS.shift, null);
    if (stored) {
      root.querySelector("#shift-start-date").value = stored.startDate || new Date().toISOString().slice(0, 10);
      root.querySelector("#shift-days").value = String(stored.days || 14);
      root.querySelector("#shift-seq").value = stored.seq || "早班,中班,晚班,休";
      rowIds = [];
      peopleWrap.innerHTML = "";
      (stored.people || []).forEach((person) => addPerson(person));
      if (!(stored.people || []).length) addPerson();
      generate();
    } else {
      loadSample();
    }
    return { loadSample };
  }

  function renderFormBuilder(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Fields</h4>
            <div id="form-builder-fields"></div>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="form-builder-add">Add field</button>
              <button type="button" class="action-pill" id="form-builder-generate">Generate output</button>
            </div>
          </section>
          <section class="result-card">
            <h4>Output</h4>
            <div class="tool-panel-tabs" data-tab-group="form-builder">
              <button type="button" class="active" data-tab-target="form-preview">Preview</button>
              <button type="button" data-tab-target="form-html">HTML</button>
              <button type="button" data-tab-target="form-schema">Schema</button>
            </div>
            <div class="tab-pane active" data-tab-pane="form-preview"><div id="form-preview" class="form-preview-box"></div></div>
            <div class="tab-pane" data-tab-pane="form-html"><pre id="form-html-output" class="code-output"></pre></div>
            <div class="tab-pane" data-tab-pane="form-schema"><pre id="form-schema-output" class="json-schema-output"></pre></div>
          </section>
        </div>
      `
    );
  }

  function mountFormBuilder(root) {
    bindTabs(root, "form-preview");
    const fieldsWrap = root.querySelector("#form-builder-fields");
    const preview = root.querySelector("#form-preview");
    const htmlOutput = root.querySelector("#form-html-output");
    const schemaOutput = root.querySelector("#form-schema-output");
    let rowIds = [];

    function addField(field = {}) {
      const id = crypto.randomUUID();
      rowIds.push(id);
      const row = document.createElement("div");
      row.className = "form-field-row";
      row.dataset.rowId = id;
      row.innerHTML = `
        <label class="field"><span>Label</span><input type="text" class="panel-input" data-key="label" value="${escapeHtml(field.label || "")}" /></label>
        <label class="field"><span>Type</span><select data-key="type">${["text", "email", "number", "date", "textarea", "select"].map((type) => `<option value="${type}" ${field.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></label>
        <label class="field"><span>Required</span><select data-key="required"><option value="false" ${field.required ? "" : "selected"}>No</option><option value="true" ${field.required ? "selected" : ""}>Yes</option></select></label>
        <button type="button" class="mini-btn danger" data-remove-field="${id}">Delete</button>
      `;
      fieldsWrap.appendChild(row);
    }

    function collectFields() {
      return rowIds
        .map((id) => {
          const row = fieldsWrap.querySelector(`[data-row-id="${id}"]`);
          if (!row) return null;
          return {
            label: row.querySelector('[data-key="label"]').value.trim(),
            type: row.querySelector('[data-key="type"]').value,
            required: row.querySelector('[data-key="required"]').value === "true",
          };
        })
        .filter(Boolean)
        .filter((field) => field.label);
    }

    function generate() {
      const fields = collectFields();
      preview.innerHTML = `
        <h5>Generated form</h5>
        <form class="panel-stack">
          ${fields
            .map((field) => {
              const name = slugify(field.label);
              if (field.type === "textarea") return `<label class="field"><span>${escapeHtml(field.label)}</span><textarea ${field.required ? "required" : ""}></textarea></label>`;
              if (field.type === "select") return `<label class="field"><span>${escapeHtml(field.label)}</span><select ${field.required ? "required" : ""}><option>Choose one</option></select></label>`;
              return `<label class="field"><span>${escapeHtml(field.label)}</span><input type="${field.type}" name="${escapeHtml(name)}" ${field.required ? "required" : ""} /></label>`;
            })
            .join("")}
        </form>
      `;
      const html = `
<form class="generated-form">
${fields
  .map((field) => {
    const name = slugify(field.label);
    if (field.type === "textarea") return `  <label>\n    <span>${field.label}</span>\n    <textarea name="${name}" ${field.required ? "required" : ""}></textarea>\n  </label>`;
    if (field.type === "select") return `  <label>\n    <span>${field.label}</span>\n    <select name="${name}" ${field.required ? "required" : ""}>\n      <option value="">Choose one</option>\n    </select>\n  </label>`;
    return `  <label>\n    <span>${field.label}</span>\n    <input type="${field.type}" name="${name}" ${field.required ? "required" : ""} />\n  </label>`;
  })
  .join("\n")}
</form>`.trim();
      const schema = {
        type: "object",
        properties: Object.fromEntries(
          fields.map((field) => [
            slugify(field.label),
            {
              title: field.label,
              type: field.type === "number" ? "number" : "string",
              format: field.type === "email" || field.type === "date" ? field.type : undefined,
            },
          ])
        ),
        required: fields.filter((field) => field.required).map((field) => slugify(field.label)),
      };
      htmlOutput.textContent = html;
      schemaOutput.textContent = JSON.stringify(schema, null, 2);
      saveStorage(STORAGE_KEYS.formBuilder, fields);
    }

    fieldsWrap.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-field]");
      if (!removeButton) return;
      const id = removeButton.getAttribute("data-remove-field");
      rowIds = rowIds.filter((rowId) => rowId !== id);
      fieldsWrap.querySelector(`[data-row-id="${id}"]`)?.remove();
      generate();
    });
    fieldsWrap.addEventListener("input", debounce(generate, 100));
    root.querySelector("#form-builder-add").addEventListener("click", () => addField());
    root.querySelector("#form-builder-generate").addEventListener("click", generate);

    function loadSample() {
      rowIds = [];
      fieldsWrap.innerHTML = "";
      addField({ label: "Name", type: "text", required: true });
      addField({ label: "Email", type: "email", required: true });
      addField({ label: "Budget", type: "number", required: false });
      addField({ label: "Project summary", type: "textarea", required: true });
      generate();
    }

    const stored = loadStorage(STORAGE_KEYS.formBuilder, null);
    if (stored?.length) {
      rowIds = [];
      fieldsWrap.innerHTML = "";
      stored.forEach((field) => addField(field));
      generate();
    } else {
      loadSample();
    }
    return { loadSample };
  }
  function renderDesignLab(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Style settings</h4>
            <div class="preview-grid">
              <label class="field"><span>Primary</span><input id="design-primary" class="panel-input" type="color" value="#ff8f5c" /></label>
              <label class="field"><span>Secondary</span><input id="design-secondary" class="panel-input" type="color" value="#2ec4b6" /></label>
              <label class="field"><span>Surface</span><input id="design-surface" class="panel-input" type="color" value="#10222d" /></label>
              <label class="field"><span>Angle</span><input id="design-angle" class="panel-input" type="number" value="135" min="0" max="360" /></label>
              <label class="field"><span>Blur</span><input id="design-blur" class="panel-input" type="number" value="36" min="0" max="120" /></label>
              <label class="field"><span>Radius</span><input id="design-radius" class="panel-input" type="number" value="22" min="0" max="48" /></label>
            </div>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="design-generate-btn">Generate</button>
              <button type="button" class="action-pill" id="design-random-btn">Random palette</button>
            </div>
          </section>
          <section class="preview-card">
            <h4>Preview and CSS</h4>
            <div id="design-preview" class="preview-scroll poster-preview"></div>
            <pre id="design-code" class="code-output"></pre>
          </section>
        </div>
      `
    );
  }

  function mountDesignLab(root) {
    const preview = root.querySelector("#design-preview");
    const code = root.querySelector("#design-code");

    function render() {
      const primary = root.querySelector("#design-primary").value;
      const secondary = root.querySelector("#design-secondary").value;
      const surface = root.querySelector("#design-surface").value;
      const angle = root.querySelector("#design-angle").value;
      const blur = root.querySelector("#design-blur").value;
      const radius = root.querySelector("#design-radius").value;
      preview.innerHTML = `
        <div style="
          border-radius:${radius}px;
          padding:28px;
          background:linear-gradient(${angle}deg, ${primary}, ${secondary});
          box-shadow:0 24px ${blur}px rgba(0,0,0,.28);
          color:#071117;
        ">
          <p class="panel-label" style="color:#071117;letter-spacing:.18em;">Design Preview</p>
          <h1 style="margin:12px 0 8px;font-family:Syne,sans-serif;">AsterLab UI Kit</h1>
          <p style="margin:0 0 18px;">Use one palette and a few variables to push a plain interface into a more intentional look.</p>
          <button style="border:none;border-radius:999px;padding:12px 18px;background:${surface};color:#fff;">Primary Action</button>
        </div>
      `;
      code.textContent = `:root {
  --primary: ${primary};
  --secondary: ${secondary};
  --surface: ${surface};
  --card-radius: ${radius}px;
  --card-shadow: 0 24px ${blur}px rgba(0, 0, 0, 0.28);
  --hero-gradient: linear-gradient(${angle}deg, ${primary}, ${secondary});
}`;
      saveStorage(STORAGE_KEYS.design, { primary, secondary, surface, angle, blur, radius });
    }

    root.querySelector("#design-generate-btn").addEventListener("click", render);
    root.querySelector("#design-random-btn").addEventListener("click", () => {
      const palette = createRandomPalette();
      root.querySelector("#design-primary").value = palette.primary;
      root.querySelector("#design-secondary").value = palette.secondary;
      root.querySelector("#design-surface").value = palette.surface;
      render();
    });
    ["primary", "secondary", "surface", "angle", "blur", "radius"].forEach((key) => {
      root.querySelector(`#design-${key}`).addEventListener("input", debounce(render, 80));
    });

    function loadSample() {
      root.querySelector("#design-primary").value = "#ff8f5c";
      root.querySelector("#design-secondary").value = "#2ec4b6";
      root.querySelector("#design-surface").value = "#10222d";
      root.querySelector("#design-angle").value = "135";
      root.querySelector("#design-blur").value = "36";
      root.querySelector("#design-radius").value = "22";
      render();
    }

    const stored = loadStorage(STORAGE_KEYS.design, null);
    if (stored) {
      Object.entries(stored).forEach(([key, value]) => {
        const element = root.querySelector(`#design-${key}`);
        if (element) element.value = String(value);
      });
      render();
    } else {
      loadSample();
    }
    return { loadSample };
  }

  function renderPosterMaker(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Poster content</h4>
            <div class="panel-stack">
              <label class="field"><span>Title</span><input id="poster-title" class="panel-input" type="text" /></label>
              <label class="field"><span>Subtitle</span><input id="poster-subtitle" class="panel-input" type="text" /></label>
              <label class="field"><span>Meta</span><input id="poster-meta" class="panel-input" type="text" /></label>
            </div>
            <div class="preview-grid">
              <label class="field"><span>Color A</span><input id="poster-color-a" class="panel-input" type="color" value="#ff8f5c" /></label>
              <label class="field"><span>Color B</span><input id="poster-color-b" class="panel-input" type="color" value="#2ec4b6" /></label>
            </div>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="poster-render-btn">Render poster</button>
              <button type="button" class="action-pill" id="poster-download-btn">Download PNG</button>
            </div>
          </section>
          <section class="preview-card">
            <h4>Canvas preview</h4>
            <div class="poster-canvas-wrap"><canvas id="poster-canvas" width="900" height="1200"></canvas></div>
          </section>
        </div>
      `
    );
  }

  function mountPosterMaker(root) {
    const canvas = root.querySelector("#poster-canvas");
    const ctx = canvas.getContext("2d");

    function drawPoster() {
      const title = root.querySelector("#poster-title").value.trim();
      const subtitle = root.querySelector("#poster-subtitle").value.trim();
      const meta = root.querySelector("#poster-meta").value.trim();
      const colorA = root.querySelector("#poster-color-a").value;
      const colorB = root.querySelector("#poster-color-b").value;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, colorA);
      gradient.addColorStop(1, colorB);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      for (let index = 0; index < 8; index += 1) {
        ctx.beginPath();
        ctx.arc(120 + index * 96, 180 + (index % 2) * 110, 66 + index * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#071117";
      ctx.font = "800 84px Syne";
      wrapCanvasText(ctx, title, 90, 330, 700, 96);
      ctx.font = "500 34px Noto Sans SC";
      wrapCanvasText(ctx, subtitle, 92, 630, 680, 52);
      ctx.fillStyle = "rgba(7,17,23,0.76)";
      ctx.font = "700 28px Noto Sans SC";
      ctx.fillText(meta, 92, 980);
      ctx.fillRect(92, 1020, 260, 4);
      ctx.font = "700 24px Syne";
      ctx.fillText("ASTERLAB TOOLS", 92, 1064);
    }

    root.querySelector("#poster-render-btn").addEventListener("click", drawPoster);
    root.querySelector("#poster-download-btn").addEventListener("click", () => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        createDownloadLink(blob, "asterlab-poster.png", "Download").click();
      }, "image/png");
    });

    function loadSample() {
      root.querySelector("#poster-title").value = "Build Tools That Feel Like Products";
      root.querySelector("#poster-subtitle").value = "Front-end is not only pages. It can ship usable tools.";
      root.querySelector("#poster-meta").value = "GitHub Pages / Static Deploy / 2026 Spring";
      drawPoster();
    }

    loadSample();
    return { loadSample };
  }

  function renderFlowMapper(tool) {
    return buildToolPanel(
      tool,
      `
        <div class="panel-grid">
          <section class="sub-panel">
            <h4>Indented outline</h4>
            <label class="text-area-wrap">
              <span>Use two spaces for each level</span>
              <textarea id="flow-source" class="panel-textarea" spellcheck="false"></textarea>
            </label>
            <div class="panel-actions">
              <button type="button" class="action-pill" id="flow-render-btn">Render SVG</button>
              <button type="button" class="action-pill" id="flow-download-btn">Download SVG</button>
            </div>
          </section>
          <section class="preview-card">
            <h4>SVG preview</h4>
            <div id="flow-output" class="mindmap-output"></div>
          </section>
        </div>
      `
    );
  }

  function mountFlowMapper(root) {
    const source = root.querySelector("#flow-source");
    const output = root.querySelector("#flow-output");
    let currentSvg = "";

    function render() {
      const forest = parseIndentedTree(source.value);
      currentSvg = buildFlowSvg(forest);
      output.innerHTML = currentSvg;
    }

    root.querySelector("#flow-render-btn").addEventListener("click", render);
    root.querySelector("#flow-download-btn").addEventListener("click", () => {
      if (!currentSvg) return;
      downloadText("asterlab-flow.svg", currentSvg, "image/svg+xml");
    });

    function loadSample() {
      source.value = `Product idea\n  Validate demand\n    Target users\n    Repeated pain points\n  Design page\n    Structure\n    Visual system\n  Build\n    Core tools\n    Export features\n  Launch\n    GitHub Pages\n    Basic SEO`;
      render();
    }

    loadSample();
    return { loadSample };
  }

  function renderPlaceholder(name) {
    return `
      <section class="tool-panel">
        <div class="panel-head">
          <div class="panel-head-copy">
            <span class="card-label">正在接入</span>
            <h3>${escapeHtml(name)}</h3>
            <p>当前模块正在写入功能逻辑，下一步会替换为完整工具面板。</p>
          </div>
        </div>
      </section>
    `;
  }
})();
