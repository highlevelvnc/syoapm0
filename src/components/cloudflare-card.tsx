"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Zone {
  id: string;
  name: string;
  status: string;
  paused: boolean;
}

interface Step {
  setting: string;
  description: string;
  status: "success" | "failed" | "skipped";
  error?: string;
}

export interface CloudflareCardProps {
  siteId: string;
  domain: string;
  cloudflareConnected: boolean;
  cloudflareZoneId: string | null;
  cloudflareZoneName: string | null;
  cloudflareHardenedAt: string | null;
  cloudflareSettingsApplied: Step[] | null;
}

export function CloudflareCard(props: CloudflareCardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [hardenSteps, setHardenSteps] = useState<Step[] | null>(null);

  useEffect(() => {
    if (props.cloudflareConnected && !props.cloudflareZoneId) {
      (async () => {
        try {
          const res = await fetch("/api/cloudflare/zones");
          const data = (await res.json()) as { zones?: Zone[] };
          if (res.ok && data.zones) {
            setZones(data.zones);
            const match = data.zones.find((z) => z.name === props.domain);
            if (match) setSelectedZone(match.id);
          }
        } catch {
          /* ignore */
        }
      })();
    }
  }, [props.cloudflareConnected, props.cloudflareZoneId, props.domain]);

  async function handleLink() {
    if (!selectedZone || !zones) return;
    const z = zones.find((z) => z.id === selectedZone);
    if (!z) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${props.siteId}/cloudflare/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone_id: z.id, zone_name: z.name }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleHarden() {
    setBusy(true);
    setError(null);
    setHardenSteps(null);
    try {
      const res = await fetch(`/api/sites/${props.siteId}/cloudflare/harden`, { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        steps?: Step[];
        success_count?: number;
      };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setHardenSteps(data.steps ?? null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlink() {
    if (!confirm("Desligar zona? Settings já aplicadas no Cloudflare não revertem automaticamente.")) return;
    setBusy(true);
    try {
      await fetch(`/api/sites/${props.siteId}/cloudflare/link`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!props.cloudflareConnected) {
    return (
      <div className="terminal-card p-5">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// cloudflare</div>
        <div className="text-matrix-50 font-bold mb-1">não conectado</div>
        <p className="text-xs text-matrix-200/60 mb-3">
          Conecta a conta Cloudflare para auto-config SSL strict, HSTS, Bot Fight, DNSSEC.
        </p>
        <Link href="/dashboard/settings/cloudflare" className="btn-matrix">
          conectar cloudflare ↗
        </Link>
      </div>
    );
  }

  if (!props.cloudflareZoneId) {
    const matched = zones?.find((z) => z.name === props.domain);
    return (
      <div className="terminal-card p-5">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// cloudflare</div>
        <div className="text-matrix-50 font-bold mb-1">linkar zona</div>
        <p className="text-xs text-matrix-200/60 mb-3">
          Escolhe a zona Cloudflare correspondente.
          {matched && <span className="text-matrix-300"> (auto-detectada: {matched.name})</span>}
        </p>
        {zones === null ? (
          <div className="text-xs text-matrix-700">a carregar zonas...</div>
        ) : zones.length === 0 ? (
          <div className="text-xs text-matrix-700">nenhuma zona disponível na conta CF.</div>
        ) : (
          <div className="space-y-2">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="input-matrix"
            >
              <option value="">-- escolher zona --</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.status})
                </option>
              ))}
            </select>
            {error && <div className="text-xs text-red-400">{error}</div>}
            <button
              onClick={handleLink}
              disabled={busy || !selectedZone}
              className="btn-matrix-solid w-full disabled:opacity-50"
            >
              {busy ? "$ a linkar..." : "$ linkar zona"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const wasHardened = !!props.cloudflareHardenedAt;
  const lastSteps = hardenSteps ?? props.cloudflareSettingsApplied;
  const successCount = lastSteps?.filter((s) => s.status === "success").length ?? 0;

  return (
    <div className="terminal-card p-5">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-matrix-500">// cloudflare</div>
        {wasHardened ? (
          <span className="badge-ok">hardened</span>
        ) : (
          <span className="badge-warn">linked, not hardened</span>
        )}
      </div>
      <div className="text-matrix-50 font-bold mb-1">{props.cloudflareZoneName}</div>
      {wasHardened && (
        <p className="text-xs text-matrix-200/60 mb-3">
          última aplicação: {new Date(props.cloudflareHardenedAt!).toLocaleString("pt-PT")} ·{" "}
          {successCount}/{lastSteps?.length ?? 0} settings ok
        </p>
      )}
      {error && <div className="text-xs text-red-400 mb-3">{error}</div>}
      <div className="flex gap-2 flex-wrap">
        <button onClick={handleHarden} disabled={busy} className="btn-matrix-solid disabled:opacity-50">
          {busy ? "$ a aplicar..." : wasHardened ? "$ re-aplicar" : "$ harden agora"}
        </button>
        <button onClick={handleUnlink} disabled={busy} className="btn-ghost">
          $ unlink
        </button>
      </div>
      {lastSteps && lastSteps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-matrix-900 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-matrix-700 mb-2">
            // settings aplicados
          </div>
          {lastSteps.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px]">
              <span
                className={
                  s.status === "success" ? "text-matrix-500 shrink-0" : "text-red-400 shrink-0"
                }
              >
                {s.status === "success" ? "[ok]" : "[!!]"}
              </span>
              <span className="text-matrix-200/80">{s.description}</span>
              {s.error && (
                <span className="text-red-400/60 text-[10px]">— {s.error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
