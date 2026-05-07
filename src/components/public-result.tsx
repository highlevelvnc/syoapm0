import Link from "next/link";
import { gradeColor } from "@/lib/scanners/score";
import { fmtNumber, fmtDate } from "@/lib/utils";
import type { Grade, Category, Severity } from "@/lib/scanners";
import type { PublicScanRow, FindingsSummary } from "@/lib/public-scan";
import { ShareRow } from "@/components/share-row";

const CATEGORY_INFO: Record<Category, { label: string; description: string }> = {
  ssl:          { label: "SSL/TLS",      description: "certificado, protocolo, expiry" },
  headers:      { label: "Headers",      description: "HSTS, CSP, X-Frame, etc." },
  dns:          { label: "DNS",          description: "SPF, DMARC, CAA, DNSSEC" },
  exposure:     { label: "Exposure",     description: ".env, .git, admin paths" },
  phishing:     { label: "Phishing",     description: "typosquatting, dominios similares" },
  dependencies: { label: "Dependencies", description: "CVEs em pacotes" },
  tech:         { label: "Tech",         description: "stack detectada" },
  general:      { label: "General",      description: "geral" },
};

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: "badge-err",
  high: "badge-err",
  medium: "badge-warn",
  low: "badge-muted",
  info: "badge-muted",
};

const GRADE_LABEL: Record<Grade, string> = {
  "A+": "excellent",
  A: "great",
  B: "good",
  C: "ok",
  D: "poor",
  F: "critical",
};

export function PublicResult({ scan }: { scan: PublicScanRow }) {
  const grade = (scan.grade ?? "F") as Grade;
  const score = scan.score ?? 0;
  const summary = scan.findings_summary as FindingsSummary | null;
  const visibleCats: Category[] = ["ssl", "headers", "dns", "exposure", "phishing"];
  const cs = scan.category_scores ?? {};
  const tech = scan.detected_tech ?? [];

  return (
    <div className="space-y-8">
      {/* SCORE HERO */}
      <div className="terminal-card p-8">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">
              security score · {scan.domain}
            </div>
            <div
              className="text-8xl sm:text-9xl font-bold tabular-nums leading-none text-glow"
              style={{ color: gradeColor(grade) }}
            >
              {score}
            </div>
            <div
              className="text-sm uppercase tracking-wider mt-3 font-bold"
              style={{ color: gradeColor(grade) }}
            >
              {GRADE_LABEL[grade]}
            </div>
          </div>
          <div
            className="text-7xl sm:text-9xl font-bold leading-none"
            style={{ color: gradeColor(grade) }}
          >
            {grade}
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-ink-700 grid sm:grid-cols-4 gap-4 text-xs">
          <Stat label="critical" value={fmtNumber(scan.critical_findings)} tone={scan.critical_findings > 0 ? "danger" : "muted"} />
          <Stat label="high" value={fmtNumber(scan.high_findings)} tone={scan.high_findings > 0 ? "danger" : "muted"} />
          <Stat label="medium" value={fmtNumber(scan.medium_findings)} tone={scan.medium_findings > 0 ? "warn" : "muted"} />
          <Stat label="low" value={fmtNumber(scan.low_findings)} tone="muted" />
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="terminal-card p-6 space-y-4">
        <div className="text-xs uppercase tracking-wider text-matrix-500">// breakdown por categoria</div>
        {visibleCats.map((cat) => {
          const catScore = (cs as Record<string, number>)[cat] ?? 100;
          const catGrade = gradeFromScore(catScore);
          return (
            <div key={cat}>
              <div className="flex items-baseline justify-between mb-1">
                <div>
                  <span className="text-xs uppercase tracking-wider text-matrix-300">
                    {CATEGORY_INFO[cat].label}
                  </span>
                  <span className="text-[10px] text-ink-500 ml-2">
                    {CATEGORY_INFO[cat].description}
                  </span>
                </div>
                <span className="text-sm font-bold tabular-nums" style={{ color: gradeColor(catGrade) }}>
                  {catScore}
                  <span className="text-ink-500 ml-1 text-xs">/100</span>
                </span>
              </div>
              <div className="h-1.5 bg-ink-800/60 rounded overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{ width: `${catScore}%`, background: gradeColor(catGrade) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* TOP ISSUES */}
      {summary?.top_issues && summary.top_issues.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
            // top issues — críticos e altos
          </div>
          <ul className="space-y-2">
            {summary.top_issues.map((issue, i) => (
              <li key={i} className="terminal-card p-4">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={SEVERITY_BADGE[issue.severity]}>{issue.severity}</span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-500">
                    {CATEGORY_INFO[issue.category].label}
                  </span>
                  <code className="text-[10px] text-ink-500">{issue.code}</code>
                </div>
                <div className="text-ink-50 font-bold text-sm">{issue.title}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TECH STACK */}
      {tech.length > 0 && (
        <div className="terminal-card p-5">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">// tech detectada</div>
          <div className="flex flex-wrap gap-2">
            {tech.map((t) => (
              <span
                key={t}
                className="text-[11px] font-mono px-2 py-1 border border-ink-700 rounded text-matrix-300 bg-ink-800/40"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA SIGNUP */}
      <div className="terminal-card p-6 border-matrix-500/30 bg-matrix-500/5">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// quer mais?</div>
        <h3 className="text-ink-50 font-bold text-lg mb-2">
          report completo + monitor diário + alerts
        </h3>
        <p className="text-sm text-ink-300/70 mb-4 max-w-2xl">
          Cria conta grátis (≤100 sites) para ver: descrição completa de cada finding, recomendações
          step-by-step de como fixar, scan diário automático, achievements, banner RGPD/LGPD universal,
          e Cloudflare orchestrator.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/auth/signup" className="btn-matrix-solid">
            $ criar conta grátis →
          </Link>
          <Link href="/" className="btn-ghost">
            saber mais
          </Link>
        </div>
      </div>

      {/* SHARE */}
      <ShareRow domain={scan.domain} score={score} grade={grade} />

      {/* META */}
      <div className="text-[10px] text-ink-500 text-center">
        scan: {fmtDate(scan.created_at)}
        {scan.duration_ms ? ` · ${(scan.duration_ms / 1000).toFixed(1)}s` : ""} · próximo refresh em ~24h
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "muted" | "warn" | "danger";
}) {
  const colorClass =
    tone === "danger" ? "text-red-400" : tone === "warn" ? "text-yellow-300" : tone === "muted" ? "text-ink-500" : "text-ink-100";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`text-2xl font-bold ${colorClass} mt-0.5`}>{value}</div>
    </div>
  );
}

function gradeFromScore(score: number): Grade {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}
