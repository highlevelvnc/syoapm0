import { createServiceClient } from "@/lib/supabase/server";
import { fmtNumber } from "@/lib/utils";

const FREE_TIER_BYTES = 500 * 1024 * 1024; // 500 MB

interface SizeRow {
  table_name: string;
  row_count: number;
  est_bytes: number;
}

export async function DbHealth() {
  const sb = createServiceClient();
  const { data } = await sb.rpc("db_size_estimate");
  const rows = (data as SizeRow[]) ?? [];

  const totalBytes = rows.reduce((sum, r) => sum + Number(r.est_bytes ?? 0), 0);
  const totalRows = rows.reduce((sum, r) => sum + Number(r.row_count ?? 0), 0);
  const pct = (totalBytes / FREE_TIER_BYTES) * 100;
  const tone = pct > 70 ? "danger" : pct > 40 ? "warn" : "ok";
  const toneColor =
    tone === "danger" ? "#ef4444" : tone === "warn" ? "#f59e0b" : "#10b981";

  function mb(b: number): string {
    return (b / 1024 / 1024).toFixed(2) + " MB";
  }

  return (
    <div className="terminal-card p-5">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-matrix-500">// db.health · supabase free tier</div>
        <div className="text-[10px] text-ink-500 uppercase tracking-wider">cleanup cron · 04:30 UTC daily</div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-500">total rows</div>
          <div className="text-2xl font-bold text-ink-100 tabular-nums mt-0.5">{fmtNumber(totalRows)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-500">est. usage</div>
          <div className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: toneColor }}>
            {mb(totalBytes)}
          </div>
          <div className="text-[10px] text-ink-500">de 500 MB free tier</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-500">capacity</div>
          <div className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: toneColor }}>
            {pct.toFixed(1)}%
          </div>
          <div className="h-1 bg-ink-700 rounded overflow-hidden mt-1">
            <div
              className="h-full transition-all"
              style={{ width: `${Math.min(pct, 100)}%`, background: toneColor }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {rows
          .filter((r) => r.row_count > 0)
          .sort((a, b) => Number(b.est_bytes) - Number(a.est_bytes))
          .map((r) => (
            <div key={r.table_name} className="flex items-baseline justify-between text-xs">
              <span className="text-ink-300 font-mono">{r.table_name}</span>
              <span className="text-ink-500 tabular-nums">
                {fmtNumber(Number(r.row_count))} rows · {mb(Number(r.est_bytes))}
              </span>
            </div>
          ))}
      </div>

      <div className="text-[10px] text-ink-500 mt-4 pt-3 border-t border-ink-700">
        retenção automática: scan_findings &gt;90d, public_scans &gt;30d, consents &gt;12m anonymized (RGPD-compliant). Mantém pelo menos 5 scans recentes por site para history chart.
      </div>
    </div>
  );
}
