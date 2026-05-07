import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CloudflareForm } from "@/components/cloudflare-form";

export const dynamic = "force-dynamic";

export default async function CloudflareSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cfConn } = await supabase
    .from("cloudflare_connections")
    .select("created_at, last_synced_at")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/dashboard/settings"
        className="text-xs text-matrix-700 hover:text-matrix-300 mb-4 inline-block"
      >
        ← settings
      </Link>
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">
        // settings.cloudflare
      </div>
      <h1 className="text-3xl font-bold text-matrix-50 mb-2">cloudflare</h1>
      <p className="text-sm text-matrix-200/70 mb-8 max-w-2xl">
        Conecta a tua conta Cloudflare para que o BlindAI possa auto-configurar SSL strict, HSTS preload,
        Bot Fight Mode, DNSSEC, Min TLS 1.2, Browser Integrity Check e mais nos sites que escolheres.
        Tudo via API, com 1 click por site.
      </p>

      <CloudflareForm connected={!!cfConn} />

      <div className="terminal-card p-5 mt-8 text-xs text-matrix-200/70 space-y-3">
        <div className="text-matrix-500 uppercase tracking-wider text-[10px]">
          // como criar API token cloudflare
        </div>
        <ol className="space-y-2 list-decimal list-inside">
          <li>
            Vai a{" "}
            <a
              href="https://dash.cloudflare.com/profile/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-matrix-300 hover:text-matrix-100 underline"
            >
              Cloudflare → My Profile → API Tokens ↗
            </a>
          </li>
          <li>
            Click <strong className="text-matrix-50">Create Token</strong> → escolhe o template{" "}
            <strong className="text-matrix-50">Edit zone DNS</strong> ou cria custom com permissions:
            <ul className="ml-6 mt-1 list-disc list-inside text-matrix-700 space-y-0.5">
              <li>Zone → Zone → Read</li>
              <li>Zone → Zone Settings → Edit</li>
              <li>Zone → DNS → Edit (para DNSSEC)</li>
              <li>Account → Account Settings → Read</li>
            </ul>
          </li>
          <li>Define <strong className="text-matrix-50">Zone Resources</strong> como &quot;All zones&quot; (ou só os domínios específicos).</li>
          <li>Cria, copia o token e cola acima.</li>
        </ol>
        <p className="text-matrix-700 pt-2 border-t border-matrix-900">
          Token guardado encrypted-at-rest com AES-256-GCM. Nunca volta ao frontend depois de salvado. Podes desconectar a qualquer momento.
        </p>
      </div>
    </main>
  );
}
