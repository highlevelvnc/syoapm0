import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { MatrixRain } from "@/components/matrix-rain";
import { TerminalBoot } from "@/components/terminal-boot";
import { CookieDemo } from "@/components/cookie-demo";
import { PublicScanForm } from "@/components/public-scan-form";
import { StatsCounter } from "@/components/stats-counter";
import { LocaleToggle } from "@/components/locale-toggle";
import { APP_NAME } from "@/lib/constants";
import { getCopy } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const t = getCopy("en");

export const metadata: Metadata = {
  title: "BlindAI — GDPR/LGPD compliance + security in 1 line of code",
  description:
    "Defensive platform: cookie banner, security scanner, anti-phishing, alerts. For sites on any stack.",
  alternates: {
    languages: { "pt-PT": "/", "en-US": "/en" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "BlindAI",
    description: "GDPR/LGPD compliance + security in 1 line of code",
  },
};

export default function HomeEN() {
  return (
    <main className="relative min-h-screen scanline">
      <MatrixRain />
      <div className="grid-bg fixed inset-0 -z-10 opacity-50" aria-hidden />

      <nav className="border-b border-ink-700 bg-ink-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-2 text-ink-50 font-bold tracking-wider">
            <span className="text-matrix-500 text-glow">▊</span>
            <span>{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link href="/test" className="btn-ghost hidden sm:inline-flex">{t.nav.test}</Link>
            <a href="#how" className="btn-ghost hidden sm:inline-flex">{t.nav.how}</a>
            <a href="#pricing" className="btn-ghost hidden sm:inline-flex">{t.nav.pricing}</a>
            <a href="#faq" className="btn-ghost hidden sm:inline-flex">{t.nav.faq}</a>
            <LocaleToggle current="en" />
            <Link href="/auth/login" className="btn-matrix-solid">{t.nav.login}</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 relative">
        <TerminalBoot />
        <h1 className="mt-8 text-4xl sm:text-6xl font-bold leading-tight text-ink-50 tracking-tight">
          {t.hero.titleA}
          {t.hero.titleB}
          <span className="text-matrix-500 text-glow">{t.hero.titleHighlight2}</span>
          {t.hero.titleC}
        </h1>
        <p className="mt-6 text-lg text-ink-300 max-w-2xl">{t.hero.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/auth/signup" className="btn-matrix-solid">{t.hero.ctaPrimary}</Link>
          <a href="#how" className="btn-matrix">{t.hero.ctaSecondary}</a>
        </div>

        <div className="mt-10 pt-8 border-t border-ink-700">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">{t.hero.altPrompt}</div>
          <PublicScanForm size="lg" />
        </div>
      </section>

      <section className="border-t border-ink-700 py-10 bg-ink-800/30">
        <Suspense fallback={null}>
          <StatsCounter />
        </Suspense>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">{t.how.tag}</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-ink-50 mb-10">
          {t.how.title}
          <span className="text-matrix-500 text-glow">{t.how.titleSpan}</span>.
        </h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {t.steps.map((s) => (
            <div key={s.n} className="terminal-card p-5">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-matrix-500 font-bold text-xs">[{s.n}]</span>
                <span className="text-[10px] text-ink-500 uppercase tracking-wider">{s.time}</span>
              </div>
              <div className="text-ink-50 font-bold mb-2">{s.title}</div>
              <div className="text-xs text-ink-400">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="border-t border-ink-700 bg-ink-800/40 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">{t.demo.tag}</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-50 mb-8">{t.demo.title}</h2>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <pre className="terminal-card p-4 text-xs sm:text-sm overflow-x-auto">
{`<script
  src="https://syoapm0.vercel.app/cdn/w.js"
  data-site="<YOUR-ID>"
  data-lang="en"
  async
></script>`}
              </pre>
              <p className="mt-4 text-sm text-ink-400">
                {t.demo.sublabel} <code className="text-matrix-500">data-lang</code> or{" "}
                <code className="text-matrix-500">navigator.language</code>. Banner persists 12 months
                (GDPR). Consent history stored in DB for legal audit.
              </p>
            </div>
            <CookieDemo />
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">{t.pricing.tag}</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-ink-50 mb-2">{t.pricing.title}</h2>
        <p className="text-sm text-ink-400 mb-10 max-w-2xl">{t.pricing.subtitle}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["free", "pro", "agency", "enterprise"] as const).map((key) => {
            const tier = t.tiers[key];
            const highlight = key === "pro";
            const disabled = tier.cta === t.tiers.pro.cta && key !== "free";
            return (
              <div
                key={key}
                className={`terminal-card p-6 relative flex flex-col ${highlight ? "border-matrix-500/40 shadow-matrix" : ""}`}
              >
                {highlight && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-matrix-500 text-ink-950 rounded font-bold">
                      {t.tiers.recommended}
                    </span>
                  </div>
                )}
                <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">{tier.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-ink-50">{tier.price}</span>
                  {"cadence" in tier && tier.cadence && (
                    <span className="text-xs text-ink-500">{tier.cadence}</span>
                  )}
                </div>
                <p className="text-xs text-ink-400 mb-4 min-h-[36px]">{tier.pitch}</p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-ink-300">
                      <span className="text-matrix-500 mt-0.5 shrink-0">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {disabled ? (
                  <div className="text-center text-[11px] uppercase tracking-wider text-ink-500 py-2 border border-ink-700 rounded">
                    {tier.cta}
                  </div>
                ) : key === "free" ? (
                  <Link href="/auth/signup" className="btn-matrix-solid w-full">{tier.cta}</Link>
                ) : (
                  <a href="mailto:vnc.oli@gmail.com" className="btn-matrix w-full">{tier.cta}</a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section id="faq" className="border-t border-ink-700 py-20 bg-ink-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">{t.faq.tag}</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-50 mb-10">{t.faq.title}</h2>
          <ul className="space-y-3 max-w-3xl">
            {t.faqItems.map((item, i) => (
              <li key={i} className="terminal-card p-5">
                <div className="text-ink-50 font-bold mb-2 flex items-baseline gap-2">
                  <span className="text-matrix-500 text-xs">[{String(i + 1).padStart(2, "0")}]</span>
                  <span>{item.q}</span>
                </div>
                <div
                  className="text-sm text-ink-400 leading-relaxed pl-7"
                  dangerouslySetInnerHTML={{ __html: item.aHtml }}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-ink-700 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-ink-500 flex items-center gap-2">
            <span className="text-matrix-500">▊</span>
            <span>{APP_NAME} · 100% defensive</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-ink-500 uppercase tracking-wider">
            <Link href="/test" className="hover:text-ink-300">test scan</Link>
            <Link href="/auth/login" className="hover:text-ink-300">login</Link>
            <a href="https://github.com/highlevelvnc/syoapm0" target="_blank" rel="noopener noreferrer" className="hover:text-ink-300">github</a>
            <span>built in lisbon · 2026</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
