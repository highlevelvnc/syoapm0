import { gradeColor } from "@/lib/scanners/score";
import type { Grade } from "@/lib/scanners";

const GRADE_COPY: Record<Grade, { label: string; tone: string }> = {
  "A+": { label: "excellent", tone: "text-matrix-300" },
  A:    { label: "great",     tone: "text-matrix-300" },
  B:    { label: "good",      tone: "text-matrix-300" },
  C:    { label: "ok",        tone: "text-yellow-300" },
  D:    { label: "poor",      tone: "text-orange-300" },
  F:    { label: "critical",  tone: "text-red-300" },
};

export function SecurityScore({
  score,
  grade,
  status,
  size = "lg",
}: {
  score: number | null;
  grade: Grade | null;
  status: "completed" | "running" | "failed" | "pending" | null;
  size?: "sm" | "lg";
}) {
  if (status === null) {
    return (
      <div className="terminal-card p-6">
        <div className="text-[10px] uppercase tracking-wider text-ink-500">security score</div>
        <div className="text-3xl font-bold text-ink-500 mt-1">—</div>
        <div className="text-xs text-ink-500 mt-1">corre o primeiro scan</div>
      </div>
    );
  }

  if (status === "running" || status === "pending") {
    return (
      <div className="terminal-card p-6 scanline">
        <div className="text-[10px] uppercase tracking-wider text-matrix-500">scanning</div>
        <div className="text-3xl font-bold text-matrix-300 mt-1 animate-pulse">···</div>
        <div className="text-xs text-ink-500 mt-1">a recolher findings</div>
      </div>
    );
  }

  if (status === "failed" || score === null || grade === null) {
    return (
      <div className="terminal-card p-6">
        <div className="text-[10px] uppercase tracking-wider text-red-400">scan falhou</div>
        <div className="text-3xl font-bold text-red-400 mt-1">!!</div>
        <div className="text-xs text-ink-500 mt-1">tenta de novo</div>
      </div>
    );
  }

  const c = GRADE_COPY[grade];
  const numClass = size === "lg" ? "text-7xl sm:text-8xl" : "text-4xl";
  const letterClass = size === "lg" ? "text-4xl sm:text-5xl" : "text-2xl";

  return (
    <div className="terminal-card p-6 flex items-center justify-between gap-6">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-ink-500">security score</div>
        <div
          className={`${numClass} font-bold tabular-nums leading-none mt-1 text-glow`}
          style={{ color: gradeColor(grade) }}
        >
          {score}
        </div>
        <div className={`text-xs uppercase tracking-wider mt-2 ${c.tone}`}>{c.label}</div>
      </div>
      <div
        className={`${letterClass} font-bold leading-none`}
        style={{ color: gradeColor(grade) }}
      >
        {grade}
      </div>
    </div>
  );
}
