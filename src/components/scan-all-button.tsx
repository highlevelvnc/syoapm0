"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ScanAllButton({ totalSites }: { totalSites: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (totalSites === 0) return;
    if (!confirm(`Scan ${totalSites} sites? Demora ~10-30s.`)) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/sites/scan-all", { method: "POST" });
      const data = (await res.json()) as { successful?: number; failed?: number; error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult({ ok: data.successful ?? 0, failed: data.failed ?? 0 });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={busy || totalSites === 0}
        className="btn-matrix disabled:opacity-50"
      >
        {busy ? "$ a scannear..." : `$ scan all (${totalSites})`}
      </button>
      {result && (
        <span className="text-xs text-matrix-300">
          [ok] {result.ok}/{result.ok + result.failed}
        </span>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
