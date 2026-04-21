(() => {
  const STORAGE_KEY = "site-lang";
  const DEFAULT_LANG = "zh";
  const listeners = new Set();

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : DEFAULT_LANG;
  }

  function setLang(nextLang) {
    const lang = nextLang === "en" ? "en" : DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    updateSwitch(lang);
    listeners.forEach((listener) => listener(lang));
    window.dispatchEvent(new CustomEvent("site-lang-change", { detail: { lang } }));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function updateSwitch(lang) {
    document.querySelectorAll("[data-site-lang-toggle]").forEach((button) => {
      const value = button.getAttribute("data-site-lang-toggle");
      button.classList.toggle("active", value === lang);
      button.setAttribute("aria-pressed", value === lang ? "true" : "false");
    });
  }

  function applyMessages(messages, lang = getLang()) {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      const value = messages?.[key]?.[lang];
      if (typeof value === "string") node.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((node) => {
      const key = node.getAttribute("data-i18n-html");
      const value = messages?.[key]?.[lang];
      if (typeof value === "string") node.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const key = node.getAttribute("data-i18n-placeholder");
      const value = messages?.[key]?.[lang];
      if (typeof value === "string") node.setAttribute("placeholder", value);
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      const key = node.getAttribute("data-i18n-aria-label");
      const value = messages?.[key]?.[lang];
      if (typeof value === "string") node.setAttribute("aria-label", value);
    });

    const titleKey = document.body?.getAttribute("data-i18n-title");
    if (titleKey && messages?.[titleKey]?.[lang]) {
      document.title = messages[titleKey][lang];
    }

    const descriptionKey = document.body?.getAttribute("data-i18n-description");
    const description = document.querySelector('meta[name="description"]');
    if (descriptionKey && description && messages?.[descriptionKey]?.[lang]) {
      description.setAttribute("content", messages[descriptionKey][lang]);
    }
  }

  function bindPage(messages, onChange) {
    const render = (lang) => {
      applyMessages(messages, lang);
      if (typeof onChange === "function") onChange(lang);
    };

    render(getLang());
    subscribe(render);
  }

  function ensureStyles() {
    if (document.getElementById("site-lang-style")) return;

    const style = document.createElement("style");
    style.id = "site-lang-style";
    style.textContent = `
      .site-lang-switch {
        display: inline-flex;
        gap: 6px;
        padding: 4px;
        border-radius: 999px;
        border: 1px solid var(--line, rgba(148,163,184,.22));
        background: rgba(255,255,255,.92);
        margin-left: auto;
        flex: none;
      }
      .site-lang-switch button {
        min-width: 42px;
        min-height: 30px;
        padding: 0 10px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: var(--muted, #667085);
        cursor: pointer;
        transition: 160ms ease;
        font: inherit;
      }
      .site-lang-switch button.active {
        background: var(--accent, #3677ff);
        color: #fff;
      }
    `;
    document.head.appendChild(style);
  }

  function getSwitchHost() {
    return document.querySelector(".nav") || document.querySelector(".topbar") || document.body;
  }

  function ensureSwitch() {
    if (document.body?.getAttribute("data-site-lang") === "off") return;
    if (document.getElementById("site-lang-switch")) return;

    const wrapper = document.createElement("div");
    wrapper.id = "site-lang-switch";
    wrapper.className = "site-lang-switch";
    wrapper.innerHTML = `
      <button type="button" data-site-lang-toggle="zh">&#20013;</button>
      <button type="button" data-site-lang-toggle="en">EN</button>
    `;

    wrapper.addEventListener("click", (event) => {
      const button = event.target.closest("[data-site-lang-toggle]");
      if (!button) return;
      setLang(button.getAttribute("data-site-lang-toggle"));
    });

    getSwitchHost().appendChild(wrapper);
    updateSwitch(getLang());
  }

  function init() {
    document.documentElement.lang = getLang() === "en" ? "en" : "zh-CN";
    ensureStyles();
    ensureSwitch();
  }

  window.SiteI18n = {
    getLang,
    setLang,
    subscribe,
    bindPage,
    applyMessages
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
