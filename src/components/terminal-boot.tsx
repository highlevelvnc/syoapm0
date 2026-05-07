"use client";

import { useEffect, useState } from "react";

const LINES = [
  "> initializing blindai security suite v0.1.0",
  "> loading defense modules...........[OK]",
  "> establishing secure tunnel.........[OK]",
  "> RGPD compliance: ENABLED",
  "> LGPD compliance: ENABLED",
  "> ready.",
];

export function TerminalBoot({ lines = LINES }: { lines?: string[] }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 200);
    return () => clearTimeout(t);
  }, [shown, lines.length]);

  return (
    <div className="font-mono text-xs sm:text-sm text-matrix-300 space-y-1">
      {lines.slice(0, shown).map((l, i) => (
        <div key={i} className="animate-boot">
          <span className={i === lines.length - 1 ? "text-matrix-500 text-glow" : ""}>{l}</span>
        </div>
      ))}
      {shown >= lines.length && (
        <div className="text-matrix-500">
          $ <span className="animate-blink">▊</span>
        </div>
      )}
    </div>
  );
}
