import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { runAndPersistScan } from "@/lib/scanners/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (expected) {
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const sb = createServiceClient();
  const { data: sites, error } = await sb.from("sites").select("id, domain");
  if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });

  const results: Array<{ site_id: string; domain: string; ok: boolean; error?: string; score?: number }> = [];

  for (const site of sites ?? []) {
    try {
      const r = await runAndPersistScan({ siteId: site.id, domain: site.domain });
      results.push({ site_id: site.id, domain: site.domain, ok: true, score: r.score });
    } catch (err) {
      results.push({
        site_id: site.id,
        domain: site.domain,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: results.length,
    successful: results.filter((r) => r.ok).length,
    results,
  });
}
