import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cfConn } = await supabase
    .from("cloudflare_connections")
    .select("created_at")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  const { data: emailChannel } = await supabase
    .from("notification_channels")
    .select("id")
    .eq("owner_id", user?.id ?? "")
    .eq("kind", "email")
    .eq("enabled", true)
    .maybeSingle();

  const { data: ghConn } = await supabase
    .from("github_connections")
    .select("github_user_login")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/dashboard" className="text-xs text-ink-500 hover:text-matrix-300 mb-4 inline-block">
        ← dashboard
      </Link>
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// settings</div>
      <h1 className="text-3xl font-bold text-ink-50 mb-8">configurações</h1>

      <div className="space-y-3">
        <Link
          href="/dashboard/settings/cloudflare"
          className="terminal-card p-5 block hover:border-matrix-500/40 transition-colors group"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-ink-50 font-bold">Cloudflare</span>
                {cfConn ? (
                  <span className="badge-ok">connected</span>
                ) : (
                  <span className="badge-muted">not connected</span>
                )}
              </div>
              <div className="text-xs text-ink-300/60">
                Auto-config WAF, SSL strict, HSTS, DNSSEC, Bot Fight Mode em qualquer site na conta CF. Layer 1 do modelo defensivo.
              </div>
            </div>
            <div className="text-matrix-500 text-sm group-hover:translate-x-1 transition-transform">→</div>
          </div>
        </Link>

        <Link
          href="/dashboard/settings/email"
          className="terminal-card p-5 block hover:border-matrix-500/40 transition-colors group"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-ink-50 font-bold">Email alerts</span>
                {emailChannel ? (
                  <span className="badge-ok">connected</span>
                ) : (
                  <span className="badge-muted">not connected</span>
                )}
              </div>
              <div className="text-xs text-ink-300/60">
                Email quando scan encontra critical/high, SSL prestes a expirar, phishing variant novo, achievement unlocked.
              </div>
            </div>
            <div className="text-matrix-500 text-sm group-hover:translate-x-1 transition-transform">→</div>
          </div>
        </Link>

        <Link
          href="/dashboard/settings/github"
          className="terminal-card p-5 block hover:border-matrix-500/40 transition-colors group"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-ink-50 font-bold">GitHub Dependabot</span>
                {ghConn ? (
                  <span className="badge-ok">@{ghConn.github_user_login}</span>
                ) : (
                  <span className="badge-muted">not connected</span>
                )}
              </div>
              <div className="text-xs text-ink-300/60">
                CVEs em dependências dos repos. Scan on-demand fetch Dependabot alerts e adiciona aos findings do site.
              </div>
            </div>
            <div className="text-matrix-500 text-sm group-hover:translate-x-1 transition-transform">→</div>
          </div>
        </Link>

        <div className="terminal-card p-5 opacity-50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-ink-50 font-bold">Telegram alerts</span>
            <span className="badge-muted">soon</span>
          </div>
          <div className="text-xs text-ink-300/60">
            DMs quando algo importante acontece. Mais imediato que email para users que vivem em mobile.
          </div>
        </div>
      </div>
    </main>
  );
}
