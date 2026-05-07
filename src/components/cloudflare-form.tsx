"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Zone {
  id: string;
  name: string;
  status: string;
  account_name?: string;
  paused: boolean;
}

export function CloudflareForm({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<Zone[] | null>(null);

  const loadZones = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/cloudflare/zones");
      const data = (await res.json()) as { zones?: Zone[]; error?: string; details?: string };
      if (!res.ok) throw new Error(data.details || data.error || `HTTP ${res.status}`);
      setZones(data.zones ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (connected) loadZones();
  }, [connected, loadZones]);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cloudflare/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { error?: string; details?: string };
      if (!res.ok) throw new Error(data.details || data.error || `HTTP ${res.status}`);
      setToken("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Desconectar Cloudflare? Os sites já hardened não revertem automaticamente.")) return;
    setBusy(true);
    try {
      await fetch("/api/cloudflare/connect", { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!connected) {
    return (
      <form onSubmit={handleConnect} className="terminal-card p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">
            $ api token
          </label>
          <input
            type="password"
            required
            placeholder="cf_xxx... (cola token API)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input-matrix"
            disabled={busy}
          />
          <p className="text-[10px] text-ink-500 mt-2">
            guardado encrypted at rest com AES-256-GCM. nunca volta ao frontend depois.
          </p>
        </div>
        {error && (
          <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded">
            {error}
          </div>
        )}
        <button type="submit" disabled={busy || !token} className="btn-matrix-solid w-full">
          {busy ? "$ a validar..." : "$ conectar →"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="terminal-card p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-ink-50 font-bold">cloudflare conectado</span>
            <span className="badge-ok">active</span>
          </div>
          <div className="text-xs text-ink-500">token validado, encrypted-at-rest</div>
        </div>
        <button onClick={handleDisconnect} disabled={busy} className="btn-ghost">
          $ desconectar
        </button>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
          // {zones?.length ?? 0} zona{zones?.length === 1 ? "" : "s"} na conta
        </div>
        {error && (
          <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded mb-3">
            {error}
          </div>
        )}
        {!zones && busy && <div className="text-sm text-ink-500">a carregar zonas...</div>}
        {zones && zones.length === 0 && (
          <div className="terminal-card p-5 text-sm text-ink-300/60">
            nenhuma zona encontrada. adiciona um domínio em Cloudflare primeiro.
          </div>
        )}
        {zones && zones.length > 0 && (
          <ul className="space-y-2">
            {zones.map((z) => (
              <li key={z.id} className="terminal-card p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-ink-50 font-bold">{z.name}</div>
                  <div className="text-[10px] text-ink-500 mt-0.5">
                    {z.status} · account: {z.account_name ?? "—"}
                    {z.paused ? " · paused" : ""}
                  </div>
                </div>
                <code className="text-[10px] text-ink-500">{z.id.slice(0, 12)}...</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
