"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function normalize(t: string): string {
  return t
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function TagsEditor({
  siteId,
  initial,
}: {
  siteId: string;
  initial: string[];
}) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFromDraft() {
    const parts = draft
      .split(/[,\s]+/)
      .map(normalize)
      .filter(Boolean);
    if (parts.length === 0) return;
    setTags((prev) => Array.from(new Set([...prev, ...parts])).slice(0, 12));
    setDraft("");
  }

  function remove(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${siteId}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      const data = (await res.json()) as { error?: string; tags?: string[] };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const dirty = JSON.stringify(tags) !== JSON.stringify(initial);

  return (
    <div className="terminal-card p-5">
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
        // tags · agrupa por cliente, sector, tier
      </div>

      <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
        {tags.length === 0 && (
          <span className="text-xs text-ink-500 italic">sem tags ainda</span>
        )}
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border border-matrix-500/30 bg-matrix-500/5 text-matrix-300 font-mono"
          >
            #{t}
            <button
              onClick={() => remove(t)}
              className="text-ink-500 hover:text-red-400 transition-colors"
              aria-label={`remover ${t}`}
              type="button"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="cliente-x, ecommerce, premium..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addFromDraft();
            }
          }}
          className="input-matrix flex-1 min-w-[200px]"
          maxLength={64}
          disabled={busy}
        />
        <button
          type="button"
          onClick={addFromDraft}
          disabled={busy || !draft.trim()}
          className="btn-matrix"
        >
          + tag
        </button>
        {dirty && (
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="btn-matrix-solid"
          >
            {busy ? "$ a guardar..." : "$ guardar"}
          </button>
        )}
      </div>

      {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
      <div className="text-[10px] text-ink-500 mt-3">
        máx 12 tags · alfanumérico + hífen · enter ou vírgula para adicionar
      </div>
    </div>
  );
}
