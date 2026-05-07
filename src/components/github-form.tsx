"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  private: boolean;
  pushed_at: string;
}

export function GithubForm({ connected, login }: { connected: boolean; login: string | null }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[] | null>(null);

  const loadRepos = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/github/repos");
      const data = (await res.json()) as { repos?: Repo[]; error?: string; detail?: string };
      if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
      setRepos(data.repos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (connected) loadRepos();
  }, [connected, loadRepos]);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/github/connect", {
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
    if (!confirm("Desconectar GitHub? Os sites linked perdem acesso a Dependabot alerts.")) return;
    setBusy(true);
    try {
      await fetch("/api/github/connect", { method: "DELETE" });
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
            $ personal access token
          </label>
          <input
            type="password"
            required
            placeholder="ghp_xxx ou github_pat_xxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input-matrix"
            disabled={busy}
          />
          <p className="text-[10px] text-ink-500 mt-2">
            encrypted at rest com AES-256-GCM. nunca volta ao frontend depois.
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
            <span className="text-ink-50 font-bold">github conectado</span>
            <span className="badge-ok">active</span>
          </div>
          <div className="text-xs text-ink-500">@{login}</div>
        </div>
        <button onClick={handleDisconnect} disabled={busy} className="btn-ghost">
          $ desconectar
        </button>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
          // {repos?.length ?? 0} repo{repos?.length === 1 ? "" : "s"} acessíveis
        </div>
        {error && (
          <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded mb-3">
            {error}
          </div>
        )}
        {!repos && busy && <div className="text-sm text-ink-500">a carregar repos...</div>}
        {repos && repos.length === 0 && (
          <div className="terminal-card p-5 text-sm text-ink-300/60">
            nenhum repo. confirma que o token tem scope <code>repo</code> + <code>security_events</code>.
          </div>
        )}
        {repos && repos.length > 0 && (
          <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {repos.slice(0, 50).map((r) => (
              <li key={r.id} className="terminal-card p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-ink-50 font-bold text-sm truncate">{r.full_name}</div>
                  <div className="text-[10px] text-ink-500 mt-0.5">
                    {r.private ? "private" : "public"} · pushed {new Date(r.pushed_at).toLocaleDateString("pt-PT")}
                  </div>
                </div>
              </li>
            ))}
            {repos.length > 50 && (
              <li className="text-[10px] text-ink-500 text-center pt-2">
                +{repos.length - 50} mais (mostrar todos quando linkar a um site)
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
