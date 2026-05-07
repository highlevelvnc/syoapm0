"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeDomain, isValidDomain } from "@/lib/utils";

export function PublicScanForm({ size = "md" }: { size?: "md" | "lg" }) {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const clean = normalizeDomain(domain);
    if (!isValidDomain(clean)) {
      setError("Domínio inválido. Exemplo: meusite.com");
      return;
    }
    router.push(`/test/${encodeURIComponent(clean)}`);
  }

  const inputClass =
    size === "lg"
      ? "w-full bg-ink-950 border border-ink-700 rounded-l px-4 py-3 text-base text-ink-50 placeholder:text-ink-500 focus:outline-none focus:border-matrix-500 font-mono"
      : "w-full bg-ink-950 border border-ink-700 rounded-l px-3 py-2 text-sm text-ink-50 placeholder:text-ink-500 focus:outline-none focus:border-matrix-500 font-mono";

  const buttonClass =
    size === "lg"
      ? "bg-matrix-500 text-ink-950 px-6 py-3 rounded-r font-bold uppercase text-sm tracking-wider hover:bg-matrix-400 hover:shadow-matrix transition-all"
      : "bg-matrix-500 text-ink-950 px-4 py-2 rounded-r font-bold uppercase text-xs tracking-wider hover:bg-matrix-400 transition-all";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex">
        <input
          type="text"
          required
          placeholder="meusite.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className={inputClass}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className={buttonClass}>
          $ scan
        </button>
      </div>
      {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
      <div className="text-[10px] text-ink-500 mt-2 uppercase tracking-wider">
        grátis · sem signup · sem rate limit por domain (24h cache)
      </div>
    </form>
  );
}
