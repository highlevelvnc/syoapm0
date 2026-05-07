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

  const body = (await req.json().catch(() => ({}))) as { owner?: string; repo?: string };
  const owner = (body.owner ?? "").trim();
  const repo = (body.repo ?? "").trim();
  if (!owner || !repo) return NextResponse.json({ error: "missing_repo" }, { status: 400 });

  const { error } = await supabase
    .from("sites")
    .update({ github_owner: owner, github_repo: repo })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
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
    .update({ github_owner: null, github_repo: null, github_last_scan_at: null, github_open_alerts: 0 })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
