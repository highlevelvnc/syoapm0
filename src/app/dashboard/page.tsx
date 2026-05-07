import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtNumber } from "@/lib/utils";
import { SitesTable, type SiteRow } from "@/components/sites-table";
import { ScanAllButton } from "@/components/scan-all-button";
import { ActionItems } from "@/components/action-items";
import type { Grade } from "@/lib/scanners";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: sitesRaw } = await supabase
    .from("sites")
    .select(
      "id, domain, name, theme_color, created_at, cloudflare_hardened_at, github_repo, github_open_alerts"
    )
    .order("created_at", { ascending: false });

  const sites = sitesRaw ?? [];
  const siteIds = sites.map((s) => s.id);

  const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const [latestScansRes, consentsByRes, criticalHighRes, totalConsentsRes] = await Promise.all([
    siteIds.length > 0
      ? supabase
          .from("latest_scans")
          .select("id, site_id, score, grade, status, started_at")
          .in("site_id", siteIds)
      : Promise.resolve({ data: [] }),
    siteIds.length > 0
      ? supabase
          .from("consents")
          .select("site_id")
          .in("site_id", siteIds)
          .gte("created_at", since30)
      : Promise.resolve({ data: [] }),
    Promise.resolve({ data: [] as { scan_id: string; severity: string }[] }),
    supabase.from("consents").select("id", { count: "exact", head: true }).gte("created_at", since30),
  ]);

  const latestScans = (latestScansRes.data as Array<{
    id: string;
    site_id: string;
    score: number | null;
    grade: string | null;
    status: string;
    started_at: string;
  }>) ?? [];

  const completedScanIds = latestScans.filter((s) => s.status === "completed").map((s) => s.id);
  let findingsBySite: Record<string, number> = {};
  if (completedScanIds.length > 0) {
    const { data: findings } = await supabase
      .from("scan_findings")
      .select("scan_id")
      .in("scan_id", completedScanIds)
      .in("severity", ["critical", "high"]);
    findingsBySite = (findings ?? []).reduce<Record<string, number>>((acc, f) => {
      const scan = latestScans.find((s) => s.id === f.scan_id);
      if (scan) acc[scan.site_id] = (acc[scan.site_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  const consentsBySite = (consentsByRes.data ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.site_id] = (acc[c.site_id] ?? 0) + 1;
    return acc;
  }, {});

  const rows: SiteRow[] = sites.map((s) => {
    const scan = latestScans.find((ls) => ls.site_id === s.id);
    return {
      id: s.id,
      domain: s.domain,
      name: s.name,
      theme_color: s.theme_color,
      created_at: s.created_at,
      score: scan?.score ?? null,
      grade: (scan?.grade ?? null) as Grade | null,
      status: scan?.status ?? null,
      scan_at: scan?.started_at ?? null,
      consents_30d: consentsBySite[s.id] ?? 0,
      cf_hardened: !!s.cloudflare_hardened_at,
      github_repo: s.github_repo,
      github_alerts: s.github_open_alerts ?? 0,
      critical_high: findingsBySite[s.id] ?? 0,
    };
  });

  const scoredSites = rows.filter((r) => r.score !== null);
  const avgScore =
    scoredSites.length > 0
      ? Math.round(scoredSites.reduce((sum, r) => sum + (r.score ?? 0), 0) / scoredSites.length)
      : null;
  const totalCriticalHigh = rows.reduce((sum, r) => sum + r.critical_high, 0);
  const totalConsents = totalConsentsRes.count ?? 0;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">
            // dashboard.all_sites
          </div>
          <h1 className="text-3xl font-bold text-ink-50">os teus sites</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ScanAllButton totalSites={rows.length} />
          <Link href="/dashboard/sites/bulk" className="btn-matrix">
            $ bulk add
          </Link>
          <Link href="/dashboard/sites/new" className="btn-matrix-solid">
            + adicionar site
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 mb-8">
        <Stat label="sites" value={fmtNumber(rows.length)} />
        <Stat
          label="avg score"
          value={avgScore !== null ? `${avgScore}` : "—"}
          hint={avgScore !== null ? `${scoredSites.length}/${rows.length} com scan` : "sem scans"}
        />
        <Stat
          label="critical/high"
          value={fmtNumber(totalCriticalHigh)}
          tone={totalCriticalHigh > 0 ? "danger" : "ok"}
          hint={totalCriticalHigh > 0 ? "requer acção" : "tudo limpo"}
        />
        <Stat label="consents (30d)" value={fmtNumber(totalConsents)} />
      </div>

      <ActionItems />

      <SitesTable rows={rows} />
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "ok" | "danger";
}) {
  const valueClass =
    tone === "danger" ? "text-red-400" : tone === "ok" ? "text-matrix-300" : "text-ink-100";
  return (
    <div className="terminal-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</div>
      {hint && <div className="text-[10px] text-ink-500 mt-0.5">{hint}</div>}
    </div>
  );
}
