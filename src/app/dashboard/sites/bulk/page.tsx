"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function normalizeTag(t: string): string {
  return t
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export default function BulkAddPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [langDefault, setLangDefault] = useState<"pt-PT" | "pt-BR" | "en">("pt-PT");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ requested: number; inserted: number } | null>(null);

  const domains = text
    .split(/[\n,;\s]+/)
    .map((d) => d.trim())
    .filter(Boolean);

  const tags = Array.from(
    new Set(
      tagsText
        .split(/[,\s]+/)
        .map(normalizeTag)
        .filter(Boolean)
    )
  ).slice(0, 12);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/sites/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains, lang_default: langDefault, tags }),
      });
      const data = (await res.json()) as { error?: string; requested?: number; inserted?: number };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult({ requested: data.requested ?? 0, inserted: data.inserted ?? 0 });
      setText("");
      setTagsText("");
      setTimeout(() => router.push("/dashboard"), 1500);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/dashboard" className="text-xs text-ink-500 hover:text-ink-300 mb-4 inline-block">
        ← dashboard
      </Link>
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// sites.bulk_add</div>
      <h1 className="text-3xl font-bold text-ink-50 mb-2">adicionar sites em batch</h1>
      <p className="text-sm text-ink-400 mb-8 max-w-2xl">
        Cola lista de domains (1 por linha, ou separados por vírgula). Máximo 100 por batch. Os já
        existentes são ignorados (sem duplicar).
      </p>

      <form onSubmit={handleSubmit} className="terminal-card p-6 space-y-5">
        <div>
          <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">
            $ domínios ({domains.length} detectados)
          </label>
          <textarea
            required
            placeholder={"meusite.com\noutrosite.pt\ncliente-3.com"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="input-matrix font-mono text-sm"
            disabled={busy}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">
              $ língua default do banner
            </label>
            <select
              value={langDefault}
              onChange={(e) => setLangDefault(e.target.value as "pt-PT" | "pt-BR" | "en")}
              className="input-matrix"
              disabled={busy}
            >
              <option value="pt-PT">Português (PT)</option>
              <option value="pt-BR">Português (BR)</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">
              $ tags ({tags.length} aplicadas a todos)
            </label>
            <input
              type="text"
              placeholder="cliente-x, premium, ecommerce"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="input-matrix"
              disabled={busy}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.5 rounded text-matrix-300 bg-matrix-500/5 border border-matrix-500/20 font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 rounded">
            {error}
          </div>
        )}
        {result && (
          <div className="text-xs text-matrix-300 border border-matrix-500/30 bg-matrix-500/10 px-3 py-2 rounded">
            [ok] {result.inserted} sites criados ({result.requested} domínios processados)
          </div>
        )}

        <button
          type="submit"
          disabled={busy || domains.length === 0}
          className="btn-matrix-solid w-full disabled:opacity-50"
        >
          {busy ? "$ a criar..." : `$ criar ${domains.length} site${domains.length === 1 ? "" : "s"} →`}
        </button>
      </form>
    </main>
  );
}
