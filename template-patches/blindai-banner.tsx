/**
 * BlindAI Cookie Banner — drop-in React component.
 *
 * Coloca em src/components/blindai-banner.tsx e importa em app/layout.tsx:
 *
 *   import { BlindaiBanner } from "@/components/blindai-banner";
 *   ...
 *   <body>{children}<BlindaiBanner /></body>
 *
 * Activado quando NEXT_PUBLIC_BLINDAI_SITE_ID está definido (Vercel env var).
 * Em local dev sem o var, é silenciosamente skipped — zero ruído.
 */

import Script from "next/script";

const BLINDAI_BASE = process.env.NEXT_PUBLIC_BLINDAI_BASE ?? "https://syoapm0.vercel.app";

export interface BlindaiBannerProps {
  /** Site ID do BlindAI dashboard. Default lê NEXT_PUBLIC_BLINDAI_SITE_ID. */
  siteId?: string;
  /** Força lang ("pt-PT" | "pt-BR" | "en"). Default = auto-detect via navigator.language. */
  lang?: "pt-PT" | "pt-BR" | "en";
  /** Esconde badge "Powered by BlindAI" (planos pagos). Default false. */
  hideBadge?: boolean;
}

export function BlindaiBanner({ siteId, lang, hideBadge }: BlindaiBannerProps = {}) {
  const id = siteId ?? process.env.NEXT_PUBLIC_BLINDAI_SITE_ID;
  if (!id) return null;

  return (
    <Script
      src={`${BLINDAI_BASE}/cdn/w.js`}
      data-site={id}
      data-lang={lang}
      data-badge={hideBadge ? "false" : undefined}
      strategy="afterInteractive"
      async
    />
  );
}
