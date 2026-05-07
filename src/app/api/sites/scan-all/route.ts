import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { runAndPersistScan } from "@/lib/scanners/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sb = createServiceClient();
  const { data: sites } = await sb.from("sites").select("id, domain").eq("owner_id", user.id);
  if (!sites || sites.length === 0) {
    return NextResponse.json({ error: "no_sites" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    sites.map((s) => runAndPersistScan({ siteId: s.id, domain: s.domain }))
  );

  const ok = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - ok;

  return NextResponse.json({
    ok: true,
    total: sites.length,
    successful: ok,
    failed,
    sites: results.map((r, i) => ({
      site_id: sites[i].id,
      domain: sites[i].domain,
      ok: r.status === "fulfilled",
      error: r.status === "rejected" ? String(r.reason).slice(0, 200) : undefined,
    })),
  });
}
