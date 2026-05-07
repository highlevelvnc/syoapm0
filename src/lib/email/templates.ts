import { APP_URL } from "@/lib/constants";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function gradeColor(grade: string): string {
  if (grade === "A+" || grade === "A") return "#00FF41";
  if (grade === "B") return "#7AFFA0";
  if (grade === "C") return "#FFB300";
  if (grade === "D") return "#FF9933";
  return "#FF3344";
}

const SHELL_OPEN = `<!doctype html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0A0E0A; color: #B6FFCB; padding: 40px 20px; margin: 0;"><div style="max-width: 560px; margin: 0 auto; background: #0A0E0A; border: 1px solid rgba(0,255,65,0.4); border-radius: 8px; padding: 32px;">`;

const SHELL_FOOTER = `</div><div style="text-align:center; color: #006619; font-family: ui-monospace, monospace; font-size: 10px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.06em;">BlindAI · 100% defensivo · <a href="${APP_URL}/dashboard/settings/email" style="color: #006619; text-decoration:underline;">unsubscribe</a></div></body></html>`;

export function welcomeEmail(): { subject: string; html: string } {
  return {
    subject: "BlindAI — email alerts activados",
    html: `${SHELL_OPEN}
<div style="color: #00FF41; font-family: ui-monospace, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;">// notifications.email · enabled</div>
<h1 style="color: #E6FFEC; margin: 0 0 16px; font-size: 22px;">email alerts activos.</h1>
<p style="color: rgba(182,255,203,0.8); line-height: 1.6; font-size: 14px;">Vais receber email quando:</p>
<ul style="color: rgba(182,255,203,0.8); font-size: 13px; line-height: 1.7; padding-left: 18px; margin: 8px 0 24px;">
  <li>scan completo encontra critical/high findings</li>
  <li>SSL de algum site expira em &lt; 30 dias</li>
  <li>novo phishing variant é detectado</li>
  <li>achievement desbloqueado</li>
</ul>
<a href="${APP_URL}/dashboard" style="display:inline-block; background:#00FF41; color:#05080A; padding: 12px 20px; border-radius: 4px; font-weight: bold; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">$ abrir dashboard</a>
${SHELL_FOOTER}`,
  };
}

export function scanReportEmail(opts: {
  siteName: string;
  domain: string;
  siteId: string;
  score: number;
  grade: string;
  criticalCount: number;
  highCount: number;
  topIssues: Array<{ title: string; severity: string; category: string }>;
}): { subject: string; html: string } {
  const subject = `[${opts.grade}] ${opts.siteName}: ${opts.criticalCount + opts.highCount} issues · score ${opts.score}/100`;
  const color = gradeColor(opts.grade);

  const issuesHtml =
    opts.topIssues.slice(0, 5).length > 0
      ? `<div style="color: #00FF41; font-family: ui-monospace, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; margin: 24px 0 12px;">// top issues</div>
<ul style="padding: 0; margin: 0; list-style: none;">
${opts.topIssues
  .slice(0, 5)
  .map(
    (i) => `<li style="padding: 10px 12px; border-left: 3px solid ${i.severity === "critical" ? "#FF3344" : "#FFB300"}; background: rgba(0,255,65,0.03); margin-bottom: 6px;">
<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 2px;"><span style="color: ${i.severity === "critical" ? "#FF3344" : "#FFB300"}; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.06em;">${escapeHtml(i.severity)}</span><span style="color: #006619; font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em;">${escapeHtml(i.category)}</span></div>
<div style="color: #E6FFEC; font-size: 14px; font-weight: 600;">${escapeHtml(i.title)}</div>
</li>`
  )
  .join("")}
</ul>`
      : "";

  const html = `${SHELL_OPEN}
<div style="color: #00FF41; font-family: ui-monospace, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;">// scan.report</div>
<h1 style="color: #E6FFEC; margin: 0 0 4px; font-size: 22px;">${escapeHtml(opts.siteName)}</h1>
<p style="color: #006619; font-family: ui-monospace, monospace; margin: 0 0 24px; font-size: 13px;">${escapeHtml(opts.domain)}</p>
<div style="display: flex; align-items: baseline; gap: 16px; margin-bottom: 16px;">
  <div style="font-size: 56px; font-weight: bold; color: ${color}; line-height: 1; font-family: ui-monospace, monospace;">${opts.score}</div>
  <div style="font-size: 28px; font-weight: bold; color: ${color}; font-family: ui-monospace, monospace;">${opts.grade}</div>
</div>
<div style="color: rgba(182,255,203,0.8); margin-bottom: 8px; font-size: 13px;">
  <strong style="color: #FF3344;">${opts.criticalCount}</strong> critical · <strong style="color: #FFB300;">${opts.highCount}</strong> high
</div>
${issuesHtml}
<a href="${APP_URL}/dashboard/sites/${opts.siteId}" style="display:inline-block; background:#00FF41; color:#05080A; padding: 12px 20px; border-radius: 4px; font-weight: bold; text-decoration: none; margin-top: 24px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">$ ver report completo</a>
${SHELL_FOOTER}`;

  return { subject, html };
}
