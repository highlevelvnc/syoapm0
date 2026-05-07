import { createServiceClient } from "@/lib/supabase/server";
import { runScan } from "./index";
import { deriveAchievements } from "./achievements";

interface RunOptions {
  siteId: string;
  domain: string;
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

    const detectedTech = ((report.headers.metadata as { detected_tech?: string[] } | undefined)?.detected_tech) ?? [];

    const achievements = deriveAchievements({
      report,
      hasConsents: (consentCount ?? 0) > 0,
      detectedTech,
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
