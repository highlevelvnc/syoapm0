export type PolicyCountry = "PT" | "BR" | "EN" | "ES" | "FR";

export const DATA_TYPES = [
  { id: "name", label: "Nome / Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Telefone / Phone" },
  { id: "address", label: "Morada / Address" },
  { id: "ip", label: "Endereço IP / IP address" },
  { id: "cookies", label: "Cookies & device data" },
  { id: "browsing", label: "Histórico de navegação / Browsing history" },
  { id: "payment", label: "Dados de pagamento / Payment info" },
  { id: "messages", label: "Mensagens / Messages" },
  { id: "files", label: "Ficheiros / Uploaded files" },
] as const;

export const SERVICE_TYPES = [
  { id: "google-analytics", label: "Google Analytics", category: "analytics" },
  { id: "google-tag-manager", label: "Google Tag Manager", category: "analytics" },
  { id: "meta-pixel", label: "Meta Pixel (Facebook)", category: "marketing" },
  { id: "tiktok-pixel", label: "TikTok Pixel", category: "marketing" },
  { id: "stripe", label: "Stripe", category: "payment" },
  { id: "paypal", label: "PayPal", category: "payment" },
  { id: "mailchimp", label: "Mailchimp", category: "marketing" },
  { id: "hotjar", label: "Hotjar / Microsoft Clarity", category: "analytics" },
  { id: "google-ads", label: "Google Ads", category: "marketing" },
  { id: "intercom", label: "Intercom / Crisp", category: "support" },
] as const;

export interface PolicyInput {
  domain: string;
  siteName: string;
  country: PolicyCountry;
  operatorName: string;
  contactEmail: string;
  contactAddress?: string;
  collectedData: string[];
  services: string[];
}

