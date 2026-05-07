import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { zone_id?: string; zone_name?: string };
  const zoneId = (body.zone_id ?? "").trim();
  const zoneName = (body.zone_name ?? "").trim();

  if (!zoneId || !zoneName) {
    return NextResponse.json({ error: "missing_zone" }, { status: 400 });
  }

  const { data: site, error } = await supabase
    .from("sites")
    .update({ cloudflare_zone_id: zoneId, cloudflare_zone_name: zoneName })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !site) {
    return NextResponse.json({ error: "update_failed", detail: error?.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("sites")
    .update({
      cloudflare_zone_id: null,
      cloudflare_zone_name: null,
      cloudflare_hardened_at: null,
      cloudflare_settings_applied: null,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
