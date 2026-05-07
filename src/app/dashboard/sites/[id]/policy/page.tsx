import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_URL } from "@/lib/constants";
import { fmtDate } from "@/lib/utils";
import { PolicyWizard } from "@/components/policy-wizard";
import type { PolicyCountry } from "@/lib/policy/generator";

export const dynamic = "force-dynamic";

export default async function SitePolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, domain")
    .eq("id", id)
    .maybeSingle();
  if (!site) notFound();

  const { data: policy } = await supabase
    .from("policies")
    .select("country, operator_name, contact_email, contact_address, collected_data, services, published_at, version")
    .eq("site_id", site.id)
    .maybeSingle();

  const publicUrl = `${APP_URL}/p/${site.id}`;
  const existing = policy
    ? {
        country: policy.country as PolicyCountry,
        operator_name: policy.operator_name,
        contact_email: policy.contact_email,
        contact_address: policy.contact_address,
        collected_data: (policy.collected_data as string[]) ?? [],
        services: (policy.services as string[]) ?? [],
        published_at: policy.published_at,
      }
    : null;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link
        href={`/dashboard/sites/${site.id}`}
        className="text-xs text-ink-500 hover:text-ink-300 mb-4 inline-block"
      >
        ← {site.name}
      </Link>
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// site.privacy_policy</div>
      <h1 className="text-3xl font-bold text-ink-50 mb-2">privacy policy</h1>
      <p className="text-sm text-ink-400 mb-8 max-w-2xl">
        Gera uma política de privacidade RGPD/LGPD-compliant para <strong className="text-ink-200">{site.domain}</strong>{" "}
        em segundos. Publicada em URL único, podes linkar do footer do site:
      </p>

      {existing && (
        <div className="terminal-card p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-ok">published</span>
              <span className="text-xs text-ink-500">{existing.country}</span>
              {existing.published_at && (
                <span className="text-[10px] text-ink-500">{fmtDate(existing.published_at)}</span>
              )}
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-matrix-300 hover:text-ink-300 font-mono break-all"
            >
              {publicUrl} ↗
            </a>
          </div>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-matrix">
            ver policy ↗
          </a>
        </div>
      )}

      <PolicyWizard siteId={site.id} existing={existing} />

      <div className="terminal-card p-5 mt-8 text-xs text-ink-400 space-y-3">
        <div className="text-matrix-500 uppercase tracking-wider text-[10px]">// como linkar no teu site</div>
        <p>Adiciona um link discreto no footer do site:</p>
        <pre className="bg-ink-950 border border-ink-700 rounded p-3 text-ink-200 overflow-x-auto">
{`<a href="${publicUrl}" target="_blank" rel="noopener">
  Política de Privacidade
</a>`}
        </pre>
        <p className="pt-2 border-t border-ink-700 mt-2 text-ink-500">
          O HTML da policy é gerado server-side e cached 5 min. Quando actualizares o form, o HTML
          regenera automaticamente. Disclaimer: gerado automaticamente — recomendado revisão por
          jurista para casos sensíveis (saúde, financeiro, menores).
        </p>
      </div>
    </main>
  );
}
