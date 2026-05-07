import type { Finding, Severity, Category } from "@/lib/scanners";

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: "badge-err",
  high: "badge-err",
  medium: "badge-warn",
  low: "badge-muted",
  info: "badge-muted",
};

const CATEGORY_LABEL: Record<Category, string> = {
  ssl: "SSL/TLS",
  headers: "Headers",
  dns: "DNS",
  exposure: "Exposure",
  phishing: "Phishing",
  dependencies: "Deps",
  tech: "Tech",
  general: "General",
};

export interface DBFinding {
  id: string;
  category: Category;
  severity: Severity;
  code: string;
  title: string;
  description: string | null;
  recommendation: string | null;
  evidence: unknown;
}

export function FindingsList({ findings }: { findings: DBFinding[] }) {
  if (findings.length === 0) {
    return (
      <div className="terminal-card p-8 text-center">
        <div className="text-matrix-500 text-xs uppercase tracking-wider mb-2">// zero issues</div>
        <div className="text-ink-50 font-bold text-lg mb-1">tudo limpo.</div>
        <p className="text-ink-300/60 text-sm">Nenhuma vulnerabilidade detectada no último scan.</p>
      </div>
    );
  }

  const order: Severity[] = ["critical", "high", "medium", "low", "info"];

  return (
    <div className="space-y-5">
      {order.map((sev) => {
        const group = findings.filter((f) => f.severity === sev);
        if (group.length === 0) return null;
        return (
          <div key={sev}>
            <div className="text-[10px] uppercase tracking-wider text-matrix-500 mb-2 flex items-baseline gap-2">
              <span>// {sev}</span>
              <span className="text-ink-500">[{group.length}]</span>
            </div>
            <ul className="space-y-2">
              {group.map((f) => (
                <li key={f.id} className="terminal-card p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={SEVERITY_BADGE[f.severity]}>{f.severity}</span>
                    <span className="text-[10px] uppercase tracking-wider text-ink-500">
                      {CATEGORY_LABEL[f.category]}
                    </span>
                    <code className="text-[10px] text-ink-500">{f.code}</code>
                  </div>
                  <div className="text-ink-50 font-bold text-sm">{f.title}</div>
                  {f.description && (
                    <div className="text-xs text-ink-300/60 mt-1 leading-relaxed">{f.description}</div>
                  )}
                  {f.recommendation && (
                    <div className="text-xs text-matrix-300 mt-2 border-l-2 border-matrix-500/40 pl-3">
                      <span className="text-matrix-500">→</span> {f.recommendation}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
