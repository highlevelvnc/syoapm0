import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtNumber } from "@/lib/utils";
import { gradeColor } from "@/lib/scanners/score";
import type { Grade } from "@/lib/scanners";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: sites } = await supabase
    .from("sites")
    .select("id, domain, name, theme_color, created_at")
    .order("created_at", { ascending: false });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: totalConsents } = await supabase
    .from("consents")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);

  const siteIds = (sites ?? []).map((s) => s.id);
  let latestScansMap: Record<string, { id: string; score: number | null; grade: Grade | null; status: string }> = {};
  let openCriticalHigh = 0;

  if (siteIds.length > 0) {
    const { data: latest } = await supabase
      .from("latest_scans")
      .select("id, site_id, score, grade, status")
      .in("site_id", siteIds);

    latestScansMap = (latest ?? []).reduce<typeof latestScansMap>((acc, s) => {
      acc[s.site_id] = {
        id: s.id,
        score: s.score,
        grade: (s.grade ?? null) as Grade | null,
        status: s.status,
      };
      return acc;
    }, {});

    const completedScanIds = (latest ?? [])
      .filter((s) => s.status === "completed")
      .map((s) => s.id);

    if (completedScanIds.length > 0) {
      const { count } = await supabase
        .from("scan_findings")
        .select("id", { count: "exact", head: true })
        .in("scan_id", completedScanIds)
        .in("severity", ["critical", "high"]);
      openCriticalHigh = count ?? 0;
    }
  }

  const scoredSites = Object.values(latestScansMap).filter((s) => s.score !== null);
  const avgScore =
    scoredSites.length > 0
      ? Math.round(scoredSites.reduce((sum, s) => sum + (s.score ?? 0), 0) / scoredSites.length)
      : null;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">
            // dashboard.overview
          </div>
          <h1 className="text-3xl font-bold text-ink-50">os teus sites</h1>
        </div>
        <Link href="/dashboard/sites/new" className="btn-matrix-solid">
          + adicionar site
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Stat label="sites" value={fmtNumber(sites?.length ?? 0)} />
        <Stat
          label="avg score"
          value={avgScore !== null ? `${avgScore}` : "—"}
          hint={avgScore !== null ? `${scoredSites.length} com scan` : "sem scans ainda"}
        />
        <Stat
          label="critical/high"
          value={fmtNumber(openCriticalHigh)}
          hint={openCriticalHigh > 0 ? "requer acção" : "tudo limpo"}
          tone={openCriticalHigh > 0 ? "danger" : "ok"}
        />
        <Stat label="consents (30d)" value={fmtNumber(totalConsents ?? 0)} />
      </div>

      {!sites || sites.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {sites.map((s) => {
            const scan = latestScansMap[s.id];
            return (
              <li key={s.id}>
                <Link
                  href={`/dashboard/sites/${s.id}`}
                  className="terminal-card p-5 flex items-center justify-between hover:border-matrix-500/40 transition-colors group gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span style={{ color: s.theme_color }}>▊</span>
                    <div className="min-w-0">
                      <div className="text-ink-50 font-bold truncate">{s.name}</div>
                      <div className="text-xs text-ink-500 mt-1 truncate">{s.domain}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <ScoreCell scan={scan} />
                    <div className="text-matrix-500 text-sm group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

function ScoreCell({
  scan,
}: {
  scan: { id: string; score: number | null; grade: Grade | null; status: string } | undefined;
}) {
  if (!scan) {
    return <span className="text-[10px] text-ink-500 uppercase tracking-wider">no scan</span>;
  }
  if (scan.status === "running" || scan.status === "pending") {
    return <span className="text-[10px] text-matrix-300 uppercase tracking-wider animate-pulse">scanning</span>;
  }
  if (scan.status === "failed") {
    return <span className="text-[10px] text-red-400 uppercase tracking-wider">failed</span>;
  }
  if (scan.score === null || scan.grade === null) return null;
  return (
    <div className="text-right">
      <div className="text-2xl font-bold tabular-nums leading-none" style={{ color: gradeColor(scan.grade) }}>
        {scan.score}
      </div>
      <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: gradeColor(scan.grade) }}>
        {scan.grade}
      </div>
    </div>
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
    <div className="terminal-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</div>
      {hint && <div className="text-xs text-ink-500 mt-0.5">{hint}</div>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="terminal-card p-12 text-center">
      <div className="text-matrix-500 text-sm mb-3">// nenhum site adicionado</div>
      <h3 className="text-ink-50 font-bold text-lg mb-2">começa agora.</h3>
      <p className="text-ink-300/70 text-sm mb-6 max-w-md mx-auto">
        Adiciona o teu primeiro site e recebe um snippet pronto a colar. Em 30 segundos tens compliance RGPD.
      </p>
      <Link href="/dashboard/sites/new" className="btn-matrix-solid">
        + adicionar primeiro site
      </Link>
    </div>
  );
}
