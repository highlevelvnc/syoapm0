import { createServiceClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/cloudflare/encryption";
import { listDependabotAlerts } from "./client";
import type { Finding, Severity } from "@/lib/scanners";

const SEV_MAP: Record<string, Severity> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  moderate: "medium",
  low: "low",
};

export async function fetchAndPersistDependabot(opts: {
  siteId: string;
  ownerId: string;
}): Promise<{ alertsCount: number; findings: Finding[]; scanId: string }> {
  const sb = createServiceClient();

  const { data: site } = await sb
    .from("sites")
    .select("id, github_owner, github_repo, name")
    .eq("id", opts.siteId)
    .maybeSingle();
  if (!site || !site.github_owner || !site.github_repo) {
    throw new Error("github_not_linked");
  }

  const { data: conn } = await sb
    .from("github_connections")
    .select("encrypted_token")
    .eq("owner_id", opts.ownerId)
    .maybeSingle();
  if (!conn) throw new Error("github_not_connected");

  const token = decrypt(conn.encrypted_token);
  const result = await listDependabotAlerts(token, site.github_owner, site.github_repo);

  if (!result.ok || !result.data) {
    if (result.status === 404) {
      throw new Error("dependabot_not_enabled_or_no_access");
    }
    throw new Error(result.error || "fetch_failed");
  }

  const alerts = result.data;

  const findings: Finding[] = alerts.map((alert) => ({
    category: "dependencies",
    severity: SEV_MAP[alert.security_advisory.severity.toLowerCase()] ?? "low",
    code: `dep_${alert.security_advisory.ghsa_id}`,
    title: `${alert.dependency.package.name}: ${alert.security_advisory.summary}`,
    description:
      alert.security_advisory.description?.slice(0, 500) ||
      `${alert.dependency.package.name} (${alert.dependency.package.ecosystem}) tem CVE conhecido.`,
    evidence: {
      ghsa_id: alert.security_advisory.ghsa_id,
      cve_id: alert.security_advisory.cve_id,
      package: alert.dependency.package.name,
      ecosystem: alert.dependency.package.ecosystem,
      manifest_path: alert.dependency.manifest_path,
      vulnerable_range: alert.security_vulnerability.vulnerable_version_range,
      cvss_score: alert.security_advisory.cvss?.score,
      url: alert.html_url,
    },
    recommendation: alert.security_vulnerability.first_patched_version
      ? `Update ${alert.dependency.package.name} para >= ${alert.security_vulnerability.first_patched_version.identifier}`
      : `Sem patch disponível ainda. Detalhe: ${alert.html_url}`,
  }));

  const { data: scanRow, error: scanErr } = await sb
    .from("scans")
    .insert({
      site_id: site.id,
      status: "completed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      score: null,
      grade: null,
      category_scores: null,
    })
    .select("id")
    .single();
  if (scanErr || !scanRow) throw new Error(`db_insert_scan_failed: ${scanErr?.message}`);

  const scanId = scanRow.id as string;

  if (findings.length > 0) {
    const findingRows = findings.map((f) => ({
      scan_id: scanId,
      category: f.category,
      severity: f.severity,
      code: f.code,
      title: f.title,
      description: f.description,
      evidence: f.evidence,
      recommendation: f.recommendation,
    }));
    await sb.from("scan_findings").insert(findingRows);
  }

  await sb
    .from("sites")
    .update({
      github_last_scan_at: new Date().toISOString(),
      github_open_alerts: alerts.length,
    })
    .eq("id", site.id);

  return { alertsCount: alerts.length, findings, scanId };
}
