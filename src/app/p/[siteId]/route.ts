import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(siteId)) {
    return new NextResponse("invalid site id", { status: 400 });
  }

  const sb = createServiceClient();
  const { data: policy } = await sb
    .from("policies")
    .select("generated_html, published_at")
    .eq("site_id", siteId)
    .maybeSingle();

  if (!policy?.generated_html) {
    return new NextResponse("policy not found", { status: 404 });
  }

  return new NextResponse(policy.generated_html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "index,follow",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
