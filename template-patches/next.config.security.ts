/**
 * BlindAI security headers patch.
 * Merge com o teu next.config.ts existente — secção `headers()` e `poweredByHeader`.
 */

import type { NextConfig } from "next";

const securityHeaders = [
  // Force HTTPS no browser durante 2 anos, com preload list
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Bloqueia clickjacking via iframe
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Anti MIME sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Não vaza URLs em referrer cross-origin
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Bloqueia features default (câmara, microfone, geolocation)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // CSP — ajusta consoante o site (este é restritivo, pode quebrar inline scripts)
  // Comenta esta linha se ainda não tens nonces/hashes configurados.
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://syoapm0.vercel.app https://*.vercel.app; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://syoapm0.vercel.app; frame-ancestors 'none';",
  },
];

const nextConfig: NextConfig = {
  // Não vaza tecnologia em Header
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Aplica a tudo excepto _next static
        source: "/((?!_next/static).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
