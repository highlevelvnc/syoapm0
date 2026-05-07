import { gradeColor, gradeFromScore } from "@/lib/scanners/score";
import type { Category } from "@/lib/scanners";

const CATEGORY_INFO: Record<Category, { label: string; description: string }> = {
  ssl:          { label: "SSL/TLS",      description: "certificado, protocolo, expiry" },
  headers:      { label: "Headers",      description: "HSTS, CSP, X-Frame, etc." },
  dns:          { label: "DNS",          description: "SPF, DMARC, CAA, DNSSEC" },
  exposure:     { label: "Exposure",     description: ".env, .git, admin paths" },
  phishing:     { label: "Phishing",     description: "typosquatting, dominios similares" },
  dependencies: { label: "Dependencies", description: "CVEs em pacotes (Dependabot)" },
  tech:         { label: "Tech",         description: "stack detectada" },
  general:      { label: "General",      description: "geral" },
};

export function CategoryScores({ scores }: { scores: Record<string, number> | null }) {
  const visible: Category[] = ["ssl", "headers", "dns", "exposure", "phishing"];
  if (!scores) {
    return (
      <div className="terminal-card p-5">
        <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-3">// breakdown por categoria</div>
        <div className="text-sm text-ink-500">corre o primeiro scan para ver categorias.</div>
      </div>
    );
  }

  return (
    <div className="terminal-card p-5 space-y-4">
      <div className="text-[10px] uppercase tracking-wider text-matrix-500">// breakdown</div>
      {visible.map((cat) => {
        const score = scores[cat] ?? 100;
        const grade = gradeFromScore(score);
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
              <span className="text-sm font-bold tabular-nums" style={{ color: gradeColor(grade) }}>
                {score}
                <span className="text-ink-500 ml-1 text-xs">/100</span>
              </span>
            </div>
            <div className="h-1.5 bg-ink-800/60 rounded overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${score}%`, background: gradeColor(grade) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
