import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeDomain, isValidDomain } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    domains?: string[];
    lang_default?: string;
    tags?: string[];
  };
  const langDefault = body.lang_default && ["pt-PT", "pt-BR", "en"].includes(body.lang_default)
    ? body.lang_default
    : "pt-PT";

  const normalizeTag = (t: string): string =>
    t
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32);

  const tagsArr = Array.isArray(body.tags)
    ? Array.from(
        new Set(
          body.tags.map((t) => (typeof t === "string" ? normalizeTag(t) : "")).filter(Boolean)
        )
      ).slice(0, 12)
    : [];

  const inputDomains = Array.isArray(body.domains) ? body.domains : [];
  const cleaned = Array.from(
    new Set(
      inputDomains
        .map((d) => normalizeDomain(typeof d === "string" ? d : ""))
        .filter((d) => d && isValidDomain(d))
    )
  );

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "no_valid_domains" }, { status: 400 });
  }
  if (cleaned.length > 100) {
    return NextResponse.json({ error: "too_many", limit: 100 }, { status: 400 });
  }

  const rows = cleaned.map((domain) => ({
    owner_id: user.id,
    domain,
    name: domain,
    theme_color: "#10b981",
    lang_default: langDefault,
    tags: tagsArr,
  }));

  const { data, error } = await supabase
    .from("sites")
    .upsert(rows, { onConflict: "owner_id,domain", ignoreDuplicates: true })
    .select("id, domain");

  if (error) {
    return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    requested: cleaned.length,
    inserted: data?.length ?? 0,
    sites: data ?? [],
  });
}
