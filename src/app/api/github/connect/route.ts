import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/cloudflare/encryption";
import { verifyToken } from "@/lib/github/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { token?: string };
  const token = (body.token ?? "").trim();
  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 400 });

  const verify = await verifyToken(token);
  if (!verify.ok || !verify.data) {
    return NextResponse.json(
      { error: "invalid_token", details: verify.error ?? "verification failed" },
      { status: 400 }
    );
  }

  const encrypted = encrypt(token);

  const { error } = await supabase.from("github_connections").upsert(
    {
      owner_id: user.id,
      github_user_login: verify.data.login,
      github_user_id: verify.data.id,
      encrypted_token: encrypted,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: "owner_id" }
  );

  if (error) {
    return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, login: verify.data.login });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase.from("github_connections").delete().eq("owner_id", user.id);
  if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
