"use client";

import { useState } from "react";

export function SnippetDisplay({
  siteId,
  apiBase,
  langDefault,
}: {
  siteId: string;
  apiBase: string;
  langDefault?: string;
}) {
  const [copied, setCopied] = useState(false);
  const langAttr = langDefault ? `\n  data-lang="${langDefault}"` : "";
  const snippet = `<script\n  src="${apiBase}/cdn/w.js"\n  data-site="${siteId}"${langAttr}\n  async\n></script>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="terminal-card p-5">
      <pre className="text-xs sm:text-sm text-ink-300 overflow-x-auto bg-ink-950 border border-ink-700 rounded p-3 mb-3 whitespace-pre-wrap break-all">
{snippet}
      </pre>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={copy} className="btn-matrix-solid">
          {copied ? "[ok] copiado" : "$ copiar"}
        </button>
        <span className="text-[10px] text-ink-500">
          cola no &lt;head&gt; ou antes de &lt;/body&gt;
        </span>
      </div>
    </div>
  );
}
