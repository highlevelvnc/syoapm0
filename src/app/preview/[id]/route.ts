import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { APP_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return new NextResponse("invalid site id", { status: 400 });
  }

  const sb = createServiceClient();
  const { data: site } = await sb
    .from("sites")
    .select("id, name, domain, theme_color, lang_default")
    .eq("id", id)
    .maybeSingle();

  if (!site) {
    return new NextResponse("site not found", { status: 404 });
  }

  const html = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>preview · ${escapeHtml(site.name)} · BlindAI</title>
<style>
  * { box-sizing: border-box }
  body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif; background: #f6f7f8; color: #333; margin: 0; padding: 40px 20px; min-height: 100vh; }
  .wrap { max-width: 720px; margin: 0 auto; }
  .preview-pill { display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #856404; margin-bottom: 18px; font-family: ui-monospace, "JetBrains Mono", monospace; font-weight: 600; }
  .preview-pill::before { content: "●"; color: #b8860b; }
  .card { background: #fff; border: 1px solid #e3e6ea; border-radius: 10px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04); margin-bottom: 16px; }
  h1 { margin: 0 0 6px; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; }
  .domain { color: #6b7280; font-size: 14px; margin-bottom: 22px; font-family: ui-monospace, monospace; }
  p { color: #4b5563; line-height: 1.65; margin: 0 0 14px; font-size: 15px; }
  code { background: #f3f4f6; padding: 2px 7px; border-radius: 4px; font-size: 13px; font-family: ui-monospace, "JetBrains Mono", monospace; color: #111827; }
  .actions { margin-top: 22px; padding-top: 18px; border-top: 1px solid #e5e7eb; font-size: 14px; }
  .actions a { color: #2563eb; text-decoration: none; font-weight: 500; }
  .actions a:hover { text-decoration: underline; }
  .lorem { color: #6b7280; font-size: 14px; line-height: 1.6; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="preview-pill">preview · banner test mode</div>
    <div class="card">
      <h1>${escapeHtml(site.name)}</h1>
      <div class="domain">${escapeHtml(site.domain)}</div>
      <p>Esta é uma página simulada para ver o banner de cookies BlindAI em acção. O banner aparece no fundo da página assim que carrega.</p>
      <p>Aceita, rejeita ou personaliza — cada acção regista um consent real na tua DB. Volta ao <a href="/dashboard/sites/${site.id}">dashboard</a> e dá refresh para veres a row a aparecer no log.</p>
      <p>Para reabrir o banner depois de escolheres, abre a consola do browser e corre <code>BlindAI.reset()</code>.</p>
      <div class="actions">
        <a href="/dashboard/sites/${site.id}">← voltar ao dashboard</a>
      </div>
    </div>
    <div class="card">
      <p class="lorem">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur euismod, ipsum ac dictum varius, urna est dignissim mauris, ut tempor ipsum tortor at metus. Sed congue, lacus eget tristique malesuada, lectus risus elementum sapien.</p>
      <p class="lorem">Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Phasellus tincidunt risus a justo cursus, vitae fringilla velit faucibus.</p>
    </div>
  </div>
  <script async src="${APP_URL}/cdn/w.js" data-site="${site.id}" data-lang="${escapeHtml(site.lang_default)}"></script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "no-store",
    },
  });
}
