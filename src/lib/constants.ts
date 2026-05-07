export const APP_NAME = "BlindAI";
export const APP_TAGLINE = "Compliance RGPD/LGPD + segurança em 1 linha de código";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const LANGS = {
  "pt-PT": "Português (PT)",
  "pt-BR": "Português (BR)",
  en: "English",
} as const;

export type Lang = keyof typeof LANGS;

export const CONSENT_CATEGORIES = ["necessary", "functional", "analytics", "marketing"] as const;
export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Lang, Record<ConsentCategory, string>> = {
  "pt-PT": {
    necessary: "Essenciais",
    functional: "Funcionais",
    analytics: "Estatísticas",
    marketing: "Marketing",
  },
  "pt-BR": {
    necessary: "Essenciais",
    functional: "Funcionais",
    analytics: "Estatísticas",
    marketing: "Marketing",
  },
  en: {
    necessary: "Necessary",
    functional: "Functional",
    analytics: "Analytics",
    marketing: "Marketing",
  },
};
