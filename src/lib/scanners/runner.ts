import { createServiceClient } from "@/lib/supabase/server";
import { runScan } from "./index";
import { deriveAchievements } from "./achievements";
import { sendEmail } from "@/lib/email/resend";
import { scanReportEmail } from "@/lib/email/templates";
import type { Finding } from "./types";

interface RunOptions {
  siteId: string;
  domain: string;
}

async function sendScanAlert(opts: {
  siteId: string;
  scanId: string;
  score: number;
  grade: string;
  criticalCount: number;
  highCount: number;
  findings: Finding[];
}) {
  if (!process.env.RESEND_API_KEY) return;
  const sb = createServiceClient();

  const { data: site } = await sb
    .from("sites")
    .select("id, name, domain, owner_id")
    .eq("id", opts.siteId)
    .maybeSingle();
  if (!site) return;

  const { data: channel } = await sb
    .from("notification_channels")
    .select("config")
    .eq("owner_id", site.owner_id)
    .eq("kind", "email")
    .eq("enabled", true)
    .maybeSingle();
  if (!channel) return;

  const email = (channel.config as { email?: string } | null)?.email;
  if (!email) return;

  const topIssues = opts.findings
    .filter((f) => f.severity === "critical" || f.severity === "high")
    .slice(0, 5)
    .map((f) => ({ title: f.title, severity: f.severity, category: f.category }));

  const tpl = scanReportEmail({
    siteName: site.name,
    domain: site.domain,
    siteId: site.id,
    score: opts.score,
    grade: opts.grade,
    criticalCount: opts.criticalCount,
    highCount: opts.highCount,
    topIssues,
  });

  await sendEmail({ to: email, ...tpl }).catch(() => {});
}

export async function runAndPersistScan({ siteId, domain }: RunOptions) {
  const sb = createServiceClient();

  const { data: scanRow, error: insErr } = await sb
    .from("scans")
    .insert({ site_id: siteId, status: "running", started_at: new Date().toISOString() })
    .select("id")
    .single();
  if (insErr || !scanRow) throw new Error(`db_insert_scan_failed: ${insErr?.message}`);
  const scanId = scanRow.id as string;

  try {
    const report = await runScan(domain);

    const allFindings = [
      ...report.ssl.findings,
      ...report.headers.findings,
      ...report.dns.findings,
      ...report.exposure.findings,
      ...report.phishing.findings,
    ];

    if (allFindings.length > 0) {
      const findingRows = allFindings.map((f) => ({
        scan_id: scanId,
        category: f.category,
        severity: f.severity,
        code: f.code,
        title: f.title,
        description: f.description ?? null,
        evidence: f.evidence ?? null,
        recommendation: f.recommendation ?? null,
      }));
      await sb.from("scan_findings").insert(findingRows);
    }

    const completedAt = new Date().toISOString();
    await sb
      .from("scans")
      .update({
        status: "completed",
        completed_at: completedAt,
        score: report.score,
        grade: report.grade,
        category_scores: report.categoryScores,
      })
      .eq("id", scanId);

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: consentCount } = await sb
      .from("consents")
      .select("id", { count: "exact", head: true })
      .eq("site_id", siteId)
      .gte("created_at", since);

    const { data: siteRow } = await sb
      .from("sites")
      .select("cloudflare_hardened_at")
      .eq("id", siteId)
      .maybeSingle();

    const detectedTech = ((report.headers.metadata as { detected_tech?: string[] } | undefined)?.detected_tech) ?? [];

    const achievements = deriveAchievements({
      report,
      hasConsents: (consentCount ?? 0) > 0,
      detectedTech,
      cloudflareHardened: !!siteRow?.cloudflare_hardened_at,
    });

    if (achievements.length > 0) {
      const rows = achievements.map((a) => ({
        site_id: siteId,
        code: a.code,
        title: a.title,
        description: a.description,
        icon: a.icon,
      }));
      await sb.from("achievements").upsert(rows, { onConflict: "site_id,code", ignoreDuplicates: true });
    }

    const criticalCount = allFindings.filter((f) => f.severity === "critical").length;
    const highCount = allFindings.filter((f) => f.severity === "high").length;
    if (criticalCount + highCount > 0) {
      await sendScanAlert({ siteId, scanId, score: report.score, grade: report.grade, criticalCount, highCount, findings: allFindings });
    }

    return { scanId, score: report.score, grade: report.grade, findingsCount: allFindings.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sb
      .from("scans")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error: message.slice(0, 500),
      })
      .eq("id", scanId);
    throw err;
  }
}
