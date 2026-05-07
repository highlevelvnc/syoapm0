import Link from "next/link";
import { Suspense } from "react";
import { MatrixRain } from "@/components/matrix-rain";
import { TerminalBoot } from "@/components/terminal-boot";
import { CookieDemo } from "@/components/cookie-demo";
import { PublicScanForm } from "@/components/public-scan-form";
import { InstallGuide } from "@/components/install-guide";
import { Pricing } from "@/components/pricing";
import { Faq } from "@/components/faq";
import { StatsCounter } from "@/components/stats-counter";
import { LocaleToggle } from "@/components/locale-toggle";
import { APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="relative min-h-screen scanline">
      <MatrixRain />
      <div className="grid-bg fixed inset-0 -z-10 opacity-50" aria-hidden />

      <nav className="border-b border-ink-700 bg-ink-900/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-ink-50 font-bold tracking-wider">
            <span className="text-matrix-500 text-glow">▊</span>
            <span>{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link href="/test" className="btn-ghost hidden sm:inline-flex">test grátis</Link>
            <a href="#how" className="btn-ghost hidden sm:inline-flex">como funciona</a>
            <a href="#pricing" className="btn-ghost hidden sm:inline-flex">pricing</a>
            <a href="#faq" className="btn-ghost hidden sm:inline-flex">faq</a>
            <LocaleToggle current="pt" />
            <Link href="/auth/login" className="btn-matrix-solid">entrar →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 relative">
        <TerminalBoot />
        <h1 className="mt-8 text-4xl sm:text-6xl font-bold leading-tight text-ink-50 tracking-tight">
          Compliance{" "}
          <span className="text-matrix-500 text-glow">RGPD/LGPD</span>
          <br />
          + segurança em <span className="text-matrix-500 text-glow">1 linha</span> de código.
        </h1>
        <p className="mt-6 text-lg text-ink-300/70 max-w-2xl">
          Plataforma 100% defensiva para proteger todos os teus sites — Next.js, WordPress, ou qualquer stack. Cola um snippet, recebe scoring de segurança, alertas em tempo real e logs de consent prontos para auditoria.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/auth/signup" className="btn-matrix-solid">
            $ começar — grátis
          </Link>
          <a href="#how" className="btn-matrix">como funciona ↓</a>
        </div>

        <div className="mt-10 pt-8 border-t border-ink-700">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
            // ou testa qualquer site sem signup
          </div>
          <PublicScanForm size="lg" />
        </div>
      </section>

      {/* STATS COUNTER */}
      <section className="border-t border-ink-700 py-10 bg-ink-800/30">
        <Suspense fallback={null}>
          <StatsCounter />
        </Suspense>
      </section>

      {/* HOW */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
          // como funciona
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-ink-50 mb-10">
          live em <span className="text-matrix-500 text-glow">30 segundos</span>.
        </h2>
        <InstallGuide />
      </section>

      {/* DEMO BANNER */}
      <section id="demo" className="border-t border-ink-700 bg-ink-800/40 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
            // banner em acção
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-50 mb-8">demo do cookie banner</h2>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <pre className="terminal-card p-4 text-xs sm:text-sm overflow-x-auto">
{`<script
  src="https://syoapm0.vercel.app/cdn/w.js"
  data-site="<O-TEU-ID>"
  data-lang="pt-PT"
  async
></script>`}
              </pre>
              <p className="mt-4 text-sm text-ink-300/60">
                Detecta língua via <code className="text-matrix-500">data-lang</code> ou{" "}
                <code className="text-matrix-500">navigator.language</code>. Banner persiste 12 meses (RGPD).
                Histórico de consents na DB para auditoria legal.
              </p>
            </div>
            <CookieDemo />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">// pricing</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-ink-50 mb-2">
          começa grátis. paga quando escalares.
        </h2>
        <p className="text-sm text-ink-300/70 mb-10 max-w-2xl">
          Free para sempre nos primeiros 100 utilizadores. Pro e Agency lançam quando o produto estabilizar.
        </p>
        <Pricing />
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-ink-700 py-20 bg-ink-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">// faq</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-50 mb-10">perguntas frequentes</h2>
          <Faq />
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">// roadmap pública</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-ink-50 mb-10">
          construído ao vivo. acompanha.
        </h2>
        <ul className="space-y-3 max-w-3xl">
          <Roadmap v="v0.1" t="cookie banner RGPD/LGPD universal · widget vanilla JS" status="done" />
          <Roadmap v="v0.2" t="security scanner: SSL + headers + DNS + exposure" status="done" />
          <Roadmap v="v0.3" t="anti-phishing & typosquatting monitor" status="done" />
          <Roadmap v="v0.4" t="cloudflare orchestrator (WAF, DNSSEC, Bot Fight)" status="done" />
          <Roadmap v="v0.5" t="public scan API (free, sem signup)" status="done" />
          <Roadmap v="v0.6" t="email alerts (Resend) + GitHub Dependabot CVE scan" status="next" />
          <Roadmap v="v1.0" t="dashboard gamificado: XP, leaderboard, achievements desbloqueáveis" status="planned" />
          <Roadmap v="v1.1" t="privacy policy / DPA generator por país" status="planned" />
        </ul>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-700 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-ink-500 flex items-center gap-2">
            <span className="text-matrix-500">▊</span>
            <span>{APP_NAME} · 100% defensivo</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-ink-500 uppercase tracking-wider">
            <Link href="/test" className="hover:text-matrix-300">test scan</Link>
            <Link href="/auth/login" className="hover:text-matrix-300">login</Link>
            <a href="https://github.com/highlevelvnc/syoapm0" target="_blank" rel="noopener noreferrer" className="hover:text-matrix-300">github</a>
            <span>built in lisbon · 2026</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Roadmap({ v, t, status }: { v: string; t: string; status: "done" | "next" | "planned" }) {
  const map = {
    done: { label: "done", cls: "badge-ok" },
    next: { label: "in-progress", cls: "badge-warn" },
    planned: { label: "planned", cls: "badge-muted" },
  } as const;
  const s = map[status];
  return (
    <li className="flex items-center gap-4 terminal-card p-4">
      <div className="text-matrix-500 text-sm font-bold w-12 shrink-0">{v}</div>
      <div className="flex-1 text-ink-100 text-sm sm:text-base">{t}</div>
      <span className={s.cls}>{s.label}</span>
    </li>
  );
}
