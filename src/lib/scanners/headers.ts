import type { Finding, ScannerResult } from "./types";

export async function scanHeaders(domain: string): Promise<ScannerResult> {
  const findings: Finding[] = [];
  const url = `https://${domain}/`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "BlindAI-Scanner/0.1 (+https://blindai.app)" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    return {
      findings: [
        {
          category: "headers",
          severity: "high",
          code: "headers_fetch_failed",
          title: "Não foi possível alcançar o site",
          description: err instanceof Error ? err.message : String(err),
          recommendation: "Verifica se o domínio está online e a responder em HTTPS.",
        },
      ],
    };
  }

  const headers = new Map<string, string>();
  res.headers.forEach((v, k) => headers.set(k.toLowerCase(), v));

  if (!res.url.startsWith("https://")) {
    findings.push({
      category: "headers",
      severity: "critical",
      code: "no_https",
      title: "Site não usa HTTPS",
      evidence: { final_url: res.url },
      recommendation: "Configurar HTTPS imediatamente. Cloudflare oferece SSL grátis.",
    });
  }

  const hsts = headers.get("strict-transport-security");
  if (!hsts) {
    findings.push({
      category: "headers",
      severity: "high",
      code: "hsts_missing",
      title: "HSTS em falta",
      description: "Strict-Transport-Security força HTTPS no browser. Sem isto, downgrade attack é possível.",
      recommendation: "Adicionar header: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
    });
  } else {
    const maxAge = Number(hsts.match(/max-age=(\d+)/)?.[1] ?? 0);
    if (maxAge < 31_536_000) {
      findings.push({
        category: "headers",
        severity: "medium",
        code: "hsts_short",
        title: `HSTS max-age curto (${maxAge}s)`,
        evidence: { max_age: maxAge, header: hsts },
        recommendation: "Aumentar max-age para 63072000 e adicionar includeSubDomains; preload",
      });
    }
  }

  const csp = headers.get("content-security-policy");
  if (!csp) {
    findings.push({
      category: "headers",
      severity: "high",
      code: "csp_missing",
      title: "Content-Security-Policy em falta",
      description: "CSP previne XSS limitando origens de scripts e styles.",
      recommendation: "Definir CSP com pelo menos default-src 'self'.",
    });
  } else if (csp.includes("unsafe-inline") || csp.includes("unsafe-eval")) {
    findings.push({
      category: "headers",
      severity: "medium",
      code: "csp_unsafe",
      title: "CSP usa unsafe-inline / unsafe-eval",
      description: "Estas directivas anulam a maior parte da protecção CSP.",
      evidence: { csp },
      recommendation: "Remover unsafe-inline e unsafe-eval. Usar nonces ou hashes.",
    });
  }

  const xfo = headers.get("x-frame-options");
  const cspFrameAncestors = csp?.includes("frame-ancestors");
  if (!xfo && !cspFrameAncestors) {
    findings.push({
      category: "headers",
      severity: "medium",
      code: "xfo_missing",
      title: "X-Frame-Options em falta",
      description: "Sem isto, o site pode ser embebido em iframes (clickjacking).",
      recommendation: "Adicionar X-Frame-Options: DENY ou usar CSP frame-ancestors 'none'.",
    });
  }

  if (!headers.get("x-content-type-options")) {
    findings.push({
      category: "headers",
      severity: "low",
      code: "xcto_missing",
      title: "X-Content-Type-Options em falta",
      recommendation: "Adicionar X-Content-Type-Options: nosniff",
    });
  }

  if (!headers.get("referrer-policy")) {
    findings.push({
      category: "headers",
      severity: "low",
      code: "referrer_missing",
      title: "Referrer-Policy em falta",
      recommendation: "Adicionar Referrer-Policy: strict-origin-when-cross-origin",
    });
  }

  if (!headers.get("permissions-policy")) {
    findings.push({
      category: "headers",
      severity: "low",
      code: "permissions_missing",
      title: "Permissions-Policy em falta",
      recommendation: "Adicionar Permissions-Policy: camera=(), microphone=(), geolocation=()",
    });
  }

  const server = headers.get("server");
  if (server && /\d/.test(server)) {
    findings.push({
      category: "headers",
      severity: "low",
      code: "server_version_exposed",
      title: "Versão do servidor exposta",
      description: `Header Server expõe versão: "${server}". Atacantes usam isto para targetar CVEs.`,
      evidence: { server },
      recommendation: "Esconder versão do servidor (configurar para não expor versão).",
    });
  }

  const poweredBy = headers.get("x-powered-by");
  if (poweredBy) {
    findings.push({
      category: "headers",
      severity: "low",
      code: "powered_by_exposed",
      title: "X-Powered-By exposto",
      description: `Revela tecnologia: "${poweredBy}".`,
      evidence: { x_powered_by: poweredBy },
      recommendation: "Remover header X-Powered-By.",
    });
  }

  return {
    findings,
    metadata: {
      status: res.status,
      final_url: res.url,
      detected_tech: detectTech(headers, server, poweredBy),
    },
  };
}

function detectTech(
  headers: Map<string, string>,
  server: string | null | undefined,
  poweredBy: string | null | undefined
): string[] {
  const tech: string[] = [];
  if (server) tech.push(server.split("/")[0].toLowerCase());
  if (poweredBy) tech.push(poweredBy.toLowerCase());
  if (headers.get("x-vercel-id") || headers.get("x-vercel-cache")) tech.push("vercel");
  if (headers.get("cf-ray") || headers.get("cf-cache-status")) tech.push("cloudflare");
  if (headers.get("x-amz-cf-id")) tech.push("aws-cloudfront");
  if (headers.get("x-nextjs-cache")) tech.push("nextjs");
  if (headers.get("x-shopify-stage")) tech.push("shopify");
  return Array.from(new Set(tech));
}
