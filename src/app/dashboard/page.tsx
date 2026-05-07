import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtNumber } from "@/lib/utils";

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

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">
            // dashboard.overview
          </div>
          <h1 className="text-3xl font-bold text-matrix-50">os teus sites</h1>
        </div>
        <Link href="/dashboard/sites/new" className="btn-matrix-solid">
          + adicionar site
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="sites totais" value={fmtNumber(sites?.length ?? 0)} />
        <Stat label="consents (30d)" value={fmtNumber(totalConsents ?? 0)} />
        <Stat label="security score" value="—" hint="sprint 3" />
      </div>

      {!sites || sites.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {sites.map((s) => (
            <li key={s.id}>
              <Link
                href={`/dashboard/sites/${s.id}`}
                className="terminal-card p-5 flex items-center justify-between hover:border-matrix-500/40 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-matrix-500" style={{ color: s.theme_color }}>▊</span>
                  <div className="min-w-0">
                    <div className="text-matrix-50 font-bold truncate">{s.name}</div>
                    <div className="text-xs text-matrix-700 mt-1 truncate">{s.domain}</div>
                  </div>
                </div>
                <div className="text-matrix-500 text-sm group-hover:translate-x-1 transition-transform">→</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="terminal-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-matrix-700">{label}</div>
      <div className="mt-1 text-2xl font-bold text-matrix-100">{value}</div>
      {hint && <div className="text-xs text-matrix-700 mt-0.5">{hint}</div>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="terminal-card p-12 text-center">
      <div className="text-matrix-500 text-sm mb-3">// nenhum site adicionado</div>
      <h3 className="text-matrix-50 font-bold text-lg mb-2">começa agora.</h3>
      <p className="text-matrix-200/70 text-sm mb-6 max-w-md mx-auto">
        Adiciona o teu primeiro site e recebe um snippet pronto a colar. Em 30 segundos tens compliance RGPD.
      </p>
      <Link href="/dashboard/sites/new" className="btn-matrix-solid">
        + adicionar primeiro site
      </Link>
    </div>
  );
}
