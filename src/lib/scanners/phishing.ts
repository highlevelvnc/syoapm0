import type { Finding, ScannerResult } from "./types";

const TLDS_TO_CHECK = [
  ".com", ".net", ".org", ".co", ".io", ".info", ".biz",
  ".online", ".site", ".shop", ".app", ".dev",
  ".pt", ".es", ".fr", ".it", ".de", ".uk", ".eu",
];

const HOMOGLYPHS: Record<string, string[]> = {
  a: ["4"],
  b: ["8"],
  e: ["3"],
  i: ["1", "l", "j"],
  l: ["1", "i"],
  o: ["0"],
  s: ["5"],
  g: ["9"],
  q: ["g"],
  rn: ["m"],
  m: ["rn"],
};

function generateVariants(domain: string, maxVariants = 60): string[] {
  const lastDot = domain.lastIndexOf(".");
  if (lastDot < 1) return [];
  const base = domain.slice(0, lastDot);
  const tld = domain.slice(lastDot);
  const variants = new Set<string>();

  // omission
  for (let i = 0; i < base.length; i++) {
    if (base.length > 3) variants.add(base.slice(0, i) + base.slice(i + 1) + tld);
  }

  // repetition
  for (let i = 0; i < base.length; i++) {
    variants.add(base.slice(0, i + 1) + base[i] + base.slice(i + 1) + tld);
  }

  // adjacent swap
  for (let i = 0; i < base.length - 1; i++) {
    if (base[i] !== base[i + 1]) {
      variants.add(base.slice(0, i) + base[i + 1] + base[i] + base.slice(i + 2) + tld);
    }
  }

  // homoglyph replacement (single char)
  for (let i = 0; i < base.length; i++) {
    const ch = base[i];
    const subs = HOMOGLYPHS[ch];
    if (subs) {
      for (const sub of subs) {
        variants.add(base.slice(0, i) + sub + base.slice(i + 1) + tld);
      }
    }
  }

  // homoglyph: rn ↔ m
  for (let i = 0; i < base.length - 1; i++) {
    if (base.slice(i, i + 2) === "rn") {
      variants.add(base.slice(0, i) + "m" + base.slice(i + 2) + tld);
    }
  }
  for (let i = 0; i < base.length; i++) {
    if (base[i] === "m") {
      variants.add(base.slice(0, i) + "rn" + base.slice(i + 1) + tld);
    }
  }

  // hyphenation (interior)
  for (let i = 1; i < base.length; i++) {
    variants.add(base.slice(0, i) + "-" + base.slice(i) + tld);
  }

  // TLD swap (e.g. site.pt → site.com)
  for (const t of TLDS_TO_CHECK) {
    if (t !== tld) variants.add(base + t);
  }

  variants.delete(domain);

  return Array.from(variants).slice(0, maxVariants);
}

async function domainExists(domain: string): Promise<boolean> {
  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`;
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { Answer?: unknown[]; Status?: number };
    return Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return false;
  }
}

export async function scanPhishing(domain: string): Promise<ScannerResult> {
  const findings: Finding[] = [];
  const variants = generateVariants(domain);

  if (variants.length === 0) {
    return { findings, metadata: { variants_checked: 0, variants_existing: 0 } };
  }

  const BATCH_SIZE = 25;
  const existing: string[] = [];
  for (let i = 0; i < variants.length; i += BATCH_SIZE) {
    const batch = variants.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (v) => ({ v, exists: await domainExists(v) }))
    );
    for (const r of results) if (r.exists) existing.push(r.v);
  }

  for (const v of existing) {
    findings.push({
      category: "phishing",
      severity: "medium",
      code: "typosquat_active",
      title: `Domínio similar registado: ${v}`,
      description:
        "Variante typosquatting do teu domínio existe e resolve em DNS. Pode ser usada para phishing/spoofing.",
      evidence: { variant: v, original: domain },
      recommendation:
        "Considerar registar o domínio similar para evitar abuso, ou monitorizar para detectar mudanças.",
    });
  }

  return {
    findings,
    metadata: {
      variants_checked: variants.length,
      variants_existing: existing.length,
      existing_domains: existing,
    },
  };
}
