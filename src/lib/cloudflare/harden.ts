import {
  patchSetting,
  patchSecurityHeader,
  patchBotFightMode,
  activateDnssec,
} from "./client";

export interface HardenStep {
  setting: string;
  description: string;
  status: "success" | "failed" | "skipped";
  error?: string;
}

export interface HardenResult {
  steps: HardenStep[];
  successCount: number;
  failureCount: number;
}

export async function hardenZone(token: string, zoneId: string): Promise<HardenResult> {
  const steps: HardenStep[] = [];

  async function run(setting: string, description: string, fn: () => Promise<{ success: boolean; errors?: Array<{ message: string }> }>) {
    try {
      const res = await fn();
      if (res.success) {
        steps.push({ setting, description, status: "success" });
      } else {
        const err = res.errors?.[0]?.message || "unknown_error";
        steps.push({ setting, description, status: "failed", error: err });
      }
    } catch (err) {
      steps.push({
        setting,
        description,
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  await run("ssl", "SSL mode → Full (Strict)", () => patchSetting(token, zoneId, "ssl", "strict"));
  await run("always_use_https", "Always Use HTTPS → on", () => patchSetting(token, zoneId, "always_use_https", "on"));
  await run("min_tls_version", "Minimum TLS Version → 1.2", () => patchSetting(token, zoneId, "min_tls_version", "1.2"));
  await run("tls_1_3", "TLS 1.3 → on", () => patchSetting(token, zoneId, "tls_1_3", "on"));
  await run("automatic_https_rewrites", "Automatic HTTPS Rewrites → on", () => patchSetting(token, zoneId, "automatic_https_rewrites", "on"));
  await run("opportunistic_encryption", "Opportunistic Encryption → on", () => patchSetting(token, zoneId, "opportunistic_encryption", "on"));
  await run("security_level", "Security Level → high", () => patchSetting(token, zoneId, "security_level", "high"));
  await run("browser_check", "Browser Integrity Check → on", () => patchSetting(token, zoneId, "browser_check", "on"));
  await run("hsts", "HSTS preload (max-age 1y, includeSubDomains)", () =>
    patchSecurityHeader(token, zoneId, {
      enabled: true,
      max_age: 31_536_000,
      include_subdomains: true,
      preload: true,
      nosniff: true,
    })
  );
  await run("bot_fight_mode", "Bot Fight Mode → on", () => patchBotFightMode(token, zoneId, true));
  await run("dnssec", "DNSSEC → active", () => activateDnssec(token, zoneId));

  const successCount = steps.filter((s) => s.status === "success").length;
  const failureCount = steps.filter((s) => s.status === "failed").length;

  return { steps, successCount, failureCount };
}
