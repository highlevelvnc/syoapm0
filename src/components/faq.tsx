interface QA {
  q: string;
  a: React.ReactNode;
}

const FAQS: QA[] = [
  {
    q: "Quanto tempo demora a configurar?",
    a: (
      <>
        Em ~30 segundos: signup, adicionas site, copias 1 linha de <code>&lt;script&gt;</code> e colas no
        <code> &lt;head&gt;</code>. O banner aparece imediatamente em qualquer stack — Next.js, WordPress,
        HTML cru, qualquer.
      </>
    ),
  },
  {
    q: "Funciona em sites em PHP / WordPress / Shopify?",
    a: (
      <>
        Sim. O widget é vanilla JS auto-contido. Não precisa de framework, build step ou plugin. Cola no
        cabeçalho e funciona.
      </>
    ),
  },
  {
    q: "Os meus dados (e dos meus clientes) são partilhados com terceiros?",
    a: (
      <>
        Não. Os IPs dos visitantes são <strong>hashed com SHA-256 + salt</strong> antes de serem guardados
        (nunca plaintext). Tokens de integração (Cloudflare, GitHub) são <strong>encrypted at rest com
        AES-256-GCM</strong>. Não vendemos dados. RGPD/LGPD compliance no próprio BlindAI.
      </>
    ),
  },
  {
    q: "Como cobre os ataques tipo SQL injection / DDoS / ransomware?",
    a: (
      <>
        Honestidade: BlindAI é a camada de <strong>monitoring + orquestração</strong>, não runtime shield.
        DDoS/WAF resolve-se via Cloudflare (orquestramos via API). SQL injection vem do código do site
        (detectamos padrões via scan, não rescrevemos). Ransomware ataca o servidor (fora do escopo).
        Construímos contra os <strong>vetores reais</strong> que afectam landing pages: phishing,
        typosquatting, headers em falta, SSL fraco, dados expostos, CVEs em deps.
      </>
    ),
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: (
      <>
        Sim. O plano free não tem renovação automática (não há cartão registado). Os planos pagos vão ser
        mensais sem fidelização — cancelas, fica até final do ciclo.
      </>
    ),
  },
  {
    q: "O scanner causa carga no meu site?",
    a: (
      <>
        Mínima. O scan diário faz 1 request HEAD + 1 GET nas paths sensíveis (.env, .git, etc) e queries
        DNS via DoH (Cloudflare 1.1.1.1). Demora ~10s e corre 1× por dia. Comparável a um crawler benigno.
      </>
    ),
  },
  {
    q: "Posso self-hostar?",
    a: (
      <>
        Open-source roadmap está em discussão. Para já, plano Enterprise inclui deploy próprio. Contacta{" "}
        <a href="mailto:vnc.oli@gmail.com" className="text-matrix-300 hover:text-ink-100 underline">
          vnc.oli@gmail.com
        </a>
        .
      </>
    ),
  },
];

export function Faq() {
  return (
    <ul className="space-y-3 max-w-3xl">
      {FAQS.map((qa, i) => (
        <li key={i} className="terminal-card p-5">
          <div className="text-ink-50 font-bold mb-2 flex items-baseline gap-2">
            <span className="text-matrix-500 text-xs">[{String(i + 1).padStart(2, "0")}]</span>
            <span>{qa.q}</span>
          </div>
          <div className="text-sm text-ink-300/70 leading-relaxed pl-7">{qa.a}</div>
        </li>
      ))}
    </ul>
  );
}
