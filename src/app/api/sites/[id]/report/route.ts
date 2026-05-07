import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gradeColor } from "@/lib/scanners/score";
import type { Severity, Category } from "@/lib/scanners";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<Category, string> = {
  ssl: "SSL/TLS",
  headers: "Headers",
  dns: "DNS",
  exposure: "Exposure",
  phishing: "Phishing",
  dependencies: "Dependencies",
  tech: "Tech",
  general: "General",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
  info: "Info",
};

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#9ca3af",
  info: "#9ca3af",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const autoPrint = url.searchParams.get("print") !== "0";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("unauthorized", { status: 401 });

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, domain, owner_id, tags, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!site || site.owner_id !== user.id) {
    return new NextResponse("not found", { status: 404 });
  }

  const { data: lastScan } = await supabase
    .from("scans")
    .select("id, score, grade, category_scores, completed_at")
    .eq("site_id", site.id)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let findings: Array<{
    category: Category;
    severity: Severity;
    code: string;
    title: string;
    description: string | null;
    recommendation: string | null;
  }> = [];
  if (lastScan?.id) {
    const { data: f } = await supabase
      .from("scan_findings")
      .select("category, severity, code, title, description, recommendation")
      .eq("scan_id", lastScan.id);
    findings = (f as typeof findings) ?? [];
  }

  const score = lastScan?.score ?? null;
  const grade = lastScan?.grade ?? "?";
  const color = score != null ? gradeColor(grade as never) : "#9ca3af";
  const cs = (lastScan?.category_scores as Record<string, number> | null) ?? {};
  const reportDate = new Date().toISOString().slice(0, 10);
  const scanDate = lastScan?.completed_at
    ? new Date(lastScan.completed_at).toLocaleDateString("pt-PT")
    : "—";

  const sevOrder: Severity[] = ["critical", "high", "medium", "low", "info"];
  const groupedFindings = sevOrder
    .map((sev) => ({ sev, items: findings.filter((f) => f.severity === sev) }))
    .filter((g) => g.items.length > 0);

  const tagsHtml = (site.tags as string[] | null)?.length
    ? `<div class="tags">${(site.tags as string[]).map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}</div>`
    : "";

  const html = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<title>BlindAI Security Report — ${escapeHtml(site.domain)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* { box-sizing: border-box; }
body { font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace; background: #fff; color: #111827; max-width: 760px; margin: 0 auto; padding: 40px 32px; font-size: 13px; line-height: 1.55; }
.header { border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
.brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; letter-spacing: 1px; }
.brand .logo { color: #10b981; font-size: 20px; }
.meta { font-size: 11px; color: #6b7280; text-align: right; text-transform: uppercase; letter-spacing: 0.5px; }
h1 { font-size: 28px; margin: 0 0 4px; color: #111827; font-weight: 700; }
h2 { font-size: 16px; color: #111827; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px; }
.section-tag { color: #10b981; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
.domain { color: #6b7280; font-size: 14px; margin-bottom: 14px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.tag { font-size: 11px; padding: 2px 8px; background: #f3f4f6; border-radius: 4px; color: #374151; }
.score-hero { display: flex; align-items: flex-end; gap: 24px; padding: 24px; background: #f9fafb; border-radius: 8px; margin-bottom: 24px; border-left: 6px solid ${color}; }
.score-num { font-size: 80px; font-weight: 700; color: ${color}; line-height: 1; }
.score-grade { font-size: 56px; font-weight: 700; color: ${color}; line-height: 1; margin-left: auto; }
.score-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
.cat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.cat-row { padding: 10px 14px; background: #f9fafb; border-radius: 6px; display: flex; justify-content: space-between; align-items: baseline; }
.cat-row strong { font-size: 14px; }
.cat-bar { height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 6px; overflow: hidden; }
.cat-bar > div { height: 100%; }
.findings-group { margin-bottom: 16px; }
.sev-header { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; font-weight: 700; color: #fff; }
.finding { padding: 10px 14px; background: #f9fafb; border-radius: 6px; margin-bottom: 6px; border-left: 3px solid; }
.finding-title { font-weight: 700; color: #111827; font-size: 13px; }
.finding-meta { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
.finding-desc { font-size: 12px; color: #4b5563; margin-top: 6px; }
.finding-rec { font-size: 12px; color: #047857; background: #ecfdf5; padding: 6px 10px; border-radius: 4px; margin-top: 6px; border-left: 3px solid #10b981; }
.empty { text-align: center; padding: 32px; background: #f9fafb; color: #6b7280; border-radius: 6px; }
.footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
.no-print { margin-top: 24px; text-align: center; }
.no-print button { background: #10b981; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 700; cursor: pointer; font-family: inherit; text-transform: uppercase; letter-spacing: 1px; font-size: 11px; }

@media print {
  body { padding: 16mm; max-width: none; font-size: 11px; }
  h1 { font-size: 24px; }
  h2 { font-size: 14px; margin-top: 20px; }
  .score-num { font-size: 64px; }
  .score-grade { font-size: 44px; }
  .no-print { display: none; }
  .findings-group { page-break-inside: avoid; }
  .finding { page-break-inside: avoid; }
}
</style>
</head>
<body>
<div class="header">
  <div class="brand"><span class="logo">▊</span> BlindAI</div>
  <div class="meta">
    Security Report<br>
    Gerado: ${reportDate}
  </div>
</div>

<div class="section-tag">// site.report</div>
<h1>${escapeHtml(site.name)}</h1>
<div class="domain">${escapeHtml(site.domain)}</div>
${tagsHtml}

${
  score != null
    ? `<div class="score-hero">
  <div>
    <div class="score-label">Security Score</div>
    <div class="score-num">${score}</div>
  </div>
  <div class="score-grade">${escapeHtml(grade)}</div>
</div>`
    : `<div class="empty">Ainda sem scan completo. Corre um scan para gerar report.</div>`
}

${
  Object.keys(cs).length > 0
    ? `<h2>Breakdown por categoria</h2>
<div class="cat-grid">
  ${(["ssl", "headers", "dns", "exposure", "phishing"] as Category[])
    .filter((c) => cs[c] != null)
    .map((c) => {
      const s = cs[c] ?? 100;
      const sColor = s >= 85 ? "#10b981" : s >= 55 ? "#f59e0b" : "#ef4444";
      return `<div class="cat-row">
        <div style="flex:1">
          <strong>${CATEGORY_LABEL[c]}</strong>
          <div class="cat-bar"><div style="width:${s}%; background:${sColor}"></div></div>
        </div>
        <span style="color:${sColor}; font-weight:700; font-size:14px; margin-left:12px;">${s}</span>
      </div>`;
    })
    .join("")}
</div>`
    : ""
}

<h2>Findings ${findings.length > 0 ? `(${findings.length})` : ""}</h2>
${
  groupedFindings.length === 0
    ? `<div class="empty">Zero findings detectados — site limpo.</div>`
    : groupedFindings
        .map((g) => {
          const c = SEVERITY_COLOR[g.sev];
          return `<div class="findings-group">
        <div class="sev-header" style="background:${c}">${SEVERITY_LABEL[g.sev]} · ${g.items.length}</div>
        ${g.items
          .map(
            (f) => `<div class="finding" style="border-left-color:${c}">
            <div class="finding-title">${escapeHtml(f.title)}</div>
            <div class="finding-meta">${CATEGORY_LABEL[f.category]} · ${escapeHtml(f.code)}</div>
            ${f.description ? `<div class="finding-desc">${escapeHtml(f.description)}</div>` : ""}
            ${f.recommendation ? `<div class="finding-rec">→ ${escapeHtml(f.recommendation)}</div>` : ""}
          </div>`
          )
          .join("")}
      </div>`;
        })
        .join("")
}

<div class="footer">
  Gerado por BlindAI · 100% defensivo · ${reportDate}<br>
  Último scan: ${scanDate}
</div>

<div class="no-print">
  <button onclick="window.print()">$ Imprimir / Salvar PDF</button>
</div>

${autoPrint ? `<script>window.addEventListener('load', () => setTimeout(() => window.print(), 600));</script>` : ""}
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache",
    },
  });
}
