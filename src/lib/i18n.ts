export type Locale = "pt" | "en";

export const LOCALES: Locale[] = ["pt", "en"];
export const DEFAULT_LOCALE: Locale = "pt";

export interface LandingCopy {
  // nav
  nav: { test: string; how: string; pricing: string; faq: string; login: string };
  // hero
  hero: {
    titleA: string;
    titleHighlight1: string;
    titleB: string;
    titleHighlight2: string;
    titleC: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    altPrompt: string;
    statsSites: string;
    statsSitesHint: string;
    statsCompliance: string;
    statsWidget: string;
    statsWidgetHint: string;
  };
  // sections
  how: { tag: string; title: string; titleSpan: string };
  demo: { tag: string; title: string; sublabel: string };
  pricing: { tag: string; title: string; subtitle: string };
  faq: { tag: string; title: string };
  roadmap: { tag: string; title: string };
  // pricing tiers
  tiers: {
    free: { name: string; price: string; cadence: string; pitch: string; cta: string; features: string[] };
    pro: { name: string; price: string; cadence: string; pitch: string; cta: string; features: string[] };
    agency: { name: string; price: string; cadence: string; pitch: string; cta: string; features: string[] };
    enterprise: { name: string; price: string; pitch: string; cta: string; features: string[] };
    recommended: string;
  };
  // install steps
  steps: Array<{ n: string; title: string; time: string; body: string }>;
  // faq
  faqItems: Array<{ q: string; aHtml: string }>;
  // public scan form
  scan: { placeholder: string; button: string; disclaimer: string };
}

