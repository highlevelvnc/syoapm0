import type { Finding, Grade, Category } from "./types";
import { SEVERITY_PENALTIES } from "./types";

export function calculateScore(findings: Finding[]): number {
  const totalPenalty = findings.reduce((sum, f) => sum + SEVERITY_PENALTIES[f.severity], 0);
  return Math.max(0, Math.min(100, 100 - totalPenalty));
}

export function calculateCategoryScores(allFindings: Finding[]): Record<Category, number> {
  const cats: Category[] = ["ssl", "headers", "dns", "exposure", "phishing", "tech", "general"];
  const out = {} as Record<Category, number>;
  for (const cat of cats) {
    const catFindings = allFindings.filter((f) => f.category === cat);
    out[cat] = calculateScore(catFindings);
  }
  return out;
}

export function gradeFromScore(score: number): Grade {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function gradeColor(grade: Grade): string {
  switch (grade) {
    case "A+":
    case "A":
      return "#00FF41";
    case "B":
      return "#7AFFA0";
    case "C":
      return "#FFB300";
    case "D":
      return "#FF9933";
    case "F":
      return "#FF3344";
  }
}
