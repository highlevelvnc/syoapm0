"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME, APP_URL } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${APP_URL}/auth/callback` },
    });
    if (err) {
      setError(err.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 grid-bg">
      <div className="terminal-card p-8 w-full max-w-md">
        <Link href="/" className="text-matrix-50 font-bold text-xl flex items-center gap-2 mb-2">
          <span className="text-matrix-500 text-glow">▊</span>
          <span>{APP_NAME}</span>
        </Link>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-6">
          // auth.login
        </div>

        {status === "sent" ? (
          <div className="space-y-3">
            <div className="text-matrix-50 font-bold">verifica o teu email.</div>
            <p className="text-sm text-matrix-200/70">
              Enviámos um link para <span className="text-matrix-500 break-all">{email}</span>. Clica para entrar.
            </p>
            <button
              onClick={() => { setStatus("idle"); setEmail(""); }}
              className="btn-ghost mt-4"
            >
              ← outro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
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
                disabled={status === "sending"}
              />
            </div>
            {error && (
              <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={status === "sending" || !email}
              className="btn-matrix-solid w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "a enviar..." : "$ enviar magic link →"}
            </button>
            <p className="text-[10px] text-matrix-700 text-center pt-2">
              sem password. enviamos um link mágico ao teu email.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
