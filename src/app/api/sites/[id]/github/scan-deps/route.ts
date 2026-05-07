import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAndPersistDependabot } from "@/lib/github/dependabot";

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
    .select("id, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (!site) return NextResponse.json({ error: "site_not_found" }, { status: 404 });
  if (site.owner_id !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const result = await fetchAndPersistDependabot({ siteId: site.id, ownerId: user.id });
    return NextResponse.json({
      ok: true,
      alerts_count: result.alertsCount,
      findings_count: result.findings.length,
      scan_id: result.scanId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "scan_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
