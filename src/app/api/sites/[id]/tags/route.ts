import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeTag(t: string): string {
  return t
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { tags?: string[] };
  if (!Array.isArray(body.tags)) {
    return NextResponse.json({ error: "invalid_tags" }, { status: 400 });
  }

  const cleanedTags = Array.from(
    new Set(
      body.tags
        .map((t) => (typeof t === "string" ? normalizeTag(t) : ""))
        .filter(Boolean)
    )
  ).slice(0, 12);

  const { error } = await supabase
    .from("sites")
    .update({ tags: cleanedTags })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, tags: cleanedTags });
}
