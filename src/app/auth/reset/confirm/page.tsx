"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

export default function ResetConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("password tem de ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("passwords não coincidem.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 grid-bg">
      <div className="terminal-card p-8 w-full max-w-md">
        <Link href="/" className="text-matrix-50 font-bold text-xl flex items-center gap-2 mb-2">
          <span className="text-matrix-500 text-glow">▊</span>
          <span>{APP_NAME}</span>
        </Link>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-6">// auth.reset.confirm</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-matrix-200/70">Define a tua nova password.</p>
          <div>
            <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">
              $ nova password
            </label>
            <input
              type="password"
              required
              autoFocus
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-matrix"
              disabled={busy}
            />
            <p className="text-[10px] text-matrix-700 mt-1">mínimo 6 caracteres.</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">
              $ confirmar
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            disabled={busy}
            className="btn-matrix-solid w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "$ a guardar..." : "$ definir nova password →"}
          </button>
        </form>
      </div>
    </main>
  );
}
