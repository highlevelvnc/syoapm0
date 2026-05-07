"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { normalizeDomain, isValidDomain } from "@/lib/utils";
import type { Lang } from "@/lib/constants";

export default function NewSitePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [themeColor, setThemeColor] = useState("#00FF41");
  const [langDefault, setLangDefault] = useState<Lang>("pt-PT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const cleanDomain = normalizeDomain(domain);
    if (!isValidDomain(cleanDomain)) {
      setError("Domínio inválido. Exemplo: meusite.com");
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("sites")
      .insert({
        owner_id: user.id,
        name: name.trim(),
        domain: cleanDomain,
        theme_color: themeColor,
        lang_default: langDefault,
      })
      .select("id")
      .single();

    if (err) {
      if (err.code === "23505") setError("Já tens um site com esse domínio.");
      else setError(err.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/sites/${data.id}`);
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dashboard" className="text-xs text-matrix-700 hover:text-matrix-300 mb-4 inline-block">
        ← voltar
      </Link>
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// sites.new</div>
      <h1 className="text-3xl font-bold text-matrix-50 mb-8">adicionar site</h1>

      <form onSubmit={handleSubmit} className="terminal-card p-6 space-y-5">
        <Field label="nome interno">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Site do João — pintor"
            className="input-matrix"
            disabled={loading}
          />
        </Field>
        <Field label="domínio" hint="sem https:// ou www.">
          <input
            type="text"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="meusite.com"
            className="input-matrix"
            disabled={loading}
          />
        </Field>
        <Field label="língua default do banner">
          <select
            value={langDefault}
            onChange={(e) => setLangDefault(e.target.value as Lang)}
            className="input-matrix"
            disabled={loading}
          >
            <option value="pt-PT">Português (PT)</option>
            <option value="pt-BR">Português (BR)</option>
            <option value="en">English</option>
          </select>
        </Field>
        <Field label="cor primária do banner">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="bg-ink-950 border border-matrix-900 rounded h-10 w-16 cursor-pointer"
              disabled={loading}
            />
            <input
              type="text"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="input-matrix flex-1"
              disabled={loading}
            />
          </div>
        </Field>
        {error && (
          <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-matrix-solid w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "$ a criar..." : "$ criar site →"}
        </button>
      </form>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-matrix-500">$ {label}</span>
        {hint && <span className="text-[10px] text-matrix-700">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