export const COPY: Record<Locale, LandingCopy> = {
  pt: {
    nav: { test: "test grátis", how: "como funciona", pricing: "pricing", faq: "faq", login: "entrar →" },
    hero: {
      titleA: "Compliance ",
      titleHighlight1: "RGPD/LGPD",
      titleB: " + segurança em ",
      titleHighlight2: "1 linha",
      titleC: " de código.",
      subtitle:
        "Plataforma 100% defensiva para proteger todos os teus sites — Next.js, WordPress, ou qualquer stack. Cola um snippet, recebe scoring de segurança, alertas em tempo real e logs de consent prontos para auditoria.",
      ctaPrimary: "$ começar — grátis",
      ctaSecondary: "como funciona ↓",
      altPrompt: "// ou testa qualquer site sem signup",
      statsSites: "Sites protegidos",
      statsSitesHint: "(no plano free)",
      statsCompliance: "Compliance",
      statsWidget: "Widget",
      statsWidgetHint: "vanilla JS",
    },
    how: { tag: "// como funciona", title: "live em ", titleSpan: "30 segundos" },
    demo: { tag: "// banner em acção", title: "demo do cookie banner", sublabel: "Detecta língua via" },
    pricing: {
      tag: "// pricing",
      title: "começa grátis. paga quando escalares.",
      subtitle: "Free para sempre nos primeiros 100 utilizadores. Pro e Agency lançam quando o produto estabilizar.",
    },
    faq: { tag: "// faq", title: "perguntas frequentes" },
    roadmap: { tag: "// roadmap pública", title: "construído ao vivo. acompanha." },
    tiers: {
      free: {
        name: "Free",
        price: "€0",
        cadence: "para sempre",
        pitch: "valida o produto sem cartão de crédito.",
        cta: "$ começar grátis",
        features: [
          "1 site",
          "Manual scan a pedido",
          "Cookie banner RGPD/LGPD universal",
          "Histórico completo de consents",
          "Public test scan",
        ],
      },
      pro: {
        name: "Pro",
        price: "€9",
        cadence: "/ mês",
        pitch: "para freelancers e devs com 5-10 sites.",
        cta: "em breve",
        features: [
          "Até 10 sites",
          "Scan diário automático",
          "Email alerts (high/critical)",
          "Anti-phishing typosquatting monitor",
          "Achievements + leaderboard interno",
          "Prioridade no suporte",
        ],
      },
      agency: {
        name: "Agency",
        price: "€29",
        cadence: "/ mês",
        pitch: "para agências com 30+ sites de clientes.",
        cta: "em breve",
        features: [
          "Sites ilimitados",
          "Cloudflare orchestrator",
          "GitHub Dependabot CVE monitor",
          "White-label do banner",
          "Multi-user na conta",
        ],
      },
      enterprise: {
        name: "Enterprise",
        price: "custom",
        pitch: "self-host, custom domain, SLA, integração SIEM.",
        cta: "contactar",
        features: ["Self-hosted", "Custom domain widget", "SLA com response time", "DPA personalizado", "Integração SIEM/Splunk"],
      },
      recommended: "recomendado",
    },
    steps: [
      { n: "01", title: "adiciona o teu site", time: "10s", body: "Domain + nome interno." },
      { n: "02", title: "cola 1 linha no <head>", time: "10s", body: "Snippet leve, qualquer stack." },
      { n: "03", title: "dashboard live", time: "10s", body: "Banner aparece, scan diário, alerts." },
    ],
    faqItems: [
      {
        q: "Quanto tempo demora a configurar?",
        aHtml: "Em ~30 segundos: signup, adicionas site, copias 1 linha de <code>&lt;script&gt;</code> e colas no <code>&lt;head&gt;</code>. Funciona em qualquer stack.",
      },
      {
        q: "Funciona em sites em PHP / WordPress / Shopify?",
        aHtml: "Sim. Widget é vanilla JS auto-contido. Sem framework, build step ou plugin.",
      },
      {
        q: "Os dados são partilhados com terceiros?",
        aHtml: "Não. IPs hashed com SHA-256 + salt. Tokens de integração encrypted at rest com AES-256-GCM. Não vendemos dados.",
      },
      {
        q: "Cobre SQL injection / DDoS / ransomware?",
        aHtml: "Honestidade: BlindAI é monitoring + orquestração, não runtime shield. DDoS/WAF resolve via Cloudflare (orquestramos). SQLi vem do código (detectamos padrões via scan). Construímos contra os vetores reais que afectam landing pages.",
      },
      {
        q: "Posso cancelar a qualquer momento?",
        aHtml: "Sim. Plano free não tem renovação automática (sem cartão registado). Planos pagos são mensais sem fidelização.",
      },
    ],
    scan: {
      placeholder: "meusite.com",
      button: "$ scan",
      disclaimer: "grátis · sem signup · 24h cache compartilhado",
    },
  },
  en: {
    nav: { test: "free test", how: "how it works", pricing: "pricing", faq: "faq", login: "log in →" },
    hero: {
      titleA: "GDPR compliance",
      titleHighlight1: "",
      titleB: " + security in ",
      titleHighlight2: "1 line",
      titleC: " of code.",
      subtitle:
        "100% defensive platform to protect every site you ship — Next.js, WordPress, or any stack. Paste a snippet, get security scoring, real-time alerts, and audit-ready consent logs.",
      ctaPrimary: "$ start — free",
      ctaSecondary: "how it works ↓",
      altPrompt: "// or test any site without signup",
      statsSites: "Sites protected",
      statsSitesHint: "(free plan)",
      statsCompliance: "Compliance",
      statsWidget: "Widget",
      statsWidgetHint: "vanilla JS",
    },
    how: { tag: "// how it works", title: "live in ", titleSpan: "30 seconds" },
    demo: { tag: "// banner in action", title: "cookie banner demo", sublabel: "Detects language via" },
    pricing: {
      tag: "// pricing",
      title: "start free. pay when you scale.",
      subtitle: "Free forever for the first 100 users. Pro and Agency launch once the product stabilizes.",
    },
    faq: { tag: "// faq", title: "frequently asked" },
    roadmap: { tag: "// public roadmap", title: "built in the open. follow along." },
    tiers: {
      free: {
        name: "Free",
        price: "$0",
        cadence: "forever",
        pitch: "validate the product without a credit card.",
        cta: "$ start free",
        features: [
          "1 site",
          "Manual scan on demand",
          "GDPR/LGPD universal cookie banner",
          "Full consent audit log",
          "Public test scan",
        ],
      },
      pro: {
        name: "Pro",
        price: "$10",
        cadence: "/ mo",
        pitch: "for freelancers and devs with 5-10 sites.",
        cta: "soon",
        features: [
          "Up to 10 sites",
          "Daily auto-scan",
          "Email alerts (high/critical)",
          "Anti-phishing typosquatting monitor",
          "Achievements + internal leaderboard",
          "Priority support",
        ],
      },
      agency: {
        name: "Agency",
        price: "$30",
        cadence: "/ mo",
        pitch: "for agencies with 30+ client sites.",
        cta: "soon",
        features: [
          "Unlimited sites",
          "Cloudflare orchestrator",
          "GitHub Dependabot CVE monitor",
          "White-label banner",
          "Multi-user accounts",
        ],
      },
      enterprise: {
        name: "Enterprise",
        price: "custom",
        pitch: "self-host, custom domain, SLA, SIEM integration.",
        cta: "contact",
        features: ["Self-hosted", "Custom domain widget", "SLA with response time", "Custom DPA", "SIEM/Splunk integration"],
      },
      recommended: "recommended",
    },
    steps: [
      { n: "01", title: "add your site", time: "10s", body: "Domain + internal name." },
      { n: "02", title: "paste 1 line in <head>", time: "10s", body: "Lightweight snippet, any stack." },
      { n: "03", title: "live dashboard", time: "10s", body: "Banner appears, daily scan, alerts." },
    ],
    faqItems: [
      {
        q: "How long does setup take?",
        aHtml: "~30 seconds: sign up, add site, copy 1 line of <code>&lt;script&gt;</code>, paste in <code>&lt;head&gt;</code>. Works on any stack.",
      },
      {
        q: "Does it work on PHP / WordPress / Shopify?",
        aHtml: "Yes. Widget is self-contained vanilla JS. No framework, build step, or plugin needed.",
      },
      {
        q: "Is data shared with third parties?",
        aHtml: "No. IPs are hashed with SHA-256 + salt. Integration tokens encrypted at rest with AES-256-GCM. We don't sell data.",
      },
      {
        q: "Does it cover SQL injection / DDoS / ransomware?",
        aHtml: "Honest answer: BlindAI is monitoring + orchestration, not a runtime shield. DDoS/WAF lives at Cloudflare (we orchestrate it). SQLi comes from the code (we scan for patterns). We cover the real vectors hitting landing pages.",
      },
      {
        q: "Can I cancel anytime?",
        aHtml: "Yes. Free plan has no auto-renew (no card on file). Paid plans are monthly, no lock-in.",
      },
    ],
    scan: {
      placeholder: "yoursite.com",
      button: "$ scan",
      disclaimer: "free · no signup · shared 24h cache",
    },
  },
};

export function getCopy(locale: Locale): LandingCopy {
  return COPY[locale] ?? COPY[DEFAULT_LOCALE];
}
