"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME, APP_URL } from "@/lib/constants";

type Mode = "password" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setMagicSent(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();

    if (mode === "password") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
        setBusy(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${APP_URL}/auth/callback` },
      });
      if (err) {
        setError(err.message);
        setBusy(false);
        return;
      }
      setMagicSent(true);
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 grid-bg">
      <div className="terminal-card p-8 w-full max-w-md">
        <Link href="/" className="text-matrix-50 font-bold text-xl flex items-center gap-2 mb-2">
          <span className="text-matrix-500 text-glow">▊</span>
          <span>{APP_NAME}</span>
        </Link>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-6">// auth.login</div>

        <div className="flex gap-1 mb-6 bg-ink-950 border border-matrix-900 rounded p-1">
          <button
            type="button"
            onClick={() => switchMode("password")}
            className={`flex-1 text-[11px] uppercase tracking-wider py-2 rounded transition-colors ${
              mode === "password"
                ? "bg-matrix-500 text-ink-950 font-bold"
                : "text-matrix-700 hover:text-matrix-300"
            }`}
          >
            password
          </button>
          <button
            type="button"
            onClick={() => switchMode("magic")}
            className={`flex-1 text-[11px] uppercase tracking-wider py-2 rounded transition-colors ${
              mode === "magic"
                ? "bg-matrix-500 text-ink-950 font-bold"
                : "text-matrix-700 hover:text-matrix-300"
            }`}
          >
            magic link
          </button>
        </div>

        {magicSent ? (
          <div className="space-y-3">
            <div className="text-matrix-50 font-bold">verifica o teu email.</div>
            <p className="text-sm text-matrix-200/70">
              Enviámos um link para <span className="text-matrix-500 break-all">{email}</span>. Clica para entrar.
            </p>
            <button onClick={() => { setMagicSent(false); setEmail(""); }} className="btn-ghost mt-4">
              ← outro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">
                $ email
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="user@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-matrix"
                disabled={busy}
              />
            </div>

            {mode === "password" && (
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider text-matrix-500">
                    $ password
                  </label>
                  <Link href="/auth/reset" className="text-[10px] text-matrix-700 hover:text-matrix-300">
                    esqueceste?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-matrix"
                  disabled={busy}
                />
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !email || (mode === "password" && !password)}
              className="btn-matrix-solid w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy
                ? "$ a entrar..."
                : mode === "password"
                  ? "$ entrar →"
                  : "$ enviar magic link →"}
            </button>

            <div className="text-center text-[10px] text-matrix-700 pt-2">
              não tens conta?{" "}
              <Link href="/auth/signup" className="text-matrix-300 hover:text-matrix-100 underline">
                criar conta
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
