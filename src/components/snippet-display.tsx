"use client";

import { useState } from "react";

export function SnippetDisplay({ siteId, apiBase }: { siteId: string; apiBase: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script\n  src="${apiBase}/cdn/w.js"\n  data-site="${siteId}"\n  async\n></script>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="terminal-card p-5">
      <pre className="text-xs sm:text-sm text-matrix-200 overflow-x-auto bg-ink-950 border border-matrix-900 rounded p-3 mb-3 whitespace-pre-wrap break-all">
{snippet}
      </pre>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={copy} className="btn-matrix-solid">
          {copied ? "[ok] copiado" : "$ copiar"}
        </button>
        <span className="text-[10px] text-matrix-700">
          cola no &lt;head&gt; ou antes de &lt;/body&gt;
        </span>
      </div>
    </div>
  );
}
