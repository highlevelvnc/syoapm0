import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAndPersistScan } from "@/lib/scanners/runner";

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

  const { data: site, error } = await supabase
    .from("sites")
    .select("id, domain, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !site) return NextResponse.json({ error: "site_not_found" }, { status: 404 });
  if (site.owner_id !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const result = await runAndPersistScan({ siteId: site.id, domain: site.domain });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: "scan_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
