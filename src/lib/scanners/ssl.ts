import { connect } from "node:tls";
import type { Finding, ScannerResult } from "./types";

interface CertInfo {
  issuer: string;
  validFrom: Date;
  validTo: Date;
  daysUntilExpiry: number;
  protocol: string | null;
  subject: string;
}

function getCertInfo(domain: string): Promise<CertInfo | null> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: CertInfo | null) => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };
    try {
      const socket = connect(
        {
          host: domain,
          port: 443,
          servername: domain,
          rejectUnauthorized: false,
          timeout: 8_000,
        },
        () => {
          const cert = socket.getPeerCertificate(false);
          const protocol = socket.getProtocol();
          socket.end();
          if (!cert || !cert.valid_to) return done(null);
          const validTo = new Date(cert.valid_to);
          const validFrom = new Date(cert.valid_from);
          const flat = (v: string | string[] | undefined): string | undefined =>
            Array.isArray(v) ? v[0] : v;
          done({
            issuer: flat(cert.issuer?.O) || flat(cert.issuer?.CN) || "unknown",
            subject: flat(cert.subject?.CN) || domain,
            validFrom,
            validTo,
            daysUntilExpiry: Math.floor((validTo.getTime() - Date.now()) / 86_400_000),
            protocol,
          });
        }
      );
      socket.on("error", () => done(null));
      socket.on("timeout", () => {
        socket.destroy();
        done(null);
      });
    } catch {
      done(null);
    }
  });
}

export async function scanSsl(domain: string): Promise<ScannerResult> {
  const findings: Finding[] = [];
  const cert = await getCertInfo(domain);

  if (!cert) {
    findings.push({
      category: "ssl",
      severity: "critical",
      code: "ssl_unreachable",
      title: "SSL/TLS não disponível",
      description: "Não foi possível estabelecer ligação TLS na porta 443.",
      recommendation: "Verifica que o site corre em HTTPS na porta 443.",
    });
    return { findings };
  }

  if (cert.daysUntilExpiry < 0) {
    findings.push({
      category: "ssl",
      severity: "critical",
      code: "ssl_expired",
      title: `Certificado expirou há ${Math.abs(cert.daysUntilExpiry)} dias`,
      evidence: { valid_to: cert.validTo.toISOString() },
      recommendation: "Renovar certificado imediatamente.",
    });
  } else if (cert.daysUntilExpiry < 14) {
    findings.push({
      category: "ssl",
      severity: "high",
      code: "ssl_expiring_soon",
      title: `Certificado expira em ${cert.daysUntilExpiry} dias`,
      evidence: { valid_to: cert.validTo.toISOString() },
      recommendation: "Renovar agora ou configurar auto-renew (Let's Encrypt, Cloudflare).",
    });
  } else if (cert.daysUntilExpiry < 30) {
    findings.push({
      category: "ssl",
      severity: "medium",
      code: "ssl_expiring",
      title: `Certificado expira em ${cert.daysUntilExpiry} dias`,
      evidence: { valid_to: cert.validTo.toISOString() },
      recommendation: "Confirmar que auto-renew está configurado.",
    });
  }

  if (cert.protocol === "TLSv1" || cert.protocol === "TLSv1.1") {
    findings.push({
      category: "ssl",
      severity: "high",
      code: "ssl_old_protocol",
      title: `Protocolo TLS antigo: ${cert.protocol}`,
      evidence: { protocol: cert.protocol },
      recommendation: "Desactivar TLS 1.0 e 1.1; usar TLS 1.2+ apenas.",
    });
  } else if (cert.protocol === "SSLv3") {
    findings.push({
      category: "ssl",
      severity: "critical",
      code: "ssl_v3",
      title: "SSL v3 (vulnerável)",
      evidence: { protocol: cert.protocol },
      recommendation: "Desactivar SSLv3 imediatamente (POODLE attack).",
    });
  }

  return {
    findings,
    metadata: {
      issuer: cert.issuer,
      subject: cert.subject,
      valid_from: cert.validFrom.toISOString(),
      valid_to: cert.validTo.toISOString(),
      days_until_expiry: cert.daysUntilExpiry,
      protocol: cert.protocol,
    },
  };
}
