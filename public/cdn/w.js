/*! BlindAI Cookie Banner · v0.1.0 · MIT */
(function () {
  "use strict";

  // ─── config ─────────────────────────────────────────────
  var script =
    document.currentScript ||
    (function () {
      var all = document.getElementsByTagName("script");
      return all[all.length - 1];
    })();
  var SITE_ID = script && script.getAttribute("data-site");
  if (!SITE_ID) {
    if (window.console) console.warn("[BlindAI] missing data-site attribute");
    return;
  }
  var API_BASE = (script && script.getAttribute("data-api")) || (function () {
    try { return new URL(script.src).origin; } catch (e) { return ""; }
  })();
  var BADGE_DISABLED = script && script.getAttribute("data-badge") === "false";

  // ─── i18n ───────────────────────────────────────────────
  var FORCED_LANG = script && script.getAttribute("data-lang");
  var SUPPORTED = ["pt-PT", "pt-BR", "en"];
  function pickLang() {
    if (FORCED_LANG && SUPPORTED.indexOf(FORCED_LANG) >= 0) return FORCED_LANG;
    var b = (navigator.language || "en").toLowerCase();
    if (b.indexOf("pt-pt") === 0 || b === "pt") return "pt-PT";
    if (b.indexOf("pt") === 0) return "pt-BR";
    return "en";
  }
  var LANG = pickLang();

  var COPY = {
    "pt-PT": {
      title: "Privacidade & cookies",
      body: "Usamos cookies para melhorar a sua experiência e analisar o tráfego. Pode aceitar tudo, rejeitar não-essenciais ou personalizar.",
      acceptAll: "Aceitar tudo",
      reject: "Apenas essenciais",
      custom: "Personalizar",
      save: "Guardar preferências",
      back: "← Voltar",
      poweredBy: "Powered by BlindAI",
      cats: {
        necessary:  { name: "Essenciais",   desc: "Necessários para o funcionamento do site. Sempre activos." },
        functional: { name: "Funcionais",   desc: "Permitem funcionalidades extra como chat, vídeos, mapas." },
        analytics:  { name: "Estatísticas", desc: "Ajudam a entender como visitantes interagem com o site." },
        marketing:  { name: "Marketing",    desc: "Utilizados para mostrar publicidade relevante." }
      }
    },
    "pt-BR": {
      title: "Privacidade & cookies",
      body: "Usamos cookies para melhorar sua experiência e analisar o tráfego. Você pode aceitar tudo, rejeitar não-essenciais ou personalizar.",
      acceptAll: "Aceitar tudo",
      reject: "Apenas essenciais",
      custom: "Personalizar",
      save: "Salvar preferências",
      back: "← Voltar",
      poweredBy: "Powered by BlindAI",
      cats: {
        necessary:  { name: "Essenciais",   desc: "Necessários para o funcionamento do site. Sempre ativos." },
        functional: { name: "Funcionais",   desc: "Permitem funcionalidades extras como chat, vídeos, mapas." },
        analytics:  { name: "Estatísticas", desc: "Ajudam a entender como visitantes interagem com o site." },
        marketing:  { name: "Marketing",    desc: "Utilizados para exibir publicidade relevante." }
      }
    },
    "en": {
      title: "Privacy & cookies",
      body: "We use cookies to improve your experience and analyze traffic. You can accept all, reject non-essential, or customize.",
      acceptAll: "Accept all",
      reject: "Essential only",
      custom: "Customize",
      save: "Save preferences",
      back: "← Back",
      poweredBy: "Powered by BlindAI",
      cats: {
        necessary:  { name: "Necessary",  desc: "Required for the site to function. Always active." },
        functional: { name: "Functional", desc: "Enable extra features like chat, videos, maps." },
        analytics:  { name: "Analytics",  desc: "Help us understand how visitors interact with the site." },
        marketing:  { name: "Marketing",  desc: "Used to display relevant advertising." }
      }
    }
  };
  var T = COPY[LANG];

  // ─── storage ────────────────────────────────────────────
  var CONSENT_KEY = "_blindai_consent_" + SITE_ID;
  var UID_KEY = "_blindai_uid_" + SITE_ID;
  var CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 12 meses (RGPD)

  function getStored() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (Date.now() - p.ts > CONSENT_TTL_MS) return null;
      return p;
    } catch (e) { return null; }
  }

  function getOrCreateUid() {
    try {
      var u = localStorage.getItem(UID_KEY);
      if (u) return u;
      var n = "u_" + (window.crypto && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
        : Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem(UID_KEY, n);
      return n;
    } catch (e) { return "u_anon"; }
  }

  // ─── api ────────────────────────────────────────────────
  function postConsent(action, choices) {
    var payload = {
      site_id: SITE_ID,
      anon_uid: getOrCreateUid(),
      action: action,
      choices: choices,
      lang: LANG,
      page_url: location.href,
      banner_version: "v1",
      ua: navigator.userAgent,
      ts: new Date().toISOString()
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ choices: choices, ts: Date.now() }));
    } catch (e) {}

    if (!API_BASE) return;
    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        if (navigator.sendBeacon(API_BASE + "/api/v1/consent", blob)) return;
      } catch (e) {}
    }
    fetch(API_BASE + "/api/v1/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors"
    }).catch(function () {});
  }

  // ─── styles ─────────────────────────────────────────────
  var STYLES = '#blindai-banner{position:fixed;bottom:16px;left:16px;right:16px;z-index:2147483647;font-family:ui-monospace,SFMono-Regular,"JetBrains Mono","Menlo",monospace;font-size:14px;line-height:1.5;color:#B6FFCB;opacity:0;transform:translateY(16px);transition:opacity .28s ease,transform .28s ease;pointer-events:none}#blindai-banner.blindai-shown{opacity:1;transform:translateY(0);pointer-events:auto}.blindai-card{max-width:720px;margin:0 auto;background:#0A0E0A;border:1px solid rgba(0,255,65,.4);border-radius:8px;padding:18px 20px;box-shadow:0 0 0 1px rgba(0,255,65,.06),0 16px 48px rgba(0,0,0,.5),0 0 24px rgba(0,255,65,.15);box-sizing:border-box}.blindai-title{font-weight:700;font-size:15px;color:#E6FFEC;margin:0 0 6px}.blindai-body{font-size:13px;color:rgba(182,255,203,.78);margin:0 0 14px}.blindai-actions{display:flex;flex-wrap:wrap;gap:8px}.blindai-btn{display:inline-flex;align-items:center;justify-content:center;padding:8px 14px;border-radius:4px;font-family:inherit;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;border:1px solid transparent;cursor:pointer;transition:all .15s ease;line-height:1}.blindai-btn-primary{background:#00FF41;color:#05080A}.blindai-btn-primary:hover{background:#22FF55;box-shadow:0 0 16px rgba(0,255,65,.4)}.blindai-btn-outline{background:transparent;border-color:rgba(0,255,65,.4);color:#B6FFCB}.blindai-btn-outline:hover{background:rgba(0,255,65,.08);color:#E6FFEC;border-color:rgba(0,255,65,.6)}.blindai-btn-ghost{background:transparent;color:rgba(182,255,203,.6)}.blindai-btn-ghost:hover{background:rgba(0,255,65,.06);color:#B6FFCB}.blindai-badge-row{margin-top:12px;padding-top:10px;border-top:1px solid rgba(0,255,65,.12);display:flex;justify-content:flex-end}.blindai-badge{font-size:10px;color:rgba(182,255,203,.45);text-decoration:none;text-transform:uppercase;letter-spacing:.08em;transition:color .15s ease}.blindai-badge:hover{color:#00FF41}.blindai-rows{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;max-height:320px;overflow-y:auto}.blindai-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid rgba(0,255,65,.12);border-radius:4px;cursor:pointer;transition:all .15s ease}.blindai-row:hover{border-color:rgba(0,255,65,.3);background:rgba(0,255,65,.03)}.blindai-row-info{flex:1;min-width:0}.blindai-row-name{font-weight:600;font-size:12px;color:#E6FFEC;margin-bottom:2px}.blindai-row-desc{font-size:11px;color:rgba(182,255,203,.55)}.blindai-toggle input[type=checkbox]{width:18px;height:18px;accent-color:#00FF41;cursor:pointer;margin:0}.blindai-toggle input[type=checkbox]:disabled{cursor:not-allowed;opacity:.5}@media (max-width:480px){.blindai-card{padding:14px 16px}.blindai-btn{flex:1 1 calc(50% - 4px)}}@media (prefers-reduced-motion:reduce){#blindai-banner{transition:none}}';

  function injectStyles() {
    if (document.getElementById("blindai-styles")) return;
    var s = document.createElement("style");
    s.id = "blindai-styles";
    s.textContent = STYLES;
    (document.head || document.documentElement).appendChild(s);
  }

  // ─── render ─────────────────────────────────────────────
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "className") n.className = attrs[k];
        else if (k === "onclick") n.onclick = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    if (children != null) {
      if (Array.isArray(children)) {
        for (var i = 0; i < children.length; i++) {
          var c = children[i];
          if (c == null) continue;
          n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
        }
      } else if (typeof children === "string") {
        n.textContent = children;
      } else {
        n.appendChild(children);
      }
    }
    return n;
  }

  var container;
  var currentChoices = { necessary: true, functional: false, analytics: false, marketing: false };

  function badgeRow() {
    if (BADGE_DISABLED) return null;
    return el("div", { className: "blindai-badge-row" }, [
      el("a", { href: "https://blindai.app", target: "_blank", rel: "noopener noreferrer", className: "blindai-badge" }, T.poweredBy)
    ]);
  }

  function renderBanner() {
    return el("div", { className: "blindai-card" }, [
      el("div", { className: "blindai-title" }, T.title),
      el("div", { className: "blindai-body" }, T.body),
      el("div", { className: "blindai-actions" }, [
        el("button", { className: "blindai-btn blindai-btn-primary", onclick: acceptAll }, T.acceptAll),
        el("button", { className: "blindai-btn blindai-btn-outline", onclick: rejectAll }, T.reject),
        el("button", { className: "blindai-btn blindai-btn-ghost", onclick: showCustom }, T.custom)
      ]),
      badgeRow()
    ]);
  }

  function renderCustom() {
    var cats = ["necessary", "functional", "analytics", "marketing"];
    var rows = cats.map(function (cat) {
      var c = T.cats[cat];
      var checkbox = el("input", { type: "checkbox" });
      checkbox.checked = currentChoices[cat];
      if (cat === "necessary") checkbox.disabled = true;
      checkbox.addEventListener("change", function (e) {
        currentChoices[cat] = e.target.checked;
      });
      var toggle = el("div", { className: "blindai-toggle" });
      toggle.appendChild(checkbox);
      return el("label", { className: "blindai-row" }, [
        el("div", { className: "blindai-row-info" }, [
          el("div", { className: "blindai-row-name" }, c.name),
          el("div", { className: "blindai-row-desc" }, c.desc)
        ]),
        toggle
      ]);
    });
    return el("div", { className: "blindai-card" }, [
      el("div", { className: "blindai-title" }, T.title),
      el("div", { className: "blindai-rows" }, rows),
      el("div", { className: "blindai-actions" }, [
        el("button", { className: "blindai-btn blindai-btn-ghost", onclick: showBanner }, T.back),
        el("button", { className: "blindai-btn blindai-btn-primary", onclick: saveCustom }, T.save)
      ]),
      badgeRow()
    ]);
  }

  function mount(content) {
    if (!container) {
      container = el("div", { id: "blindai-banner", role: "dialog", "aria-label": T.title });
      document.body.appendChild(container);
      requestAnimationFrame(function () {
        if (container) container.classList.add("blindai-shown");
      });
    }
    container.innerHTML = "";
    container.appendChild(content);
  }

  function unmount() {
    if (!container) return;
    container.classList.remove("blindai-shown");
    var c = container;
    container = null;
    setTimeout(function () {
      if (c && c.parentNode) c.parentNode.removeChild(c);
    }, 280);
  }

  function showBanner() { mount(renderBanner()); }
  function showCustom() { mount(renderCustom()); }

  function acceptAll() {
    currentChoices = { necessary: true, functional: true, analytics: true, marketing: true };
    postConsent("accept_all", currentChoices);
    unmount();
    fireEvent();
  }
  function rejectAll() {
    currentChoices = { necessary: true, functional: false, analytics: false, marketing: false };
    postConsent("reject_all", currentChoices);
    unmount();
    fireEvent();
  }
  function saveCustom() {
    postConsent("custom", currentChoices);
    unmount();
    fireEvent();
  }

  function fireEvent() {
    try {
      window.dispatchEvent(new CustomEvent("blindai:consent", { detail: { choices: currentChoices } }));
    } catch (e) {}
  }

  // ─── init ───────────────────────────────────────────────
  function init() {
    var stored = getStored();
    var api = {
      version: "0.1.0",
      consent: null,
      show: function () { injectStyles(); showBanner(); },
      reset: function () {
        try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
        currentChoices = { necessary: true, functional: false, analytics: false, marketing: false };
        injectStyles();
        showBanner();
      }
    };

    if (stored) {
      currentChoices = stored.choices || currentChoices;
      api.consent = currentChoices;
    } else {
      injectStyles();
      showBanner();
    }
    window.BlindAI = api;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
