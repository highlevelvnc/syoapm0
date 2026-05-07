export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Category = "ssl" | "headers" | "dns" | "exposure" | "tech" | "general" | "phishing" | "dependencies";
export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

export interface Finding {
  category: Category;
  severity: Severity;
  code: string;
  title: string;
  description?: string;
  evidence?: Record<string, unknown>;
  recommendation?: string;
}

export interface ScannerResult {
  findings: Finding[];
  metadata?: Record<string, unknown>;
}

export interface ScanReport {
  ssl: ScannerResult;
  headers: ScannerResult;
  dns: ScannerResult;
  exposure: ScannerResult;
  phishing: ScannerResult;
  score: number;
  grade: Grade;
  categoryScores: Record<Category, number>;
}

export const SEVERITY_PENALTIES: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 0,
};
