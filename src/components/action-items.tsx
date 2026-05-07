import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtNumber } from "@/lib/utils";

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
  server_version_exposed: "Versão server exposta",
  powered_by_exposed: "X-Powered-By exposto",
  csp_unsafe: "CSP unsafe-inline/eval",
};

interface CommonIssue {
  code: string;
  title: string;
  count: number;
  severity: string;
}

export async function ActionItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: sites } = await supabase
    .from("sites")
    .select("id, github_open_alerts");
  const siteIds = (sites ?? []).map((s) => s.id);
  if (siteIds.length === 0) return null;

  const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const [latestScansRes, consentsRes] = await Promise.all([
    supabase
      .from("latest_scans")
      .select("id, site_id, status")
      .in("site_id", siteIds),
    supabase.from("consents").select("site_id").in("site_id", siteIds).gte("created_at", since30),
  ]);

  const completedScans = (latestScansRes.data ?? []).filter((s) => s.status === "completed");
  const completedScanIds = completedScans.map((s) => s.id);

  let findings: Array<{ code: string; severity: string; scan_id: string }> = [];
  if (completedScanIds.length > 0) {
    const { data: f } = await supabase
      .from("scan_findings")
      .select("code, severity, scan_id")
      .in("scan_id", completedScanIds);
    findings = f ?? [];
  }

  const byCode: Record<string, { code: string; count: number; severity: string; sites: Set<string> }> = {};
  for (const f of findings) {
    if (f.severity === "info" || f.severity === "low") continue;
    if (!byCode[f.code]) byCode[f.code] = { code: f.code, count: 0, severity: f.severity, sites: new Set() };
    const scan = completedScans.find((s) => s.id === f.scan_id);
    if (scan) {
      byCode[f.code].sites.add(scan.site_id);
    }
  }

  const commonIssues: CommonIssue[] = Object.values(byCode)
    .map((g) => ({
      code: g.code,
      title: FINDING_TITLE[g.code] ?? g.code,
      count: g.sites.size,
      severity: g.severity,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const totalCves = (sites ?? []).reduce((sum, s) => sum + (s.github_open_alerts ?? 0), 0);
  const sitesWithConsents = new Set((consentsRes.data ?? []).map((c) => c.site_id));
  const sitesWithoutRGPD = siteIds.filter((id) => !sitesWithConsents.has(id)).length;

  const sslIssues = findings.filter((f) =>
    ["ssl_expired", "ssl_expiring_soon", "ssl_expiring"].includes(f.code)
  ).length;

  if (
    commonIssues.length === 0 &&
    totalCves === 0 &&
    sitesWithoutRGPD === 0 &&
    sslIssues === 0
  ) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
        // action items · top fixes
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {commonIssues.length > 0 && commonIssues[0] && (
          <ActionCard
            tone={commonIssues[0].severity === "critical" ? "danger" : "warn"}
            count={commonIssues[0].count}
            label={commonIssues[0].title}
            sublabel={`em ${commonIssues[0].count} site${commonIssues[0].count === 1 ? "" : "s"} · ${commonIssues[0].severity}`}
            extra={
              commonIssues.length > 1 ? (
                <div className="text-[10px] text-ink-500 mt-2">
                  + {commonIssues
                    .slice(1)
                    .map((i) => `${i.title} (${i.count})`)
                    .join(", ")}
                </div>
              ) : null
            }
          />
        )}
        {sslIssues > 0 && (
          <ActionCard
            tone="danger"
            count={sslIssues}
            label="SSL prestes a expirar"
            sublabel="renovar urgente"
          />
        )}
        {totalCves > 0 && (
          <ActionCard
            tone="warn"
            count={totalCves}
            label="CVEs em deps"
            sublabel="GitHub Dependabot abertas"
            href="/dashboard/settings/github"
            cta="ver"
          />
        )}
        {sitesWithoutRGPD > 0 && (
          <ActionCard
            tone="warn"
            count={sitesWithoutRGPD}
            label="sites sem banner RGPD"
            sublabel="zero consents nos últimos 30d"
          />
        )}
      </div>
    </section>
  );
}

function ActionCard({
  count,
  label,
  sublabel,
  tone,
  extra,
  href,
  cta,
}: {
  count: number;
  label: string;
  sublabel: string;
  tone: "warn" | "danger";
  extra?: React.ReactNode;
  href?: string;
  cta?: string;
}) {
  const valueColor = tone === "danger" ? "text-red-400" : "text-amber-300";
  return (
    <div className="terminal-card p-4 flex flex-col">
      <div className={`text-3xl font-bold tabular-nums ${valueColor}`}>{fmtNumber(count)}</div>
      <div className="text-ink-50 text-sm font-bold mt-1">{label}</div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider mt-0.5">{sublabel}</div>
      {extra}
      {href && cta && (
        <Link href={href} className="text-[10px] text-matrix-300 hover:text-matrix-100 uppercase tracking-wider mt-3">
          {cta} →
        </Link>
      )}
    </div>
  );
}
