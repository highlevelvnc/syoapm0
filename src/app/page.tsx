import Link from "next/link";
import { MatrixRain } from "@/components/matrix-rain";
import { TerminalBoot } from "@/components/terminal-boot";
import { CookieDemo } from "@/components/cookie-demo";
import { PublicScanForm } from "@/components/public-scan-form";
import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="relative min-h-screen scanline">
      <MatrixRain />
      <div className="grid-bg fixed inset-0 -z-10 opacity-50" aria-hidden />

      <nav className="border-b border-matrix-900 bg-ink-900/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-matrix-50 font-bold tracking-wider">
            <span className="text-matrix-500 text-glow">▊</span>
            <span>{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link href="/test" className="btn-ghost hidden sm:inline-flex">test grátis</Link>
            <a href="#how" className="btn-ghost hidden sm:inline-flex">como funciona</a>
            <a href="#roadmap" className="btn-ghost hidden sm:inline-flex">roadmap</a>
            <Link href="/auth/login" className="btn-matrix-solid">entrar →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 relative">
        <TerminalBoot />
        <h1 className="mt-8 text-4xl sm:text-6xl font-bold leading-tight text-matrix-50 tracking-tight">
          Compliance{" "}
          <span className="text-matrix-500 text-glow">RGPD/LGPD</span>
          <br />
          + segurança em <span className="text-matrix-500 text-glow">1 linha</span> de código.
        </h1>
        <p className="mt-6 text-lg text-matrix-200/70 max-w-2xl">
          Plataforma 100% defensiva para proteger todos os teus sites — Next.js, WordPress, ou qualquer stack. Cola um snippet, recebe scoring de segurança, alertas em tempo real e logs de consent prontos para auditoria.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/auth/signup" className="btn-matrix-solid">
            $ começar — grátis
          </Link>
          <a href="#demo" className="btn-matrix">ver demo ↓</a>
        </div>

        <div className="mt-10 pt-8 border-t border-matrix-900">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
            // ou testa qualquer site sem signup
          </div>
          <PublicScanForm size="lg" />
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4 max-w-3xl">
          <Stat label="Sites protegidos" value="∞" hint="(no plano free)" />
          <Stat label="Compliance" value="RGPD · LGPD" />
          <Stat label="Widget" value="<3 KB" hint="vanilla JS" />
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="border-t border-matrix-900 bg-ink-800/40 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
            // 01 · cola 1 linha em qualquer site
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-matrix-50 mb-8">demo do banner</h2>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <pre className="terminal-card p-4 text-xs sm:text-sm overflow-x-auto">
{`<script
  src="https://blindai.app/cdn/w.js"
  data-site="<O-TEU-SITE-ID>"
  async
></script>`}
              </pre>
              <p className="mt-4 text-sm text-matrix-200/60">
                Detecta língua via <code className="text-matrix-500">navigator.language</code>, mostra o banner e regista o consent. O log persiste 12 meses (exigência RGPD).
              </p>
            </div>
            <CookieDemo />
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
          // 02 · como funciona
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-matrix-50 mb-10">
          4 passos. zero código complexo.
        </h2>
        <ol className="grid md:grid-cols-2 gap-4">
          <Step n="01" title="adiciona o teu site" desc="domain + nome. recebes site_id único." />
          <Step n="02" title='cola 1 linha no <head>' desc="snippet leve (~3KB). funciona em qualquer stack." />
          <Step n="03" title="recolhe consents + monitora" desc="histórico completo guardado, pronto para auditoria legal." />
          <Step n="04" title="recebe alertas" desc="telegram, email ou discord quando algo está mal." />
        </ol>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="border-t border-matrix-900 py-20 bg-ink-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
            // 03 · roadmap pública
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-matrix-50 mb-10">
            a construir-se em fases.
          </h2>
          <ul className="space-y-3 max-w-3xl">
            <Roadmap v="v0.1" t="cookie banner RGPD/LGPD universal" status="active" />
            <Roadmap v="v0.2" t="security scanner: SSL labs + headers + DNS + lighthouse" status="next" />
            <Roadmap v="v0.3" t="anti-phishing & typosquatting monitor" status="planned" />
            <Roadmap v="v0.4" t="vulnerability scanner (CVEs em deps via dependabot)" status="planned" />
            <Roadmap v="v0.5" t="privacy policy / DPA generator por país" status="planned" />
            <Roadmap v="v1.0" t="dashboard gamificado: XP, achievements, leaderboard" status="planned" />
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-matrix-900 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-matrix-700 flex items-center gap-2">
            <span className="text-matrix-500">▊</span>
            <span>{APP_NAME} · 100% defensivo · free tier para sempre</span>
          </div>
          <div className="text-[10px] text-matrix-700 uppercase tracking-wider">
            built in lisbon · 2026
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="terminal-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-matrix-700">{label}</div>
      <div className="mt-1 text-2xl font-bold text-matrix-100">{value}</div>
      {hint && <div className="text-xs text-matrix-700 mt-0.5">{hint}</div>}
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <li className="terminal-card p-5">
      <div className="text-matrix-500 text-xs">[{n}]</div>
      <div className="mt-2 text-matrix-50 font-bold">{title}</div>
      <div className="mt-1 text-sm text-matrix-200/70">{desc}</div>
    </li>
  );
}

function Roadmap({ v, t, status }: { v: string; t: string; status: "active" | "next" | "planned" }) {
  const map = {
    active: { label: "live", cls: "badge-ok" },
    next: { label: "in-progress", cls: "badge-warn" },
    planned: { label: "planned", cls: "badge-muted" },
  } as const;
  const s = map[status];
  return (
    <li className="flex items-center gap-4 terminal-card p-4">
      <div className="text-matrix-500 text-sm font-bold w-12 shrink-0">{v}</div>
      <div className="flex-1 text-matrix-100 text-sm sm:text-base">{t}</div>
      <span className={s.cls}>{s.label}</span>
    </li>
  );
}
