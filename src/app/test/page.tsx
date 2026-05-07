import Link from "next/link";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/utils";
import { gradeColor } from "@/lib/scanners/score";
import { PublicScanForm } from "@/components/public-scan-form";
import { APP_NAME } from "@/lib/constants";
import type { Grade } from "@/lib/scanners";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Test your site security · BlindAI",
  description:
    "Free public security scan: SSL, headers, DNS (SPF/DMARC/DNSSEC), exposed paths, anti-phishing/typosquatting. Sem signup.",
  openGraph: {
    title: "Test your site security · BlindAI",
    description: "Free public scan, sem signup, em segundos.",
  },
};

export default async function TestIndexPage() {
  const sb = createServiceClient();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: recent } = await sb
    .from("public_scans")
    .select("id, domain, score, grade, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen relative">
      <div className="grid-bg fixed inset-0 -z-10 opacity-50" aria-hidden />

      <nav className="border-b border-ink-700 bg-ink-900/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-ink-50 font-bold tracking-wider">
            <span className="text-matrix-500 text-glow">▊</span>
            <span>{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link href="/auth/login" className="btn-matrix-solid">
              entrar →
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-4">// public scan</div>
        <h1 className="text-4xl sm:text-6xl font-bold text-ink-50 mb-4 tracking-tight">
          testa qualquer site.<br />
          <span className="text-matrix-500 text-glow">grátis</span>, sem signup.
        </h1>
        <p className="text-base sm:text-lg text-ink-300/70 max-w-2xl mx-auto mb-10">
          SSL · Headers · DNS · Exposed paths · Anti-phishing/typosquatting. Em 5-15s recebes a grade
          de segurança e os top issues.
        </p>
        <div className="flex justify-center">
          <PublicScanForm size="lg" />
        </div>
      </section>

      {recent && recent.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-4 text-center">
            // scans recentes (24h)
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {recent.map((s) => {
              const grade = (s.grade ?? "F") as Grade;
              return (
                <Link
                  key={s.id}
                  href={`/test/${encodeURIComponent(s.domain)}`}
                  className="terminal-card p-4 hover:border-matrix-500/40 transition-colors group"
                >
                  <div
                    className="text-3xl font-bold tabular-nums leading-none"
                    style={{ color: gradeColor(grade) }}
                  >
                    {s.score ?? "—"}
                  </div>
                  <div
                    className="text-xs font-bold mt-1"
                    style={{ color: gradeColor(grade) }}
                  >
                    {grade}
                  </div>
                  <div className="text-xs text-ink-300 mt-2 truncate group-hover:text-ink-50">
                    {s.domain}
                  </div>
                  <div className="text-[10px] text-ink-500 mt-0.5">{fmtDate(s.created_at)}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <footer className="border-t border-ink-700 py-10 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-ink-500">
          {APP_NAME} · 100% defensivo · scan público é uma amostra. Cria conta para report completo + monitor diário.
        </div>
      </footer>
    </main>
  );
}
