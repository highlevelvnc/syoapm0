"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DATA_TYPES, SERVICE_TYPES, type PolicyCountry } from "@/lib/policy/generator";

interface ExistingPolicy {
  country: PolicyCountry;
  operator_name: string;
  contact_email: string;
  contact_address: string | null;
  collected_data: string[];
  services: string[];
  published_at: string | null;
}

export function PolicyWizard({
  siteId,
  existing,
}: {
  siteId: string;
  existing: ExistingPolicy | null;
}) {
  const router = useRouter();
  const [country, setCountry] = useState<PolicyCountry>(existing?.country ?? "PT");
  const [operator, setOperator] = useState(existing?.operator_name ?? "");
  const [email, setEmail] = useState(existing?.contact_email ?? "");
  const [address, setAddress] = useState(existing?.contact_address ?? "");
  const [collectedData, setCollectedData] = useState<string[]>(existing?.collected_data ?? ["email", "ip", "cookies"]);
  const [services, setServices] = useState<string[]>(existing?.services ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleData(id: string) {
    setCollectedData((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleService(id: string) {
    setServices((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/policy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          operator_name: operator,
          contact_email: email,
          contact_address: address || undefined,
          collected_data: collectedData,
          services,
        }),
      });
      const data = (await res.json()) as { error?: string; detail?: string };
      if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="terminal-card p-6 space-y-6">
      <div>
        <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">$ jurisdição</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as PolicyCountry)}
          className="input-matrix"
          disabled={busy}
        >
          <option value="PT">Portugal — RGPD + Lei 58/2019</option>
          <option value="BR">Brasil — LGPD (Lei 13.709/2018)</option>
          <option value="ES">España — RGPD + LOPDGDD</option>
          <option value="FR">France — RGPD + Loi Informatique et Libertés</option>
          <option value="EN">EN — GDPR (UE / UK genérico)</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">$ entidade operadora</label>
          <input
            type="text"
            required
            placeholder="Nome ou razão social"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="input-matrix"
            disabled={busy}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">$ email contacto</label>
          <input
            type="email"
            required
            placeholder="privacy@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-matrix"
            disabled={busy}
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">$ morada (opcional)</label>
        <input
          type="text"
          placeholder="Rua, número, código postal, cidade"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input-matrix"
          disabled={busy}
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-3">
          $ dados recolhidos
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          {DATA_TYPES.map((d) => (
            <label
              key={d.id}
              className={`flex items-start gap-2 px-3 py-2 border rounded cursor-pointer transition-colors text-sm ${
                collectedData.includes(d.id)
                  ? "border-matrix-500/40 bg-matrix-500/5 text-ink-100"
                  : "border-ink-700 text-ink-400 hover:border-ink-600"
              }`}
            >
              <input
                type="checkbox"
                checked={collectedData.includes(d.id)}
                onChange={() => toggleData(d.id)}
                className="mt-0.5 accent-matrix-500"
                disabled={busy}
              />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-3">
          $ serviços de terceiros usados
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          {SERVICE_TYPES.map((s) => (
            <label
              key={s.id}
              className={`flex items-start gap-2 px-3 py-2 border rounded cursor-pointer transition-colors text-sm ${
                services.includes(s.id)
                  ? "border-matrix-500/40 bg-matrix-500/5 text-ink-100"
                  : "border-ink-700 text-ink-400 hover:border-ink-600"
              }`}
            >
              <input
                type="checkbox"
                checked={services.includes(s.id)}
                onChange={() => toggleService(s.id)}
                className="mt-0.5 accent-matrix-500"
                disabled={busy}
              />
              <div className="flex-1">
                <div>{s.label}</div>
                <div className="text-[10px] text-ink-500 uppercase tracking-wider">{s.category}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <button type="submit" disabled={busy} className="btn-matrix-solid w-full disabled:opacity-50">
        {busy ? "$ a gerar..." : existing ? "$ actualizar policy →" : "$ gerar e publicar →"}
      </button>
    </form>
  );
}
