const CF_BASE = "https://api.cloudflare.com/client/v4";

export interface CFResponse<T = unknown> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
  result_info?: { page: number; per_page: number; total_pages: number; count: number; total_count: number };
}

export interface CFZone {
  id: string;
  name: string;
  status: string;
  account: { id: string; name: string };
  type: string;
  paused: boolean;
}

export interface CFTokenVerify {
  id: string;
  status: string;
  not_before?: string;
  expires_on?: string;
}

async function cfFetch<T>(token: string, path: string, init?: RequestInit): Promise<CFResponse<T>> {
  const res = await fetch(`${CF_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await res.json().catch(() => ({}))) as CFResponse<T>;
  return data;
}

export async function verifyToken(token: string): Promise<CFResponse<CFTokenVerify>> {
  return cfFetch<CFTokenVerify>(token, "/user/tokens/verify");
}

export async function listZones(token: string): Promise<CFResponse<CFZone[]>> {
  return cfFetch<CFZone[]>(token, "/zones?per_page=50");
}

export async function getZone(token: string, zoneId: string): Promise<CFResponse<CFZone>> {
  return cfFetch<CFZone>(token, `/zones/${zoneId}`);
}

export async function patchSetting(
  token: string,
  zoneId: string,
  setting: string,
  value: unknown
): Promise<CFResponse<unknown>> {
  return cfFetch(token, `/zones/${zoneId}/settings/${setting}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
}

export async function patchSecurityHeader(
  token: string,
  zoneId: string,
  hsts: { enabled: boolean; max_age: number; include_subdomains: boolean; preload: boolean; nosniff: boolean }
): Promise<CFResponse<unknown>> {
  return cfFetch(token, `/zones/${zoneId}/settings/security_header`, {
    method: "PATCH",
    body: JSON.stringify({
      value: {
        strict_transport_security: hsts,
      },
    }),
  });
}

export async function patchBotFightMode(
  token: string,
  zoneId: string,
  enabled: boolean
): Promise<CFResponse<unknown>> {
  return cfFetch(token, `/zones/${zoneId}/bot_management`, {
    method: "PUT",
    body: JSON.stringify({ fight_mode: enabled }),
  });
}

export async function getDnssec(token: string, zoneId: string): Promise<CFResponse<{ status: string }>> {
  return cfFetch<{ status: string }>(token, `/zones/${zoneId}/dnssec`);
}

export async function activateDnssec(token: string, zoneId: string): Promise<CFResponse<{ status: string }>> {
  return cfFetch<{ status: string }>(token, `/zones/${zoneId}/dnssec`, {
    method: "PATCH",
    body: JSON.stringify({ status: "active" }),
  });
}
