import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePolicy, type PolicyCountry, type PolicyInput } from "@/lib/policy/generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_COUNTRIES: PolicyCountry[] = ["PT", "BR", "EN", "ES", "FR"];

interface SaveBody {
  country?: string;
  operator_name?: string;
  contact_email?: string;
  contact_address?: string;
  collected_data?: string[];
  services?: string[];
}

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

  const body = (await req.json().catch(() => ({}))) as SaveBody;

  if (!body.country || !VALID_COUNTRIES.includes(body.country as PolicyCountry)) {
    return NextResponse.json({ error: "invalid_country" }, { status: 400 });
  }
  if (!body.operator_name?.trim()) return NextResponse.json({ error: "missing_operator_name" }, { status: 400 });
  if (!body.contact_email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact_email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id, domain, name")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "site_not_found" }, { status: 404 });

  const policyInput: PolicyInput = {
    domain: site.domain,
    siteName: site.name,
    country: body.country as PolicyCountry,
    operatorName: body.operator_name.trim(),
    contactEmail: body.contact_email.trim(),
    contactAddress: body.contact_address?.trim() || undefined,
    collectedData: body.collected_data ?? [],
    services: body.services ?? [],
  };

  const html = generatePolicy(policyInput);

  await supabase.from("policies").delete().eq("site_id", site.id);

  const { data, error } = await supabase
    .from("policies")
    .insert({
      site_id: site.id,
      country: policyInput.country,
      operator_name: policyInput.operatorName,
      contact_email: policyInput.contactEmail,
      contact_address: policyInput.contactAddress,
      collected_data: policyInput.collectedData,
      services: policyInput.services,
      generated_html: html,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "db_error", detail: error?.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, policy_id: data.id, public_url: `/p/${site.id}` });
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
    .from("policies")
    .delete()
    .eq("site_id", id)
    .in(
      "site_id",
      (await supabase.from("sites").select("id").eq("owner_id", user.id)).data?.map((s) => s.id) ?? []
    );

  if (error) return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
