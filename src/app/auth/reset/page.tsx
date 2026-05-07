"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME, APP_URL } from "@/lib/constants";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${APP_URL}/auth/callback?next=/auth/reset/confirm`,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    setSent(true);
    setBusy(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 grid-bg">
      <div className="terminal-card p-8 w-full max-w-md">
        <Link href="/" className="text-matrix-50 font-bold text-xl flex items-center gap-2 mb-2">
          <span className="text-matrix-500 text-glow">▊</span>
          <span>{APP_NAME}</span>
        </Link>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-6">// auth.reset</div>

        {sent ? (
          <div className="space-y-3">
            <div className="text-matrix-50 font-bold">verifica o teu email.</div>
            <p className="text-sm text-matrix-200/70">
              Enviámos link para <span className="text-matrix-500 break-all">{email}</span>. Clica para definir nova password.
            </p>
            <Link href="/auth/login" className="btn-ghost mt-4 inline-block">
              ← voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-matrix-200/70">
              Mete o teu email. Enviamos um link para definires nova password.
            </p>
            <div>
              <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">
                $ email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-matrix"
                disabled={busy}
              />
            </div>
            {error && (
              <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={busy || !email}
              className="btn-matrix-solid w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? "$ a enviar..." : "$ enviar link →"}
            </button>
            <Link
              href="/auth/login"
              className="block text-center text-[10px] text-matrix-700 hover:text-matrix-300 pt-2"
            >
              ← voltar ao login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
