import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/cloudflare/encryption";
import { listRepos } from "@/lib/github/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: conn } = await supabase
    .from("github_connections")
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

  const res = await listRepos(token);
  if (!res.ok || !res.data) {
    return NextResponse.json(
      { error: "github_api_failed", detail: res.error },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    repos: res.data.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      owner: r.owner.login,
      private: r.private,
      pushed_at: r.pushed_at,
    })),
  });
}
