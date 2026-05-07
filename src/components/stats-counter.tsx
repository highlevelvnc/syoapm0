import { createServiceClient } from "@/lib/supabase/server";
import { fmtNumber } from "@/lib/utils";

export async function StatsCounter() {
  const sb = createServiceClient();
  const [{ count: sitesCount }, { count: consentsCount }, { count: scansCount }] = await Promise.all([
    sb.from("sites").select("id", { count: "exact", head: true }),
    sb.from("consents").select("id", { count: "exact", head: true }),
    sb.from("public_scans").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
      <Cell label="sites monitorados" value={sitesCount ?? 0} />
      <Cell label="consents registados" value={consentsCount ?? 0} />
      <Cell label="public scans" value={scansCount ?? 0} />
    </div>
  );
}

function Cell({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-matrix-500 text-glow tabular-nums">
        {fmtNumber(value)}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-matrix-700 mt-1">{label}</div>
    </div>
  );
}
