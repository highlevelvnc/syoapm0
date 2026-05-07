import { ACHIEVEMENTS } from "@/lib/scanners/achievements";

export interface DBAchievement {
  id: string;
  code: string;
  title: string;
  description: string | null;
  icon: string;
  earned_at: string;
}

export function AchievementsGrid({ earned }: { earned: DBAchievement[] }) {
  const allCodes = Object.keys(ACHIEVEMENTS);
  const earnedSet = new Set(earned.map((e) => e.code));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {allCodes.map((code) => {
        const def = ACHIEVEMENTS[code];
        const isEarned = earnedSet.has(code);
        return (
          <div
            key={code}
            className={`terminal-card p-3 transition-all ${
              isEarned ? "border-matrix-500/30" : "opacity-30 grayscale"
            }`}
            title={def.description}
          >
            <div className={`font-bold text-sm ${isEarned ? "text-matrix-500" : "text-matrix-700"}`}>
              {def.icon}
            </div>
            <div className="text-matrix-50 font-bold text-xs mt-2 truncate">{def.title}</div>
            <div className="text-[10px] text-matrix-700 mt-1 line-clamp-2">{def.description}</div>
          </div>
        );
      })}
    </div>
  );
}
