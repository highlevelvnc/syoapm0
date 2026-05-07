"use client";

import { useState } from "react";

type Step = "banner" | "saved";
type Action = "accept_all" | "reject_all" | "custom";

const COPY = {
  title: "Privacidade & cookies",
  body: "Usamos cookies para melhorar a sua experiência e analisar tráfego. Pode aceitar tudo, rejeitar não-essenciais ou personalizar.",
  acceptAll: "Aceitar tudo",
  reject: "Apenas essenciais",
  custom: "Personalizar",
  poweredBy: "Powered by BlindAI",
};

export function CookieDemo() {
  const [step, setStep] = useState<Step>("banner");
  const [action, setAction] = useState<Action>("accept_all");

  const handle = (a: Action) => {
    setAction(a);
    setStep("saved");
  };

  const reset = () => setStep("banner");

  if (step === "saved") {
    const choices = {
      necessary: true,
      functional: action === "accept_all",
      analytics: action === "accept_all",
      marketing: action === "accept_all",
    };
    return (
      <div className="terminal-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-matrix-500 mb-2">
          // consent registado · POST /api/v1/consent
        </div>
        <pre className="text-xs bg-ink-950 border border-ink-700 p-3 rounded text-ink-300 overflow-x-auto">
{`{
  "site_id": "demo",
  "action": "${action}",
  "choices": {
    "necessary": true,
    "functional": ${choices.functional},
    "analytics": ${choices.analytics},
    "marketing": ${choices.marketing}
  },
  "lang": "pt-PT",
  "ts": "${new Date().toISOString()}"
}
→ 201 created`}
        </pre>
        <button onClick={reset} className="btn-ghost mt-3">
          ↺ ver banner outra vez
        </button>
      </div>
    );
  }

  return (
    <div className="terminal-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-matrix-500 mb-3">
        // banner.preview · pt-PT · v1
      </div>
      <h4 className="text-ink-50 font-bold text-base mb-2">{COPY.title}</h4>
      <p className="text-sm text-ink-300/80 mb-4">{COPY.body}</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => handle("accept_all")} className="btn-matrix-solid">
          {COPY.acceptAll}
        </button>
        <button onClick={() => handle("reject_all")} className="btn-matrix">
          {COPY.reject}
        </button>
        <button onClick={() => handle("custom")} className="btn-ghost">
          {COPY.custom}
        </button>
      </div>
      <div className="mt-4 pt-3 border-t border-matrix-faint text-[10px] text-ink-500 flex items-center justify-between">
        <span>{COPY.poweredBy}</span>
        <span className="text-matrix-500">▊</span>
      </div>
    </div>
  );
}
