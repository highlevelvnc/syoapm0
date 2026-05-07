"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "> resolving DNS records...",
  "> connecting via TLS...",
  "> reading security headers...",
  "> checking SPF, DMARC, CAA, DNSSEC...",
  "> probing exposed paths...",
  "> generating typosquat variants...",
  "> calculating score...",
];

export function ScanProgress({ domain }: { domain: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="terminal-card p-8 max-w-2xl mx-auto">
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">
        // scanning {domain}
      </div>
      <div className="font-mono text-sm space-y-1 min-h-[200px]">
        {STEPS.slice(0, Math.min(step + 1, STEPS.length)).map((line, i) => (
          <div
            key={i}
            className={i < step ? "text-matrix-300" : "text-matrix-500 text-glow"}
          >
            {line}
            {i === step && step < STEPS.length && <span className="animate-blink">▊</span>}
            {i < step && <span className="text-ink-500"> [OK]</span>}
          </div>
        ))}
      </div>
      <div className="text-[10px] text-ink-500 mt-6 uppercase tracking-wider">
        primeira execução demora 5-15s. depois fica cached 24h.
      </div>
    </div>
  );
}
