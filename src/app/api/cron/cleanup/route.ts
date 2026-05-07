import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb.rpc("cleanup_old_data");

  if (error) {
    return NextResponse.json({ error: "cleanup_failed", detail: error.message }, { status: 500 });
  }

  const row = (data as Array<{
    scans_deleted: number;
    public_scans_deleted: number;
    consents_anonymized: number;
  }>)?.[0];

  return NextResponse.json({
    ok: true,
    cleaned_at: new Date().toISOString(),
    scans_deleted: row?.scans_deleted ?? 0,
    public_scans_deleted: row?.public_scans_deleted ?? 0,
    consents_anonymized: row?.consents_anonymized ?? 0,
  });
}
