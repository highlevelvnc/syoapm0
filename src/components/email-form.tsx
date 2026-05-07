"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  connected: boolean;
  currentEmail: string | null;
}

export function EmailForm({ connected, currentEmail }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(currentEmail ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications/email/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string; detail?: string };
      if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Desconectar email alerts?")) return;
    setBusy(true);
    try {
      await fetch("/api/notifications/email/connect", { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleTest() {
    setTestStatus("sending");
    try {
      const res = await fetch("/api/notifications/email/test", { method: "POST" });
      const data = (await res.json()) as { error?: string; detail?: string };
      if (!res.ok) {
        setError(data.detail || data.error || `HTTP ${res.status}`);
        setTestStatus("failed");
        return;
      }
      setTestStatus("sent");
      setTimeout(() => setTestStatus("idle"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setTestStatus("failed");
    }
  }

  if (!connected) {
    return (
      <form onSubmit={handleConnect} className="terminal-card p-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-matrix-500 block mb-2">
            $ email para alerts
          </label>
          <input
            type="email"
            required
            placeholder="user@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-matrix"
            disabled={busy}
          />
          <p className="text-[10px] text-matrix-700 mt-2">
            Alerts via Resend. Sender: <code>onboarding@resend.dev</code>. Verifica spam folder na primeira vez.
          </p>
        </div>
        {error && (
          <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded">
            {error}
          </div>
        )}
        <button type="submit" disabled={busy || !email} className="btn-matrix-solid w-full">
          {busy ? "$ a guardar..." : "$ activar alerts →"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="terminal-card p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-matrix-50 font-bold">email alerts active</span>
            <span className="badge-ok">enabled</span>
          </div>
          <div className="text-xs text-matrix-700">{currentEmail}</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleTest}
            disabled={busy || testStatus === "sending"}
            className="btn-matrix"
          >
            {testStatus === "sending"
              ? "$ a enviar..."
              : testStatus === "sent"
                ? "[ok] enviado!"
                : testStatus === "failed"
                  ? "[!!] falhou"
                  : "$ enviar teste"}
          </button>
          <button onClick={handleDisconnect} disabled={busy} className="btn-ghost">
            $ desconectar
          </button>
        </div>
      </div>
      {error && (
        <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
