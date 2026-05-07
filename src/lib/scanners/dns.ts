import type { Finding, ScannerResult } from "./types";

interface DohAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}
interface DohResponse {
  Status: number;
  AD?: boolean;
  Answer?: DohAnswer[];
}

async function doh(name: string, type: string): Promise<DohResponse | null> {
  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as DohResponse;
  } catch {
    return null;
  }
}

function unquote(s: string): string {
  return s.replace(/^"+|"+$/g, "").replace(/" +"/g, "");
}

export async function scanDns(domain: string): Promise<ScannerResult> {
  const findings: Finding[] = [];

  const [aRecords, txtRecords, dmarcTxt, caaRecords, soaRecord] = await Promise.all([
    doh(domain, "A"),
    doh(domain, "TXT"),
    doh(`_dmarc.${domain}`, "TXT"),
    doh(domain, "CAA"),
    doh(domain, "SOA"),
  ]);

  if (!aRecords?.Answer || aRecords.Answer.length === 0) {
    findings.push({
      category: "dns",
      severity: "critical",
      code: "no_a_record",
      title: "Domínio não resolve (A record em falta)",
      description: "O DNS não tem registo A para este domínio.",
    });
    return { findings };
  }

  const txtList = (txtRecords?.Answer ?? []).map((r) => unquote(r.data));
  const spfRecord = txtList.find((d) => d.toLowerCase().startsWith("v=spf1"));
  if (!spfRecord) {
    findings.push({
      category: "dns",
      severity: "high",
      code: "spf_missing",
      title: "SPF em falta",
      description: "Sem SPF, qualquer um pode enviar emails fingindo ser este domínio.",
      recommendation: 'TXT: v=spf1 -all (se não envia email) ou v=spf1 include:_spf.google.com -all',
    });
  } else {
    if (spfRecord.endsWith("+all")) {
      findings.push({
        category: "dns",
        severity: "high",
        code: "spf_too_permissive",
        title: "SPF aceita qualquer enviador (+all)",
        evidence: { spf: spfRecord },
        recommendation: "Mudar +all para -all (hardfail) ou ~all (softfail).",
      });
    } else if (spfRecord.endsWith("?all")) {
      findings.push({
        category: "dns",
        severity: "medium",
        code: "spf_neutral",
        title: "SPF é neutro (?all)",
        evidence: { spf: spfRecord },
        recommendation: "Mudar ?all para ~all ou -all.",
      });
    }
  }

  const dmarcList = (dmarcTxt?.Answer ?? []).map((r) => unquote(r.data));
  const dmarc = dmarcList.find((d) => d.toLowerCase().startsWith("v=dmarc1"));
  if (!dmarc) {
    findings.push({
      category: "dns",
      severity: "high",
      code: "dmarc_missing",
      title: "DMARC em falta",
      description: "DMARC instrui mail servers a rejeitar emails fraudulentos.",
      recommendation: "TXT em _dmarc.dominio: v=DMARC1; p=quarantine; rua=mailto:dmarc@dominio.com",
    });
  } else {
    const policy = dmarc.match(/p=(\w+)/i)?.[1]?.toLowerCase();
    if (policy === "none") {
      findings.push({
        category: "dns",
        severity: "medium",
        code: "dmarc_p_none",
        title: "DMARC com policy=none (apenas monitor)",
        evidence: { dmarc },
        recommendation: "Após validar com p=none, mudar para p=quarantine ou p=reject.",
      });
    }
  }

  const caaAnswers = caaRecords?.Answer ?? [];
  if (caaAnswers.length === 0) {
    findings.push({
      category: "dns",
      severity: "low",
      code: "caa_missing",
      title: "CAA em falta",
      description: "CAA limita quais Certificate Authorities podem emitir certs para este domínio.",
      recommendation: 'CAA: 0 issue "letsencrypt.org" (substitui pela CA usada).',
    });
  }

  if (!soaRecord?.AD) {
    findings.push({
      category: "dns",
      severity: "medium",
      code: "dnssec_disabled",
      title: "DNSSEC desactivado",
      description: "DNSSEC previne envenenamento de DNS cache (cache poisoning).",
      recommendation: "Activar DNSSEC no registrar do domínio (gestão DNS).",
    });
  }

  return {
    findings,
    metadata: {
      a_records: aRecords?.Answer?.length ?? 0,
      has_spf: !!spfRecord,
      has_dmarc: !!dmarc,
      has_caa: caaAnswers.length > 0,
      dnssec: !!soaRecord?.AD,
    },
  };
}
