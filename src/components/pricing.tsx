import Link from "next/link";

interface Tier {
  name: string;
  price: string;
  cadence?: string;
  pitch: string;
  features: string[];
  cta: { label: string; href: string; primary?: boolean; disabled?: boolean };
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "€0",
    cadence: "para sempre",
    pitch: "valida o produto sem cartão de crédito.",
    features: [
      "1 site",
      "Manual scan a pedido",
      "Cookie banner RGPD/LGPD universal",
      "Histórico completo de consents",
      "Public test scan (qualquer pessoa testa um site)",
    ],
    cta: { label: "$ começar grátis", href: "/auth/signup", primary: true },
  },
  {
    name: "Pro",
    price: "€9",
    cadence: "/ mês",
    pitch: "para freelancers e devs com 5-10 sites de clientes.",
    features: [
      "Até 10 sites",
      "Scan diário automático (cron 03:00 UTC)",
      "Email alerts (high/critical findings)",
      "Anti-phishing typosquatting monitor",
      "Achievements + leaderboard interno",
      "Prioridade no suporte",
    ],
    cta: { label: "em breve", href: "#", disabled: true },
    highlight: true,
  },
  {
    name: "Agency",
    price: "€29",
    cadence: "/ mês",
    pitch: "para agências com 30+ sites de clientes.",
    features: [
      "Sites ilimitados",
      "Cloudflare orchestrator (auto-config WAF, DNSSEC, Bot Fight)",
      "GitHub Dependabot CVE monitor",
      "White-label do banner (sem badge BlindAI)",
      "Multi-user na conta",
    ],
    cta: { label: "em breve", href: "#", disabled: true },
  },
  {
    name: "Enterprise",
    price: "custom",
    pitch: "self-host, custom domain, SLA, integração com SIEM.",
    features: [
      "Self-hosted (deploy próprio)",
      "Custom domain no widget (cdn.tua-empresa.com)",
      "SLA com response time",
      "DPA personalizado",
      "Integração SIEM/Splunk",
    ],
    cta: { label: "contactar", href: "mailto:vnc.oli@gmail.com" },
  },
];

export function Pricing() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {TIERS.map((t) => (
        <div
          key={t.name}
          className={`terminal-card p-6 relative flex flex-col ${
            t.highlight ? "border-matrix-500/40 shadow-matrix" : ""
          }`}
        >
          {t.highlight && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-matrix-500 text-ink-950 rounded font-bold">
                recomendado
              </span>
            </div>
          )}
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">{t.name}</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-matrix-50">{t.price}</span>
            {t.cadence && <span className="text-xs text-matrix-700">{t.cadence}</span>}
          </div>
          <p className="text-xs text-matrix-200/60 mb-4 min-h-[36px]">{t.pitch}</p>
          <ul className="space-y-1.5 mb-6 flex-1">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-matrix-200/80">
                <span className="text-matrix-500 mt-0.5 shrink-0">▸</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {t.cta.disabled ? (
            <div className="text-center text-[11px] uppercase tracking-wider text-matrix-700 py-2 border border-matrix-900 rounded">
              {t.cta.label}
            </div>
          ) : (
            <Link
              href={t.cta.href}
              className={t.cta.primary ? "btn-matrix-solid w-full" : "btn-matrix w-full"}
            >
              {t.cta.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
