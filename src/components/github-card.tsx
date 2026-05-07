"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Repo {
  id: number;
  full_name: string;
  owner: string;
  name: string;
}

export interface GithubCardProps {
  siteId: string;
  githubConnected: boolean;
  githubOwner: string | null;
  githubRepo: string | null;
  githubLastScanAt: string | null;
  githubOpenAlerts: number;
}

export function GithubCard(props: GithubCardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [scanResult, setScanResult] = useState<{ alerts: number; findings: number } | null>(null);

  useEffect(() => {
    if (props.githubConnected && !props.githubRepo) {
      (async () => {
        try {
          const res = await fetch("/api/github/repos");
          const data = (await res.json()) as { repos?: Repo[] };
          if (res.ok && data.repos) setRepos(data.repos);
        } catch {
          /* ignore */
        }
      })();
    }
  }, [props.githubConnected, props.githubRepo]);

  async function handleLink() {
    if (!selectedRepo || !repos) return;
    const r = repos.find((x) => x.full_name === selectedRepo);
    if (!r) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${props.siteId}/github/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: r.owner, repo: r.name }),
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

  async function handleScan() {
    setBusy(true);
    setError(null);
    setScanResult(null);
    try {
      const res = await fetch(`/api/sites/${props.siteId}/github/scan-deps`, { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        detail?: string;
        alerts_count?: number;
        findings_count?: number;
      };
      if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
      setScanResult({ alerts: data.alerts_count ?? 0, findings: data.findings_count ?? 0 });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlink() {
    if (!confirm("Desligar repo? Findings de deps já registadas ficam.")) return;
    setBusy(true);
    try {
      await fetch(`/api/sites/${props.siteId}/github/link`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!props.githubConnected) {
    return (
      <div className="terminal-card p-5">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// github</div>
        <div className="text-ink-50 font-bold mb-1">não conectado</div>
        <p className="text-xs text-ink-300/60 mb-3">
          Conecta GitHub para ler Dependabot alerts dos repos dos teus sites.
        </p>
        <Link href="/dashboard/settings/github" className="btn-matrix">
          conectar github ↗
        </Link>
      </div>
    );
  }

  if (!props.githubRepo) {
    return (
      <div className="terminal-card p-5">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// github</div>
        <div className="text-ink-50 font-bold mb-1">linkar repo</div>
        <p className="text-xs text-ink-300/60 mb-3">Escolhe o repo correspondente a este site.</p>
        {repos === null ? (
          <div className="text-xs text-ink-500">a carregar repos...</div>
        ) : repos.length === 0 ? (
          <div className="text-xs text-ink-500">nenhum repo acessível</div>
        ) : (
          <div className="space-y-2">
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="input-matrix"
            >
              <option value="">-- escolher repo --</option>
              {repos.map((r) => (
                <option key={r.id} value={r.full_name}>
                  {r.full_name}
                </option>
              ))}
            </select>
            {error && <div className="text-xs text-red-400">{error}</div>}
            <button
              onClick={handleLink}
              disabled={busy || !selectedRepo}
              className="btn-matrix-solid w-full disabled:opacity-50"
            >
              {busy ? "$ a linkar..." : "$ linkar repo"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const lastScan = props.githubLastScanAt;
  const openAlerts = props.githubOpenAlerts;

  return (
    <div className="terminal-card p-5">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-matrix-500">// github · dependabot</div>
        {openAlerts > 0 ? (
          <span className="badge-warn">{openAlerts} alerts</span>
        ) : lastScan ? (
          <span className="badge-ok">clean</span>
        ) : (
          <span className="badge-muted">no scan yet</span>
        )}
      </div>
      <div className="text-ink-50 font-bold mb-1 break-all">
        {props.githubOwner}/{props.githubRepo}
      </div>
      {lastScan && (
        <p className="text-xs text-ink-300/60 mb-3">
          último scan: {new Date(lastScan).toLocaleString("pt-PT")} · {openAlerts} open alerts
        </p>
      )}
      {scanResult && (
        <div className="text-xs text-matrix-300 mb-3 border-l-2 border-matrix-500/40 pl-3">
          [ok] scan completo · {scanResult.findings} findings inseridos
        </div>
      )}
      {error && <div className="text-xs text-red-400 mb-3">{error}</div>}
      <div className="flex gap-2 flex-wrap">
        <button onClick={handleScan} disabled={busy} className="btn-matrix-solid disabled:opacity-50">
          {busy ? "$ a fetchar..." : "$ scan deps"}
        </button>
        <button onClick={handleUnlink} disabled={busy} className="btn-ghost">
          $ unlink
        </button>
      </div>
    </div>
  );
}
