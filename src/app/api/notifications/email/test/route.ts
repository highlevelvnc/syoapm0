import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: channel } = await supabase
    .from("notification_channels")
    .select("config")
    .eq("owner_id", user.id)
    .eq("kind", "email")
    .eq("enabled", true)
    .maybeSingle();

  if (!channel) {
    return NextResponse.json({ error: "no_email_channel" }, { status: 400 });
  }

  const config = channel.config as { email?: string };
  if (!config.email) return NextResponse.json({ error: "missing_email" }, { status: 400 });

  const tpl = welcomeEmail();
  const result = await sendEmail({ to: config.email, ...tpl });

  if (!result.success) {
    return NextResponse.json({ error: "send_failed", detail: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}
