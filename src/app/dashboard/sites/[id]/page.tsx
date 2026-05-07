import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_URL } from "@/lib/constants";
import { fmtNumber, fmtDate } from "@/lib/utils";
import { SnippetDisplay } from "@/components/snippet-display";
import { SecurityScore } from "@/components/security-score";
import { CategoryScores } from "@/components/category-scores";
import { AchievementsGrid, type DBAchievement } from "@/components/achievements-grid";
import { FindingsList, type DBFinding } from "@/components/findings-list";
import { ScanNowButton } from "@/components/scan-now-button";
import { CloudflareCard } from "@/components/cloudflare-card";
import { GithubCard } from "@/components/github-card";
import { ACHIEVEMENTS } from "@/lib/scanners/achievements";
import type { Grade } from "@/lib/scanners";

export const dynamic = "force-dynamic";

export default async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: site } = await supabase
    .from("sites")
    .select(
      "id, domain, name, theme_color, lang_default, badge_enabled, created_at, cloudflare_zone_id, cloudflare_zone_name, cloudflare_hardened_at, cloudflare_settings_applied, github_owner, github_repo, github_last_scan_at, github_open_alerts"
    )
    .eq("id", id)
    .maybeSingle();
  if (!site) notFound();

  const [{ data: cfConn }, { data: ghConn }] = await Promise.all([
    supabase.from("cloudflare_connections").select("created_at").maybeSingle(),
    supabase.from("github_connections").select("created_at").maybeSingle(),
  ]);

  const { data: lastScan } = await supabase
    .from("scans")
    .select("id, status, score, grade, category_scores, started_at, completed_at, error")
    .eq("site_id", site.id)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let findings: DBFinding[] = [];
  if (lastScan?.id && lastScan.status === "completed") {
    const { data } = await supabase
      .from("scan_findings")
      .select("id, category, severity, code, title, description, recommendation, evidence")
      .eq("scan_id", lastScan.id);
    findings = (data ?? []) as DBFinding[];
  }

  const { data: achievementsRaw } = await supabase
    .from("achievements")
    .select("id, code, title, description, icon, earned_at")
    .eq("site_id", site.id)
    .order("earned_at", { ascending: false });
  const achievements = (achievementsRaw ?? []) as DBAchievement[];

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: total30d } = await supabase
    .from("consents")
    .select("id", { count: "exact", head: true })
    .eq("site_id", site.id)
    .gte("created_at", since);

  const { data: recent } = await supabase
    .from("consents")
    .select("id, action, lang, necessary, functional, analytics, marketing, created_at")
    .eq("site_id", site.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: actionRows } = await supabase
    .from("consents")
    .select("action")
    .eq("site_id", site.id)
    .gte("created_at", since);

  const actionCounts = (actionRows ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.action] = (acc[r.action] || 0) + 1;
    return acc;
  }, {});
  const total = total30d ?? 0;
  const acceptRate = total > 0 ? Math.round(((actionCounts.accept_all ?? 0) / total) * 100) : 0;

  const score = lastScan?.score ?? null;
  const grade = (lastScan?.grade ?? null) as Grade | null;
  const status = (lastScan?.status ?? null) as "completed" | "running" | "failed" | "pending" | null;
  const categoryScores = (lastScan?.category_scores as Record<string, number> | null) ?? null;
  const criticalHigh = findings.filter((f) => f.severity === "critical" || f.severity === "high").length;
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/dashboard" className="text-xs text-ink-500 hover:text-matrix-300 mb-4 inline-block">
        ← dashboard
      </Link>
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// site.detail</div>
      <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
        <h1 className="text-3xl font-bold text-ink-50">{site.name}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <ScanNowButton siteId={site.id} />
          <Link href={`/dashboard/sites/${site.id}/policy`} className="btn-matrix">
            privacy policy
          </Link>
          <a
            href={`/preview/${site.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-matrix"
          >
            preview banner ↗
          </a>
          <span className="badge-ok">live</span>
        </div>
      </div>
      <div className="text-sm text-ink-500 mb-8">{site.domain}</div>

      {/* SECURITY */}
      <section className="mb-10">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">// security</div>
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <SecurityScore score={score} grade={grade} status={status} />
          <CategoryScores scores={categoryScores} />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <CloudflareCard
            siteId={site.id}
            domain={site.domain}
            cloudflareConnected={!!cfConn}
            cloudflareZoneId={site.cloudflare_zone_id}
            cloudflareZoneName={site.cloudflare_zone_name}
            cloudflareHardenedAt={site.cloudflare_hardened_at}
            cloudflareSettingsApplied={site.cloudflare_settings_applied as never}
          />
          <GithubCard
            siteId={site.id}
            githubConnected={!!ghConn}
            githubOwner={site.github_owner}
            githubRepo={site.github_repo}
            githubLastScanAt={site.github_last_scan_at}
            githubOpenAlerts={site.github_open_alerts ?? 0}
          />
        </div>
        {lastScan?.completed_at && (
          <div className="text-[10px] text-ink-500">
            último scan: {fmtDate(lastScan.completed_at)} · {findings.length} findings · {criticalHigh} críticos/altos
          </div>
        )}
        {lastScan?.status === "failed" && (
          <div className="text-xs text-red-400 mt-2 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded">
            scan falhou: {lastScan.error || "erro desconhecido"}
          </div>
        )}
      </section>

      {/* ACHIEVEMENTS */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-matrix-500">// achievements</div>
          <div className="text-[10px] text-ink-500">
            {achievements.length} / {totalAchievements} unlocked
          </div>
        </div>
        <AchievementsGrid earned={achievements} />
      </section>

      {/* FINDINGS */}
      {lastScan?.status === "completed" && (
        <section className="mb-10">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">// findings</div>
          <FindingsList findings={findings} />
        </section>
      )}

      {/* COMPLIANCE · SNIPPET + CONSENTS */}
      <section className="grid lg:grid-cols-2 gap-6 mb-10">
        <div>
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
            // compliance · snippet
          </div>
          <SnippetDisplay siteId={site.id} apiBase={APP_URL} langDefault={site.lang_default} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
            // consents (30d)
          </div>
          <div className="terminal-card p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <Stat label="total" value={fmtNumber(total)} />
              <Stat label="accept rate" value={`${acceptRate}%`} />
            </div>
            <BreakdownRow label="accept_all" count={actionCounts.accept_all ?? 0} total={total} />
            <BreakdownRow label="reject_all" count={actionCounts.reject_all ?? 0} total={total} />
            <BreakdownRow label="custom" count={actionCounts.custom ?? 0} total={total} />
          </div>
        </div>
      </section>

      {/* CONSENT LOG */}
      <section>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">// consent log recente</div>
        <div className="terminal-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-ink-500 border-b border-ink-700">
              <tr>
                <th className="text-left p-3">timestamp</th>
                <th className="text-left p-3">action</th>
                <th className="text-left p-3">lang</th>
                <th className="text-left p-3">choices</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {recent && recent.length > 0 ? (
                recent.map((r) => (
                  <tr key={r.id} className="border-b border-ink-700/40 hover:bg-matrix-500/5">
                    <td className="p-3 text-ink-300 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                    <td className="p-3">
                      <span className={actionBadge(r.action)}>{r.action}</span>
                    </td>
                    <td className="p-3 text-ink-500">{r.lang}</td>
                    <td className="p-3 text-ink-300/70">
                      {[
                        r.necessary && "necessary",
                        r.functional && "functional",
                        r.analytics && "analytics",
                        r.marketing && "marketing",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-ink-500">
                    sem consents ainda. cola o snippet num site para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function actionBadge(action: string) {
  if (action === "accept_all") return "badge-ok";
  if (action === "reject_all") return "badge-warn";
  return "badge-muted";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-ink-100">{value}</div>
    </div>
  );
}

function BreakdownRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-1">
        <span className="text-ink-300/70 font-mono">{label}</span>
        <span className="text-ink-100 font-bold">
          {fmtNumber(count)} <span className="text-ink-500">· {pct}%</span>
        </span>
      </div>
      <div className="h-1 bg-ink-800/60 rounded overflow-hidden">
        <div className="h-full bg-matrix-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
