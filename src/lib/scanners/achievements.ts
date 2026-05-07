import type { ScanReport } from "./types";

export interface AchievementDef {
  code: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  ssl_a_plus:       { code: "ssl_a_plus",       title: "SSL A+",            description: "TLS 1.3 + cert válido + zero issues SSL",         icon: "[A+]"     },
  headers_master:   { code: "headers_master",   title: "Headers Master",    description: "Todos os security headers configurados",         icon: "[HDR]"    },
  dns_hardened:     { code: "dns_hardened",     title: "DNS Hardened",      description: "SPF + DMARC + CAA + DNSSEC tudo OK",              icon: "[DNS]"    },
  phishing_clean:   { code: "phishing_clean",   title: "Phishing Clean",    description: "Zero typosquatting variants registadas",          icon: "[PHISH]"  },
  score_90_plus:    { code: "score_90_plus",    title: "Elite Score",       description: "Security score >= 90",                            icon: "[90+]"    },
  score_perfect:    { code: "score_perfect",    title: "Perfect Score",     description: "Security score = 100",                            icon: "[100]"    },
  zero_findings:    { code: "zero_findings",    title: "Zero Findings",     description: "Zero issues detectadas (excluindo info)",         icon: "[0X]"     },
  rgpd_compliant:   { code: "rgpd_compliant",   title: "RGPD Compliant",    description: "Banner instalado e a registar consents",         icon: "[RGPD]"   },
  cf_hardened:      { code: "cf_hardened",      title: "Cloudflare Hardened", description: "Cloudflare detectado à frente do site",        icon: "[CF]"     },
};

interface AchievementContext {
  report: ScanReport;
  hasConsents: boolean;
  detectedTech: string[];
  cloudflareHardened?: boolean;
}

export function deriveAchievements(ctx: AchievementContext): AchievementDef[] {
  const earned: AchievementDef[] = [];
  const { report, hasConsents, detectedTech, cloudflareHardened } = ctx;

  const allFindings = [
    ...report.ssl.findings,
    ...report.headers.findings,
    ...report.dns.findings,
    ...report.exposure.findings,
    ...report.phishing.findings,
  ];

  const sslIssues = report.ssl.findings.filter((f) => f.severity !== "info").length;
  const protocol = (report.ssl.metadata as { protocol?: string } | undefined)?.protocol;
  if (sslIssues === 0 && protocol === "TLSv1.3") {
    earned.push(ACHIEVEMENTS.ssl_a_plus);
  }

  const headerIssues = report.headers.findings.filter((f) => f.severity !== "info").length;
  if (headerIssues === 0) earned.push(ACHIEVEMENTS.headers_master);

  const dnsIssues = report.dns.findings.filter((f) => f.severity !== "info").length;
  if (dnsIssues === 0) earned.push(ACHIEVEMENTS.dns_hardened);

  const phishingIssues = report.phishing.findings.filter((f) => f.severity !== "info").length;
  if (phishingIssues === 0) earned.push(ACHIEVEMENTS.phishing_clean);

  if (report.score === 100) earned.push(ACHIEVEMENTS.score_perfect);
  else if (report.score >= 90) earned.push(ACHIEVEMENTS.score_90_plus);

  const totalNonInfoIssues = allFindings.filter((f) => f.severity !== "info").length;
  if (totalNonInfoIssues === 0) earned.push(ACHIEVEMENTS.zero_findings);

  if (hasConsents) earned.push(ACHIEVEMENTS.rgpd_compliant);
  if (detectedTech.includes("cloudflare") || cloudflareHardened) earned.push(ACHIEVEMENTS.cf_hardened);

  return earned;
}
