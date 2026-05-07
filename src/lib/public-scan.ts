import { createServiceClient } from "@/lib/supabase/server";
import { runScan } from "@/lib/scanners";
import type { Severity, Category } from "@/lib/scanners";

const CACHE_TTL_HOURS = 24;
const RATE_LIMIT_PER_IP_PER_HOUR = 10;

export interface PublicScanRow {
  id: string;
  domain: string;
  score: number | null;
  grade: string | null;
  category_scores: Record<string, number> | null;
  findings_summary: FindingsSummary | null;
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  detected_tech: string[] | null;
  duration_ms: number | null;
  created_at: string;
}

export interface FindingsSummary {
  by_category: Record<Category, { count: number; critical: number; high: number; medium: number; low: number }>;
  top_issues: Array<{ category: Category; severity: Severity; code: string; title: string }>;
}

export async function getCachedScan(domain: string): Promise<PublicScanRow | null> {
  const sb = createServiceClient();
  const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 3600 * 1000).toISOString();
  const { data } = await sb
    .from("public_scans")
    .select(
      "id, domain, score, grade, category_scores, findings_summary, total_findings, critical_findings, high_findings, medium_findings, low_findings, detected_tech, duration_ms, created_at"
    )
    .eq("domain", domain)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as unknown as PublicScanRow) ?? null;
}

export async function checkRateLimit(ipHash: string): Promise<{ allowed: boolean; recent: number }> {
  const sb = createServiceClient();
  const cutoff = new Date(Date.now() - 3600 * 1000).toISOString();
  const { count } = await sb
    .from("public_scans")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", cutoff);
  const recent = count ?? 0;
  return { allowed: recent < RATE_LIMIT_PER_IP_PER_HOUR, recent };
}

export async function runAndPersistPublicScan(opts: {
  domain: string;
  ipHash: string | null;
  ua: string | null;
}): Promise<PublicScanRow> {
  const sb = createServiceClient();
  const start = Date.now();
  const report = await runScan(opts.domain);
  const duration = Date.now() - start;

  const allFindings = [
    ...report.ssl.findings,
    ...report.headers.findings,
    ...report.dns.findings,
    ...report.exposure.findings,
    ...report.phishing.findings,
  ];

  const cats: Category[] = ["ssl", "headers", "dns", "exposure", "phishing"];
  const summary: FindingsSummary = {
    by_category: cats.reduce((acc, cat) => {
      const inCat = allFindings.filter((f) => f.category === cat);
      acc[cat] = {
        count: inCat.length,
        critical: inCat.filter((f) => f.severity === "critical").length,
        high: inCat.filter((f) => f.severity === "high").length,
        medium: inCat.filter((f) => f.severity === "medium").length,
        low: inCat.filter((f) => f.severity === "low").length,
      };
      return acc;
    }, {} as FindingsSummary["by_category"]),
    top_issues: allFindings
      .filter((f) => f.severity === "critical" || f.severity === "high")
      .slice(0, 5)
      .map((f) => ({ category: f.category, severity: f.severity, code: f.code, title: f.title })),
  };

  const detectedTech =
    ((report.headers.metadata as { detected_tech?: string[] } | undefined)?.detected_tech) ?? [];

  const row = {
    domain: opts.domain,
    score: report.score,
    grade: report.grade,
    category_scores: report.categoryScores,
    findings_summary: summary,
    total_findings: allFindings.length,
    critical_findings: allFindings.filter((f) => f.severity === "critical").length,
    high_findings: allFindings.filter((f) => f.severity === "high").length,
    medium_findings: allFindings.filter((f) => f.severity === "medium").length,
    low_findings: allFindings.filter((f) => f.severity === "low").length,
    detected_tech: detectedTech,
    ip_hash: opts.ipHash,
    ua: opts.ua,
    duration_ms: duration,
  };

  const { data, error } = await sb.from("public_scans").insert(row).select("*").single();
  if (error) throw new Error(`db_insert_failed: ${error.message}`);
  return data as PublicScanRow;
}
