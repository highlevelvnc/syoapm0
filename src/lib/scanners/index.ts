import { scanHeaders } from "./headers";
import { scanDns } from "./dns";
import { scanSsl } from "./ssl";
import { scanExposure } from "./exposure";
import { calculateScore, calculateCategoryScores, gradeFromScore } from "./score";
import type { ScanReport } from "./types";

export async function runScan(domain: string): Promise<ScanReport> {
  const [ssl, headers, dns, exposure] = await Promise.all([
    scanSsl(domain),
    scanHeaders(domain),
    scanDns(domain),
    scanExposure(domain),
  ]);

  const allFindings = [
    ...ssl.findings,
    ...headers.findings,
    ...dns.findings,
    ...exposure.findings,
  ];

  const score = calculateScore(allFindings);
  const grade = gradeFromScore(score);
  const categoryScores = calculateCategoryScores(allFindings);

  return { ssl, headers, dns, exposure, score, grade, categoryScores };
}

export { gradeFromScore, gradeColor, calculateScore } from "./score";
export { deriveAchievements, ACHIEVEMENTS } from "./achievements";
export type { ScanReport, Finding, Severity, Category, Grade } from "./types";
