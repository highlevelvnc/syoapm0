import type { Finding, ScannerResult, Severity } from "./types";

interface PathCheck {
  path: string;
  severity: Severity;
  code: string;
  title: string;
  recommendation?: string;
}

const SENSITIVE_PATHS: PathCheck[] = [
  { path: "/.env", severity: "critical", code: "env_exposed", title: ".env exposto publicamente", recommendation: "Bloquear acesso a ficheiros .env via servidor web. Rotacionar TODAS as credentials que estavam dentro." },
  { path: "/.git/config", severity: "critical", code: "git_exposed", title: "Pasta .git/ exposta", recommendation: "Bloquear acesso a /.git/. Atacantes podem fazer dump de todo o código fonte." },
  { path: "/wp-config.php.bak", severity: "critical", code: "wp_config_bak", title: "Backup do wp-config exposto", recommendation: "Apagar wp-config.php.bak e bloquear .bak via servidor." },
  { path: "/backup.sql", severity: "critical", code: "sql_dump", title: "SQL dump público", recommendation: "Apagar dumps de DB do public root. Rotacionar credentials se foi exposto." },
  { path: "/database.sql", severity: "critical", code: "sql_dump_db", title: "SQL dump (database.sql) público", recommendation: "Apagar e rotacionar credentials." },
  { path: "/phpmyadmin/", severity: "high", code: "phpmyadmin", title: "phpMyAdmin público", recommendation: "Restringir phpMyAdmin por IP ou autenticação HTTP básica." },
  { path: "/server-status", severity: "high", code: "server_status", title: "Apache server-status exposto", recommendation: "Desactivar mod_status ou restringir a localhost." },
  { path: "/.htaccess", severity: "medium", code: "htaccess_exposed", title: ".htaccess exposto", recommendation: "Bloquear acesso a .htaccess (servidor web normalmente já bloqueia)." },
  { path: "/wp-admin/", severity: "info", code: "wp_admin", title: "WordPress admin acessível (informação)", recommendation: "Considerar restringir wp-admin por IP, ou usar 2FA + plugin de protecção." },
  { path: "/admin/", severity: "info", code: "admin_panel", title: "Painel /admin/ acessível (informação)" },
  { path: "/.DS_Store", severity: "low", code: "ds_store", title: ".DS_Store exposto", recommendation: "Apagar .DS_Store dos uploads (revela estrutura de directorias)." },
];

export async function scanExposure(domain: string): Promise<ScannerResult> {
  const findings: Finding[] = [];

  const checks = SENSITIVE_PATHS.map(async (p): Promise<Finding | null> => {
    try {
      const res = await fetch(`https://${domain}${p.path}`, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(5_000),
        headers: { "User-Agent": "BlindAI-Scanner/0.1 (+https://blindai.app)" },
      });
      if (res.status === 200) {
        const len = res.headers.get("content-length");
        return {
          category: "exposure",
          severity: p.severity,
          code: p.code,
          title: p.title,
          description: `Path acessível: ${p.path} (HTTP ${res.status}${len ? `, ${len} bytes` : ""})`,
          evidence: { path: p.path, status: res.status, content_length: len },
          recommendation: p.recommendation,
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(checks);
  for (const r of results) if (r) findings.push(r);

  return { findings };
}
