"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ScanNowButton({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setScanning(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/scan`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data?.error || `HTTP ${res.status}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={scanning}
        className="btn-matrix-solid disabled:opacity-50 disabled:cursor-wait"
      >
        {scanning ? "$ a scannear..." : "$ scan now"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
