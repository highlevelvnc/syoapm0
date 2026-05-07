import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/cloudflare/encryption";
import { hardenZone } from "@/lib/cloudflare/harden";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: site } = await supabase
    .from("sites")
    .select("id, owner_id, cloudflare_zone_id")
    .eq("id", id)
    .maybeSingle();

  if (!site) return NextResponse.json({ error: "site_not_found" }, { status: 404 });
  if (site.owner_id !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!site.cloudflare_zone_id) {
    return NextResponse.json({ error: "no_zone_linked" }, { status: 400 });
  }

  const { data: conn } = await supabase
    .from("cloudflare_connections")
    .select("encrypted_token")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!conn) return NextResponse.json({ error: "not_connected" }, { status: 400 });

  let token: string;
  try {
    token = decrypt(conn.encrypted_token);
  } catch {
    return NextResponse.json({ error: "decrypt_failed" }, { status: 500 });
  }

  const result = await hardenZone(token, site.cloudflare_zone_id);

  // service client para insert no log + update site
  const sb = createServiceClient();

  const logRows = result.steps.map((s) => ({
    site_id: site.id,
    action: "harden",
    setting: s.setting,
    status: s.status === "success" ? "success" : "failed",
    payload: { description: s.description },
    error: s.error ?? null,
  }));
  if (logRows.length > 0) {
    await sb.from("cloudflare_actions").insert(logRows);
  }

  await sb
    .from("sites")
    .update({
      cloudflare_hardened_at: new Date().toISOString(),
      cloudflare_settings_applied: result.steps,
    })
    .eq("id", site.id);

  return NextResponse.json({
    ok: true,
    success_count: result.successCount,
    failure_count: result.failureCount,
    steps: result.steps,
  });
}
