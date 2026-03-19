/* site language switch */
(function () {
  const STORAGE_KEY = "site-lang";
  const DEFAULT_LANG = "zh-CN";
  const SUPPORTED = ["zh-CN", "en"];
  const scriptId = "google-translate-script";
  const switchId = "site-lang-switch";
  const translateId = "google_translate_element";

  function injectStyles() {
    if (document.getElementById("site-lang-style")) return;
    const style = document.createElement("style");
    style.id = "site-lang-style";
    style.textContent = `
      #${switchId}{
        position:fixed;
        top:16px;
        right:16px;
        z-index:999999;
        display:flex;
        gap:6px;
        padding:6px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.16);
        background:rgba(10,16,30,.72);
        backdrop-filter:blur(12px);
        box-shadow:0 12px 30px rgba(0,0,0,.22);
      }
      #${switchId} button{
        min-width:44px;
        height:34px;
        border:0;
        border-radius:999px;
        padding:0 12px;
        cursor:pointer;
        font:600 13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;
        color:#d7e1ff;
        background:transparent;
      }
      #${switchId} button.active{
        color:#08111f;
        background:#ffffff;
      }
      #${translateId}{
        position:fixed;
        left:-9999px;
        bottom:0;
        width:1px;
        height:1px;
        overflow:hidden;
      }
      .goog-te-banner-frame.skiptranslate,
      iframe.goog-te-banner-frame.skiptranslate{
        display:none !important;
      }
      body{
        top:0 !important;
      }
      .skiptranslate{
        font-size:0 !important;
      }
      .goog-logo-link,
      .goog-te-gadget span{
        display:none !important;
      }
      @media (max-width:720px){
        #${switchId}{
          top:12px;
          right:12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getSavedLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
  }

  function setSavedLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "zh-CN");
  }

  function updateButtons(activeLang) {
    document.querySelectorAll(`#${switchId} button[data-lang]`).forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === activeLang);
    });
  }

  function clearTranslateState() {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" + location.hostname + "; path=/";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=." + location.hostname + "; path=/";
  }

  function ensureContainers() {
    if (!document.getElementById(translateId)) {
      const translateEl = document.createElement("div");
      translateEl.id = translateId;
      document.body.appendChild(translateEl);
    }

    if (!document.getElementById(switchId)) {
      const wrap = document.createElement("div");
      wrap.id = switchId;
      wrap.setAttribute("aria-label", "Language switch");
      wrap.innerHTML = `
        <button type="button" data-lang="zh-CN">中</button>
        <button type="button" data-lang="en">EN</button>
      `;
      document.body.appendChild(wrap);
      wrap.addEventListener("click", (event) => {
        const button = event.target.closest("[data-lang]");
        if (!button) return;
        const lang = button.dataset.lang;
        setSavedLang(lang);
        updateButtons(lang);
        if (lang === DEFAULT_LANG) {
          clearTranslateState();
          location.reload();
          return;
        }
        ensureGoogleTranslate(() => applyTranslate(lang));
      });
    }

    updateButtons(getSavedLang());
  }

  function applyTranslate(lang) {
    if (lang === DEFAULT_LANG) return;
    let attempts = 0;
    const timer = setInterval(() => {
      const combo = document.querySelector(".goog-te-combo");
      attempts += 1;
      if (combo) {
        if (combo.value !== "en") {
          combo.value = "en";
          combo.dispatchEvent(new Event("change"));
        }
        clearInterval(timer);
      } else if (attempts > 30) {
        clearInterval(timer);
      }
    }, 400);
  }

  function initGoogleTranslateWidget() {
    if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) return;
    if (window.__siteGoogleTranslateReady) return;
    window.__siteGoogleTranslateReady = true;
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "zh-CN",
        includedLanguages: "zh-CN,en",
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
      },
      translateId
    );
  }

  function ensureGoogleTranslate(callback) {
    window.__siteTranslateCallback = callback;
    window.googleTranslateElementInit = function () {
      initGoogleTranslateWidget();
      if (typeof window.__siteTranslateCallback === "function") {
        window.__siteTranslateCallback();
      }
    };

    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      initGoogleTranslateWidget();
      callback();
      return;
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    }
  }

  function init() {
    injectStyles();
    ensureContainers();
    const savedLang = getSavedLang();
    if (savedLang !== DEFAULT_LANG) {
      ensureGoogleTranslate(() => {
        setTimeout(() => applyTranslate(savedLang), 900);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
