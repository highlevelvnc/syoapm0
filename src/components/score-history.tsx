import { createClient } from "@/lib/supabase/server";
import { gradeColor } from "@/lib/scanners/score";
import type { Grade } from "@/lib/scanners";

export async function ScoreHistory({ siteId, limit = 30 }: { siteId: string; limit?: number }) {
  const supabase = await createClient();
  const { data: scans } = await supabase
    .from("scans")
    .select("id, score, grade, started_at")
    .eq("site_id", siteId)
    .eq("status", "completed")
    .not("score", "is", null)
    .order("started_at", { ascending: true })
    .limit(limit);

  if (!scans || scans.length < 2) {
    return (
      <div className="terminal-card p-5">
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// score history</div>
        <div className="text-sm text-ink-500">
          {!scans || scans.length === 0
            ? "ainda sem scans completos"
            : "precisa de pelo menos 2 scans para mostrar histórico"}
        </div>
      </div>
    );
  }

  const W = 600;
  const H = 140;
  const PAD = 24;

  const points = scans.map((s, i) => {
    const x = PAD + (i / (scans.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((s.score ?? 0) / 100) * (H - PAD * 2);
    return {
      x,
      y,
      score: s.score ?? 0,
      grade: (s.grade ?? "F") as Grade,
      ts: s.started_at,
    };
  });

  const path = "M " + points.map((p) => `${p.x},${p.y}`).join(" L ");
  const areaPath =
    `M ${points[0].x},${H - PAD} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${H - PAD} Z`;
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const trend = lastPoint.score - firstPoint.score;
  const trendStr = trend > 0 ? `+${trend}` : trend.toString();
  const trendColor = trend > 0 ? "#10b981" : trend < 0 ? "#ef4444" : "#4a5462";
  const minScore = Math.min(...points.map((p) => p.score));
  const maxScore = Math.max(...points.map((p) => p.score));

  return (
    <div className="terminal-card p-5">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-matrix-500">
          // score history · {scans.length} scans
        </div>
        <div className="flex items-baseline gap-3 text-xs">
          <span className="text-ink-500 uppercase tracking-wider">trend</span>
          <span className="font-bold tabular-nums" style={{ color: trendColor }}>
            {trendStr} pts
          </span>
          <span className="text-ink-500">·</span>
          <span className="text-ink-500 uppercase tracking-wider">range</span>
          <span className="text-ink-300 tabular-nums">
            {minScore}–{maxScore}
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-36"
        preserveAspectRatio="none"
        aria-label="Score history chart"
      >
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((s) => {
          const y = H - PAD - (s / 100) * (H - PAD * 2);
          return (
            <g key={s}>
              <line
                x1={PAD}
                y1={y}
                x2={W - PAD}
                y2={y}
                stroke="#1c2330"
                strokeDasharray="2 4"
              />
              <text
                x={PAD - 4}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#4a5462"
                fontFamily="ui-monospace, monospace"
              >
                {s}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#scoreFill)" />
        <path d={path} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill={i === points.length - 1 ? gradeColor(p.grade) : "#10b981"}
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-ink-500 mt-2 font-mono">
        <span>{new Date(firstPoint.ts).toLocaleDateString("pt-PT")}</span>
        <span>{new Date(lastPoint.ts).toLocaleDateString("pt-PT")}</span>
      </div>
    </div>
  );
}
