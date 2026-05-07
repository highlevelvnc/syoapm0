"use client";

import { useState } from "react";

export function ShareRow({
  domain,
  score,
  grade,
}: {
  domain: string;
  score: number;
  grade: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : `https://syoapm0.vercel.app/test/${domain}`;
  const text = `${domain} security score: ${grade} (${score}/100) · scanned via BlindAI`;

  function copy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="terminal-card p-5">
      <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3">// partilhar</div>
      <div className="flex flex-wrap gap-2">
        <button onClick={copy} className="btn-matrix">
          {copied ? "[ok] link copiado" : "$ copiar link"}
        </button>
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="btn-matrix">
          $ twitter ↗
        </a>
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn-matrix">
          $ linkedin ↗
        </a>
      </div>
    </div>
  );
}
