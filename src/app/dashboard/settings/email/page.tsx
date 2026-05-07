import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmailForm } from "@/components/email-form";

export const dynamic = "force-dynamic";

export default async function EmailSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: channel } = await supabase
    .from("notification_channels")
    .select("config")
    .eq("owner_id", user?.id ?? "")
    .eq("kind", "email")
    .eq("enabled", true)
    .maybeSingle();

  const currentEmail = (channel?.config as { email?: string } | null)?.email ?? null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/dashboard/settings" className="text-xs text-ink-500 hover:text-matrix-300 mb-4 inline-block">
        ← settings
      </Link>
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// settings.email</div>
      <h1 className="text-3xl font-bold text-ink-50 mb-2">email alerts</h1>
      <p className="text-sm text-ink-300/70 mb-8 max-w-2xl">
        Recebe email automático quando: scan encontra critical/high findings, novo phishing variant detectado,
        achievement desbloqueado, SSL prestes a expirar.
      </p>

      <EmailForm connected={!!channel} currentEmail={currentEmail} />

      <div className="terminal-card p-5 mt-8 text-xs text-ink-300/70 space-y-2">
        <div className="text-matrix-500 uppercase tracking-wider text-[10px] mb-2">// setup técnico</div>
        <p>
          Os emails são enviados via{" "}
          <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-matrix-300 hover:text-ink-100 underline">
            Resend
          </a>{" "}
          (free tier, 3000/mês). Para activar a entrega real:
        </p>
        <ol className="space-y-1 list-decimal list-inside text-ink-500">
          <li>
            Cria conta em{" "}
            <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-matrix-300 hover:text-ink-100 underline">
              resend.com
            </a>{" "}
            e copia API key
          </li>
          <li>
            Adiciona env var no Vercel: <code className="text-matrix-300">RESEND_API_KEY=re_xxxxx</code>
          </li>
          <li>Redeploy</li>
        </ol>
        <p className="pt-2 border-t border-ink-700 mt-2 text-ink-500">
          Sem domínio próprio, o sender é <code>onboarding@resend.dev</code>. Para usar
          <code> alerts@blindai.app</code> ou similar, verifica o domínio no Resend.
        </p>
      </div>
    </main>
  );
}
