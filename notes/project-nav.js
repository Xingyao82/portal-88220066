(function () {
  const NAV_ITEMS = [
    { key: "ai", href: "/ai-nav/", zh: "AI 导航", en: "AI Nav" },
    { key: "finance", href: "/finance-nav/", zh: "金融导航", en: "Finance" },
    { key: "income", href: "/income-nav/", zh: "Income 导航", en: "Income" },
    { key: "optionsIncomeCompare", href: "/options-income-compare/", zh: "期权 Income 对比台", en: "Options Income" },
    { key: "etfCompare", href: "/etf-compare/", zh: "ETF 对比", en: "ETF Compare" },
    { key: "api", href: "/free-api-nav/", zh: "API 导航", en: "API" },
    { key: "tools", href: "/tools-nav/", zh: "工具导航", en: "Tools" },
    { key: "english", href: "/english-tools/", zh: "英语导航", en: "English" },
    { key: "skills", href: "/skills-nav/", zh: "技能", en: "Skills" }
  ];

  function currentKey(pathname) {
    if (pathname.startsWith("/finance-nav/") || pathname.startsWith("/futures-basis/")) return "finance";
    if (pathname.startsWith("/income-nav/")) return "income";
    if (pathname.startsWith("/options-income-compare/")) return "optionsIncomeCompare";
    if (pathname.startsWith("/etf-compare/")) return "etfCompare";
    if (pathname.startsWith("/free-api-nav/")) return "api";
    if (pathname.startsWith("/tools-nav/") || pathname.startsWith("/asterlab-tools/")) return "tools";
    if (pathname.startsWith("/english-tools/") || pathname.startsWith("/dictation/")) return "english";
    if (
      pathname.startsWith("/skills-nav/") ||
      pathname.startsWith("/kindle/") ||
      pathname.startsWith("/kindle-upload/")
    ) {
      return "skills";
    }
    return "ai";
  }

  function lang() {
    if (window.SiteI18n && typeof window.SiteI18n.getLang === "function") {
      return window.SiteI18n.getLang() === "en" ? "en" : "zh";
    }
    const saved = localStorage.getItem("site-lang");
    return saved === "en" ? "en" : "zh";
  }

  function render() {
    const nav = document.querySelector(".nav-links, .links");
    if (!nav) return;
    const activeKey = currentKey(window.location.pathname);
    const currentLang = lang();
    const items = NAV_ITEMS.filter((item) => {
      if (!["optionsIncomeCompare", "etfCompare"].includes(item.key)) return true;
      return ["finance", "income", "optionsIncomeCompare", "etfCompare"].includes(activeKey);
    });

    nav.innerHTML = items.map((item) => {
      const activeClass = item.key === activeKey ? ' class="active"' : "";
      const label = currentLang === "en" ? item.en : item.zh;
      return `<a href="${item.href}"${activeClass}>${label}</a>`;
    }).join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  } else {
    render();
  }

  window.addEventListener("site-lang-change", render);
})();
