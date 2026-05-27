(function () {
  const NAV_ITEMS = [
    { key: "finance", href: "/finance-nav/", zh: "金融导航", en: "Finance" },
    { key: "income", href: "/income-nav/", zh: "Income 导航", en: "Income" },
    { key: "optionsIncomeCompare", href: "/options-income-compare/", zh: "期权 Income 对比台", en: "Options Income" },
    { key: "etfCompare", href: "/etf-compare/", zh: "ETF 对比", en: "ETF Compare" },
    { key: "news", href: "/news-nav/", zh: "新闻", en: "News" },
    { key: "futuresBasis", href: "/futures-basis/", zh: "股指期货", en: "Futures Basis" },
    { key: "skills", href: "/skills-nav/", zh: "技能", en: "Skills" }
  ];

  function currentKey(pathname) {
    if (pathname.startsWith("/finance-nav/")) return "finance";
    if (pathname.startsWith("/futures-basis/")) return "futuresBasis";
    if (pathname.startsWith("/income-nav/")) return "income";
    if (pathname.startsWith("/options-income-compare/")) return "optionsIncomeCompare";
    if (pathname.startsWith("/etf-compare/")) return "etfCompare";
    if (pathname.startsWith("/news-nav/")) return "news";
    if (
      pathname.startsWith("/skills-nav/") ||
      pathname.startsWith("/kindle/") ||
      pathname.startsWith("/kindle-upload/")
    ) {
      return "skills";
    }
    return "income";
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
    const items = NAV_ITEMS;

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
