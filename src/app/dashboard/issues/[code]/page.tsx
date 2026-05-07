import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/utils";
import { gradeColor } from "@/lib/scanners/score";
import type { Grade, Severity, Category } from "@/lib/scanners";

export const dynamic = "force-dynamic";

const FINDING_TITLE: Record<string, string> = {
  csp_missing: "CSP em falta",
  hsts_missing: "HSTS em falta",
  hsts_short: "HSTS max-age curto",
  spf_missing: "SPF em falta",
  dmarc_missing: "DMARC em falta",
  dmarc_p_none: "DMARC policy=none",
  dnssec_disabled: "DNSSEC desactivado",
  caa_missing: "CAA em falta",
  xfo_missing: "X-Frame-Options em falta",
  xcto_missing: "X-Content-Type-Options em falta",
  referrer_missing: "Referrer-Policy em falta",
  permissions_missing: "Permissions-Policy em falta",
  no_https: "Sem HTTPS",
  ssl_expired: "SSL expirado",
  ssl_expiring_soon: "SSL expira <14d",
  ssl_expiring: "SSL expira <30d",
  ssl_unreachable: "SSL inacessível",
  env_exposed: ".env público",
  git_exposed: "Pasta .git pública",
  server_version_exposed: "Versão do servidor exposta",
  powered_by_exposed: "X-Powered-By exposto",
  csp_unsafe: "CSP unsafe-inline/eval",
  typosquat_active: "Typosquat domain registado",
};

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: "badge-err",
  high: "badge-err",
  medium: "badge-warn",
  low: "badge-muted",
  info: "badge-muted",
};

interface SiteWithFinding {
  site_id: string;
  site_name: string;
  site_domain: string;
  scan_id: string;
  scan_started_at: string;
  score: number | null;
  grade: Grade | null;
  finding_id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string | null;
  recommendation: string | null;
  evidence: unknown;
}

export default async function IssueDrillDownPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!code || !/^[a-z0-9_-]+$/.test(code)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, domain")
    .eq("owner_id", user.id);
  const siteIds = (sites ?? []).map((s) => s.id);
  if (siteIds.length === 0) notFound();

  const { data: latestScans } = await supabase
    .from("latest_scans")
    .select("id, site_id, score, grade, started_at, status")
    .in("site_id", siteIds);
  const completedScans = (latestScans ?? []).filter((s) => s.status === "completed");

  const { data: findings } = await supabase
    .from("scan_findings")
    .select("id, scan_id, category, severity, title, description, recommendation, evidence")
    .eq("code", code)
    .in("scan_id", completedScans.map((s) => s.id));

  const matched: SiteWithFinding[] = (findings ?? []).flatMap((f) => {
    const scan = completedScans.find((s) => s.id === f.scan_id);
    if (!scan) return [];
    const site = sites?.find((s) => s.id === scan.site_id);
    if (!site) return [];
    return [{
      site_id: site.id,
      site_name: site.name,
      site_domain: site.domain,
      scan_id: scan.id,
      scan_started_at: scan.started_at,
      score: scan.score ?? null,
      grade: (scan.grade ?? null) as Grade | null,
      finding_id: f.id,
      category: f.category as Category,
      severity: f.severity as Severity,
      title: f.title,
      description: f.description as string | null,
      recommendation: f.recommendation as string | null,
      evidence: f.evidence,
    }];
  });

  if (matched.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="text-xs text-ink-500 hover:text-ink-300 mb-4 inline-block">
          ← dashboard
        </Link>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// issues.{code}</div>
        <h1 className="text-3xl font-bold text-ink-50 mb-2">
          {FINDING_TITLE[code] ?? code}
        </h1>
        <div className="terminal-card p-8 mt-6 text-center text-sm text-ink-500">
          nenhum site tem este finding actualmente. tudo limpo.
        </div>
      </main>
    );
  }

  // Pick first finding's recommendation/description as the canonical one
  const canonical = matched[0];
  const totalSites = sites?.length ?? 0;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/dashboard" className="text-xs text-ink-500 hover:text-ink-300 mb-4 inline-block">
        ← dashboard
      </Link>
      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-matrix-500">// issues</div>
        <code className="text-[10px] text-ink-500">{code}</code>
        <span className={SEVERITY_BADGE[canonical.severity]}>{canonical.severity}</span>
      </div>
      <h1 className="text-3xl font-bold text-ink-50 mb-2">
        {FINDING_TITLE[code] ?? canonical.title}
      </h1>
      <p className="text-sm text-ink-400 mb-8 max-w-3xl">
        Este finding aparece em <strong className="text-red-400">{matched.length}</strong> dos{" "}
        <strong className="text-ink-100">{totalSites}</strong> sites que monitorizas. Resolver em batch
        impacta o score médio em ~{Math.round((100 / totalSites) * matched.length / 2)} pontos.
      </p>

      {/* RECOMMENDATION */}
      {canonical.recommendation && (
        <div className="terminal-card p-5 mb-8 border-matrix-500/30 bg-matrix-500/5">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">
            // recomendação · aplica em todos
          </div>
          <p className="text-sm text-ink-200 leading-relaxed">{canonical.recommendation}</p>
          {canonical.description && (
            <p className="text-xs text-ink-400 mt-3 leading-relaxed">{canonical.description}</p>
          )}
        </div>
      )}

      {/* AFFECTED SITES */}
      <div>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
          // sites afectados ({matched.length})
        </div>
        <div className="terminal-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-ink-500 border-b border-ink-700">
              <tr>
                <th className="p-3 text-left">site</th>
                <th className="p-3 text-right">score actual</th>
                <th className="p-3 text-left">último scan</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {matched.map((m) => (
                <tr key={m.finding_id} className="border-b border-ink-700/40 hover:bg-ink-800/40">
                  <td className="p-3">
                    <Link
                      href={`/dashboard/sites/${m.site_id}`}
                      className="text-ink-50 font-bold hover:text-matrix-300"
                    >
                      {m.site_name}
                    </Link>
                    <div className="text-[10px] text-ink-500 mt-0.5">{m.site_domain}</div>
                  </td>
                  <td className="p-3 text-right">
                    {m.score != null && m.grade ? (
                      <span className="font-bold tabular-nums" style={{ color: gradeColor(m.grade) }}>
                        {m.score} <span className="text-[10px]">{m.grade}</span>
                      </span>
                    ) : (
                      <span className="text-ink-600">—</span>
                    )}
                  </td>
                  <td className="p-3 text-ink-300 whitespace-nowrap">{fmtDate(m.scan_started_at)}</td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/dashboard/sites/${m.site_id}`}
                      className="text-matrix-500 hover:text-matrix-300"
                    >
                      ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="terminal-card p-5 mt-8 text-xs text-ink-400">
        <div className="text-matrix-500 uppercase tracking-wider text-[10px] mb-2">
          // workflow batch fix
        </div>
        <ol className="space-y-1.5 list-decimal list-inside">
          <li>Aplica a recomendação acima nos {matched.length} sites afectados</li>
          <li>Volta ao dashboard e clica <strong className="text-matrix-300">$ scan all</strong></li>
          <li>Espera ~10-30s; este finding desaparece dos sites onde o fix foi efectivo</li>
          <li>Repete para os próximos issues comuns no Action Items</li>
        </ol>
      </div>
    </main>
  );
}