const STRINGS = {
  PT: {
    title: "Política de Privacidade",
    lastUpdated: "Última actualização",
    s1: "1. Quem somos",
    s1body: (op: string, dom: string, addr: string) =>
      `Esta Política de Privacidade aplica-se ao website <strong>${dom}</strong>, operado por <strong>${op}</strong>${addr ? ` (${addr})` : ""}. Cumprimos com o Regulamento Geral sobre a Protecção de Dados (RGPD, UE 2016/679) e a Lei 58/2019.`,
    s2: "2. Dados que recolhemos",
    s2body: "Recolhemos os seguintes tipos de dados pessoais:",
    s3: "3. Para que usamos os dados",
    s3body:
      "Os dados são processados para: (a) prestação dos serviços que solicita; (b) cumprimento de obrigações legais (facturação, contabilidade); (c) comunicação consigo; (d) análise de uso do site (apenas com o seu consentimento via banner de cookies); (e) marketing direccionado (apenas com o seu consentimento).",
    s4: "4. Com quem partilhamos",
    s4body: "Os dados podem ser partilhados com os seguintes processadores terceiros (subprocessadores):",
    s4none: "Não partilhamos os seus dados com terceiros para além do necessário para a prestação dos serviços que contratou.",
    s5: "5. Os seus direitos",
    s5body:
      "Tem direito a: aceder aos seus dados, rectificá-los, apagá-los, opor-se ao processamento, portabilidade, e apresentar queixa à <a href='https://www.cnpd.pt' target='_blank' rel='noopener'>CNPD (Comissão Nacional de Protecção de Dados)</a>. Para exercer estes direitos, contacte-nos em",
    s6: "6. Cookies",
    s6body: "Usamos cookies essenciais (sempre activos) e cookies opcionais (funcionais, analíticos, marketing) que pode aceitar ou rejeitar via banner ao primeiro acesso. Pode reabrir o banner a qualquer momento.",
    s7: "7. Contacto",
    s7body: "Para questões sobre esta política ou os seus dados:",
    rights: ["aceder", "rectificar", "apagar", "opor-se", "portabilidade"],
  },
  BR: {
    title: "Política de Privacidade",
    lastUpdated: "Última atualização",
    s1: "1. Quem somos",
    s1body: (op: string, dom: string, addr: string) =>
      `Esta Política de Privacidade aplica-se ao website <strong>${dom}</strong>, operado por <strong>${op}</strong>${addr ? ` (${addr})` : ""}. Cumprimos com a Lei Geral de Proteção de Dados Pessoais (LGPD, Lei 13.709/2018).`,
    s2: "2. Dados que coletamos",
    s2body: "Coletamos os seguintes tipos de dados pessoais:",
    s3: "3. Para que usamos os dados",
    s3body:
      "Os dados são tratados para: (a) prestação dos serviços contratados; (b) cumprimento de obrigações legais (faturação, contabilidade); (c) comunicação com você; (d) análise de uso do site (mediante consentimento); (e) marketing direcionado (mediante consentimento).",
    s4: "4. Com quem compartilhamos",
    s4body: "Os dados podem ser compartilhados com os seguintes operadores terceirizados:",
    s4none: "Não compartilhamos seus dados com terceiros além do necessário para prestar os serviços contratados.",
    s5: "5. Seus direitos",
    s5body:
      "Você tem direito a: acessar seus dados, corrigi-los, anonimizá-los, eliminar dados, portabilidade, e apresentar reclamação à <a href='https://www.gov.br/anpd' target='_blank' rel='noopener'>ANPD (Autoridade Nacional de Proteção de Dados)</a>. Para exercer estes direitos, entre em contato em",
    s6: "6. Cookies",
    s6body: "Usamos cookies essenciais (sempre ativos) e cookies opcionais (funcionais, analíticos, marketing) que podem ser aceitos ou rejeitados via banner no primeiro acesso. Pode reabrir o banner a qualquer momento.",
    s7: "7. Contato",
    s7body: "Para questões sobre esta política ou seus dados:",
    rights: ["acessar", "corrigir", "anonimizar", "eliminar", "portabilidade"],
  },
  EN: {
    title: "Privacy Policy",
    lastUpdated: "Last updated",
    s1: "1. Who we are",
    s1body: (op: string, dom: string, addr: string) =>
      `This Privacy Policy applies to the website <strong>${dom}</strong>, operated by <strong>${op}</strong>${addr ? ` (${addr})` : ""}. We comply with the EU General Data Protection Regulation (GDPR 2016/679).`,
    s2: "2. Data we collect",
    s2body: "We collect the following types of personal data:",
    s3: "3. How we use the data",
    s3body:
      "Data is processed for: (a) providing the services you request; (b) compliance with legal obligations (invoicing, accounting); (c) communicating with you; (d) site usage analytics (only with your consent via cookie banner); (e) targeted marketing (only with your consent).",
    s4: "4. Who we share with",
    s4body: "Data may be shared with the following third-party processors:",
    s4none: "We do not share your data with third parties beyond what is necessary to provide the services you contracted.",
    s5: "5. Your rights",
    s5body:
      "You have the right to: access your data, rectify it, erase it, object to processing, data portability, and lodge a complaint with the relevant supervisory authority. To exercise these rights, contact us at",
    s6: "6. Cookies",
    s6body: "We use essential cookies (always on) and optional cookies (functional, analytics, marketing) which can be accepted or rejected via a banner on first visit. You can reopen the banner at any time.",
    s7: "7. Contact",
    s7body: "For questions about this policy or your data:",
    rights: ["access", "rectify", "erase", "object", "data portability"],
  },
  ES: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización",
    s1: "1. Quiénes somos",
    s1body: (op: string, dom: string, addr: string) =>
      `Esta Política de Privacidad se aplica al sitio web <strong>${dom}</strong>, operado por <strong>${op}</strong>${addr ? ` (${addr})` : ""}. Cumplimos con el RGPD (UE 2016/679) y la LOPDGDD.`,
    s2: "2. Datos que recopilamos",
    s2body: "Recopilamos los siguientes tipos de datos personales:",
    s3: "3. Para qué usamos los datos",
    s3body: "Los datos se procesan para: (a) prestación de servicios solicitados; (b) cumplimiento legal; (c) comunicación; (d) analítica de uso (con consentimiento); (e) marketing (con consentimiento).",
    s4: "4. Con quién compartimos",
    s4body: "Los datos pueden compartirse con los siguientes procesadores terceros:",
    s4none: "No compartimos tus datos con terceros más allá de lo necesario.",
    s5: "5. Tus derechos",
    s5body: "Tienes derecho a: acceder, rectificar, suprimir, oponerte al procesamiento, portabilidad, y presentar reclamación a la <a href='https://www.aepd.es' target='_blank' rel='noopener'>AEPD</a>. Para ejercerlos:",
    s6: "6. Cookies",
    s6body: "Usamos cookies esenciales y opcionales (funcionales, analíticas, marketing) que puedes aceptar o rechazar mediante banner.",
    s7: "7. Contacto",
    s7body: "Para preguntas sobre esta política:",
    rights: ["acceder", "rectificar", "suprimir", "oponerse", "portabilidad"],
  },
  FR: {
    title: "Politique de Confidentialité",
    lastUpdated: "Dernière mise à jour",
    s1: "1. Qui sommes-nous",
    s1body: (op: string, dom: string, addr: string) =>
      `Cette politique s'applique au site <strong>${dom}</strong>, exploité par <strong>${op}</strong>${addr ? ` (${addr})` : ""}. Nous respectons le RGPD (UE 2016/679) et la Loi Informatique et Libertés.`,
    s2: "2. Données collectées",
    s2body: "Nous collectons les types de données suivants:",
    s3: "3. Utilisation des données",
    s3body: "Les données sont traitées pour: (a) prestation de services; (b) obligations légales; (c) communication; (d) analytique (avec consentement); (e) marketing (avec consentement).",
    s4: "4. Partage",
    s4body: "Les données peuvent être partagées avec les sous-traitants suivants:",
    s4none: "Nous ne partageons pas vos données au-delà du nécessaire.",
    s5: "5. Vos droits",
    s5body: "Vous avez le droit d'accéder, rectifier, effacer, vous opposer, et la portabilité. Réclamation à la <a href='https://www.cnil.fr' target='_blank' rel='noopener'>CNIL</a>. Pour exercer:",
    s6: "6. Cookies",
    s6body: "Nous utilisons des cookies essentiels et optionnels (fonctionnels, analytiques, marketing) acceptables via le bandeau.",
    s7: "7. Contact",
    s7body: "Pour toute question:",
    rights: ["accéder", "rectifier", "effacer", "s'opposer", "portabilité"],
  },
} as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generatePolicy(input: PolicyInput): string {
  const t = STRINGS[input.country];
  const dataLabels = input.collectedData.map((id) => {
    const dt = DATA_TYPES.find((d) => d.id === id);
    return dt?.label ?? id;
  });
  const services = input.services.map((id) => SERVICE_TYPES.find((s) => s.id === id)).filter(Boolean) as Array<{
    id: string;
    label: string;
    category: string;
  }>;

  const dataList = dataLabels.length
    ? `<ul>${dataLabels.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`
    : "<p>—</p>";
  const servicesList = services.length
    ? `<ul>${services.map((s) => `<li><strong>${escapeHtml(s.label)}</strong> <span style="color:#6b7280">(${s.category})</span></li>`).join("")}</ul>`
    : `<p>${t.s4none}</p>`;
  const today = new Date().toISOString().slice(0, 10);
  const op = escapeHtml(input.operatorName);
  const dom = escapeHtml(input.domain);
  const addr = input.contactAddress ? escapeHtml(input.contactAddress) : "";
  const email = escapeHtml(input.contactEmail);

  return `<!doctype html>
<html lang="${input.country.toLowerCase()}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.title} — ${dom}</title>
<style>
* { box-sizing: border-box; }
body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif; max-width: 760px; margin: 0 auto; padding: 48px 24px; color: #1f2937; line-height: 1.65; }
h1 { font-size: 32px; margin: 0 0 6px; color: #0f172a; }
h2 { font-size: 20px; color: #0f172a; margin-top: 32px; }
.meta { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
ul { padding-left: 22px; }
li { margin-bottom: 4px; }
a { color: #0f766e; }
.footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
.footer a { color: #6b7280; }
</style>
</head>
<body>
  <h1>${t.title}</h1>
  <div class="meta">${t.lastUpdated}: ${today} · ${dom}</div>

  <h2>${t.s1}</h2>
  <p>${t.s1body(op, dom, addr)}</p>

  <h2>${t.s2}</h2>
  <p>${t.s2body}</p>
  ${dataList}

  <h2>${t.s3}</h2>
  <p>${t.s3body}</p>

  <h2>${t.s4}</h2>
  <p>${t.s4body}</p>
  ${servicesList}

  <h2>${t.s5}</h2>
  <p>${t.s5body} <a href="mailto:${email}">${email}</a>.</p>

  <h2>${t.s6}</h2>
  <p>${t.s6body}</p>

  <h2>${t.s7}</h2>
  <p>${op}<br>Email: <a href="mailto:${email}">${email}</a>${addr ? `<br>${addr}` : ""}</p>

  <div class="footer">
    Generated by <a href="https://blindai.dev" target="_blank" rel="noopener">BlindAI</a> — privacy policy generator.
  </div>
</body>
</html>`;
}
