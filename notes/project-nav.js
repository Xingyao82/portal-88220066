(function () {
  const NAV_ITEMS = [
    { key: "ai", path: "ai-nav", zh: "AI 导航", en: "AI Nav" },
    { key: "finance", path: "finance-nav", zh: "金融导航", en: "Finance" },
    { key: "income", path: "income-nav", zh: "Income 导航", en: "Income" },
    { key: "api", path: "free-api-nav", zh: "API 导航", en: "API" },
    { key: "tools", path: "tools-nav", zh: "工具导航", en: "Tools" },
    { key: "english", path: "english-tools", zh: "英语导航", en: "English" },
    { key: "skills", path: "skills-nav", zh: "技能", en: "Skills" }
  ];

  function normalizedPathname() {
    return window.location.pathname.replace(/\\/g, "/");
  }

  function currentKey(pathname) {
    if (/\/(finance-nav|futures-basis)(\/|$)/.test(pathname)) return "finance";
    if (/\/income-nav(\/|$)/.test(pathname)) return "income";
    if (/\/free-api-nav(\/|$)/.test(pathname)) return "api";
    if (/\/(tools-nav|asterlab-tools)(\/|$)/.test(pathname)) return "tools";
    if (/\/(english-tools|dictation)(\/|$)/.test(pathname)) return "english";
    if (/\/(skills-nav|kindle|kindle-upload|kindle-share)(\/|$)/.test(pathname)) return "skills";
    return "ai";
  }

  function portalRootUrl() {
    const marker = "/portal-88220066/";
    if (window.location.protocol === "file:") {
      const href = window.location.href;
      const index = href.indexOf(marker);
      if (index !== -1) {
        return href.slice(0, index + marker.length);
      }
    }
    return null;
  }

  function hrefFor(item) {
    const fileRoot = portalRootUrl();
    if (fileRoot) {
      return new URL(item.path + "/index.html", fileRoot).href;
    }
    return "/" + item.path + "/";
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
    const activeKey = currentKey(normalizedPathname());
    const currentLang = lang();

    nav.innerHTML = NAV_ITEMS.map((item) => {
      const activeClass = item.key === activeKey ? ' class="active"' : "";
      const label = currentLang === "en" ? item.en : item.zh;
      return '<a href="' + hrefFor(item) + '"' + activeClass + '>' + label + '</a>';
    }).join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  } else {
    render();
  }

  window.addEventListener("site-lang-change", render);
})();
