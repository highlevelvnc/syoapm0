import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/cloudflare/encryption";
import { listZones } from "@/lib/cloudflare/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: conn } = await supabase
    .from("cloudflare_connections")
    .select("encrypted_token")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!conn) return NextResponse.json({ error: "not_connected" }, { status: 404 });

  let token: string;
  try {
    token = decrypt(conn.encrypted_token);
  } catch {
    return NextResponse.json({ error: "decrypt_failed" }, { status: 500 });
  }

  const res = await listZones(token);
  if (!res.success) {
    return NextResponse.json(
      { error: "cf_api_failed", details: res.errors?.[0]?.message },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    zones: (res.result ?? []).map((z) => ({
      id: z.id,
      name: z.name,
      status: z.status,
      account_name: z.account?.name,
      paused: z.paused,
    })),
  });
}
