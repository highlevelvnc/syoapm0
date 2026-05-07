import { NextRequest, NextResponse } from "next/server";
import { getClientIp, hashIp, normalizeDomain, isValidDomain } from "@/lib/utils";
import { getCachedScan, checkRateLimit, runAndPersistPublicScan } from "@/lib/public-scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  let body: { domain?: string };
  try {
    body = (await req.json()) as { domain?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: CORS_HEADERS });
  }

  const cleanDomain = normalizeDomain(body.domain ?? "");
  if (!cleanDomain || !isValidDomain(cleanDomain)) {
    return NextResponse.json({ error: "invalid_domain" }, { status: 400, headers: CORS_HEADERS });
  }

  const cached = await getCachedScan(cleanDomain);
  if (cached) {
    return NextResponse.json(
      { ok: true, cached: true, scan: cached },
      { status: 200, headers: CORS_HEADERS }
    );
  }

  const salt = process.env.IP_HASH_SALT || "blindai-default-salt-change-me";
  const ip = getClientIp(req.headers);
  const ipHash = ip !== "unknown" ? hashIp(ip, salt) : null;

  if (ipHash) {
    const { allowed, recent } = await checkRateLimit(ipHash);
    if (!allowed) {
      return NextResponse.json(
        { error: "rate_limit_exceeded", recent_scans: recent, retry_after_minutes: 60 },
        { status: 429, headers: CORS_HEADERS }
      );
    }
  }

  const ua = (req.headers.get("user-agent") || "").slice(0, 512);

  try {
    const scan = await runAndPersistPublicScan({ domain: cleanDomain, ipHash, ua });
    return NextResponse.json(
      { ok: true, cached: false, scan },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "scan_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
