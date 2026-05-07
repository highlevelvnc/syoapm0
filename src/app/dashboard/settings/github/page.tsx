import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GithubForm } from "@/components/github-form";

export const dynamic = "force-dynamic";

export default async function GithubSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: conn } = await supabase
    .from("github_connections")
    .select("github_user_login, last_synced_at")
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/dashboard/settings"
        className="text-xs text-ink-500 hover:text-matrix-300 mb-4 inline-block"
      >
        ← settings
      </Link>
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// settings.github</div>
      <h1 className="text-3xl font-bold text-ink-50 mb-2">github dependabot</h1>
      <p className="text-sm text-ink-300/70 mb-8 max-w-2xl">
        Conecta GitHub para o BlindAI ler os Dependabot alerts dos repos dos teus sites. Cada CVE em
        dependência aparece como finding na categoria <code className="text-matrix-500">dependencies</code>{" "}
        com severity da advisory + recomendação de patch.
      </p>

      <GithubForm connected={!!conn} login={conn?.github_user_login ?? null} />

      <div className="terminal-card p-5 mt-8 text-xs text-ink-300/70 space-y-3">
        <div className="text-matrix-500 uppercase tracking-wider text-[10px]">
          // como criar personal access token
        </div>
        <ol className="space-y-2 list-decimal list-inside">
          <li>
            <a
              href="https://github.com/settings/tokens?type=beta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-matrix-300 hover:text-ink-100 underline"
            >
              Fine-grained token (recomendado) ↗
            </a>{" "}
            ou{" "}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-matrix-300 hover:text-ink-100 underline"
            >
              classic ↗
            </a>
          </li>
          <li>
            <strong className="text-ink-50">Fine-grained:</strong> escolhe os repos (ou All) →
            permissions:
            <ul className="ml-6 mt-1 list-disc list-inside text-ink-500 space-y-0.5">
              <li>Repository → Contents → Read</li>
              <li>Repository → Dependabot alerts → Read</li>
              <li>Repository → Metadata → Read (default)</li>
            </ul>
          </li>
          <li>
            <strong className="text-ink-50">Classic:</strong> scopes:
            <code className="text-matrix-500"> repo</code> +{" "}
            <code className="text-matrix-500">security_events</code>
          </li>
          <li>Cria, copia e cola acima.</li>
        </ol>
        <p className="pt-2 border-t border-ink-700 mt-2 text-ink-500">
          Dependabot alerts requerem GitHub Advanced Security em repos privados, ou são free em
          public repos.
        </p>
      </div>
    </main>
  );
}
