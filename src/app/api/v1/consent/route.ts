import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getClientIp, hashIp, normalizeDomain } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_ACTIONS = ["accept_all", "reject_all", "custom", "update"] as const;
const VALID_LANGS = ["pt-PT", "pt-BR", "en"] as const;
type Action = (typeof VALID_ACTIONS)[number];
type Lang = (typeof VALID_LANGS)[number];

interface Choices {
  necessary?: boolean;
  functional?: boolean;
  analytics?: boolean;
  marketing?: boolean;
}

interface ConsentPayload {
  site_id?: string;
  anon_uid?: string;
  action?: string;
  choices?: Choices;
  lang?: string;
  page_url?: string;
  banner_version?: string;
  ua?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS_HEADERS, "Access-Control-Max-Age": "86400" },
  });
}

export async function POST(req: NextRequest) {
  let body: ConsentPayload;
  try {
    body = (await req.json()) as ConsentPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: CORS_HEADERS });
  }

  if (!body.site_id || typeof body.site_id !== "string") {
    return NextResponse.json({ error: "missing_site_id" }, { status: 400, headers: CORS_HEADERS });
  }
  if (!body.anon_uid || typeof body.anon_uid !== "string") {
    return NextResponse.json({ error: "missing_anon_uid" }, { status: 400, headers: CORS_HEADERS });
  }
  if (!VALID_ACTIONS.includes(body.action as Action)) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400, headers: CORS_HEADERS });
  }
  if (!body.choices || typeof body.choices !== "object") {
    return NextResponse.json({ error: "invalid_choices" }, { status: 400, headers: CORS_HEADERS });
  }

  const sb = createServiceClient();

  const { data: site, error: siteErr } = await sb
    .from("sites")
    .select("id, domain")
    .eq("id", body.site_id)
    .maybeSingle();

  if (siteErr) {
    return NextResponse.json({ error: "db_error" }, { status: 500, headers: CORS_HEADERS });
  }
  if (!site) {
    return NextResponse.json({ error: "site_not_found" }, { status: 404, headers: CORS_HEADERS });
  }

  // Origin check soft (subdomains tipo www são permitidos). v2 endurece.
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  let originHost = "";
  try { originHost = new URL(origin).hostname; } catch {}
  const originDomain = originHost ? normalizeDomain(originHost) : "";
  const originMatches =
    !originDomain ||
    originDomain === site.domain ||
    originDomain.endsWith("." + site.domain) ||
    site.domain.endsWith("." + originDomain);

  const salt = process.env.IP_HASH_SALT || "blindai-default-salt-change-me";
  const ip = getClientIp(req.headers);
  const ipHash = ip !== "unknown" ? hashIp(ip, salt) : null;

  const lang = (VALID_LANGS as readonly string[]).includes(body.lang ?? "")
    ? (body.lang as Lang)
    : "en";
  const ua = (body.ua || req.headers.get("user-agent") || "").slice(0, 512);
  const pageUrl = (body.page_url || "").slice(0, 2048);

  const { error: insErr } = await sb.from("consents").insert({
    site_id: site.id,
    anon_uid: body.anon_uid.slice(0, 64),
    necessary: body.choices.necessary !== false,
    functional: !!body.choices.functional,
    analytics: !!body.choices.analytics,
    marketing: !!body.choices.marketing,
    action: body.action,
    ip_hash: ipHash,
    ua,
    lang,
    page_url: pageUrl,
    banner_version: body.banner_version || "v1",
  });

  if (insErr) {
    return NextResponse.json({ error: "db_error" }, { status: 500, headers: CORS_HEADERS });
  }

  return NextResponse.json(
    { ok: true, origin_match: originMatches },
    { status: 201, headers: CORS_HEADERS }
  );
}
