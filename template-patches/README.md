# BlindAI · Template Patches

Drop-in security improvements para qualquer projecto Next.js (App Router, 14+) que queiras integrar com BlindAI.

## O que está aqui

| Ficheiro | Para que serve |
|---|---|
| `next.config.security.ts` | Security headers (HSTS, X-Frame, X-Content-Type, Referrer-Policy, Permissions-Policy, poweredByHeader: false) |
| `blindai-banner.tsx` | Componente React que carrega o widget BlindAI condicional ao env var `NEXT_PUBLIC_BLINDAI_SITE_ID` |
| `env.example` | Env vars novas que precisas |
| `apply.sh` | Script que aplica os 3 acima num projecto existente |

## Aplicar num projecto novo (manual)

### 1. Security headers

Substitui ou merge o conteúdo de `next.config.security.ts` no teu `next.config.ts`. Garante que tens:

```ts
poweredByHeader: false,
async headers() { /* security headers */ }
```

### 2. BlindAI widget

Copia `blindai-banner.tsx` para `src/components/blindai-banner.tsx`. No teu `app/layout.tsx`:

```tsx
import { BlindaiBanner } from "@/components/blindai-banner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <BlindaiBanner />
      </body>
    </html>
  );
}
```

### 3. Env var

```bash
# .env.local
NEXT_PUBLIC_BLINDAI_SITE_ID=<o-id-do-site-no-dashboard-blindai>
```

Sem o env var, o componente é silenciosamente skipped — local dev não tem widget. Em production (Vercel), define a env var → widget activa.

### 4. Privacy policy link no footer

Adiciona um link para a policy publicada no BlindAI:

```tsx
<a href={`https://syoapm0.vercel.app/p/${process.env.NEXT_PUBLIC_BLINDAI_SITE_ID}`} target="_blank">
  Política de Privacidade
</a>
```

## Aplicar via script

Do root do projecto Next.js que queres patchar:

```bash
bash /Users/highlevel/highsecurity/template-patches/apply.sh
```

O script:
- Copia `blindai-banner.tsx` para `src/components/`
- Cria `.env.example.blindai` com a env var
- Mostra patches manuais para `next.config.ts` e `app/layout.tsx` (não os modifica automaticamente — diff first)

## Workflow recomendado

```
1. Criar repo novo no GitHub: gh repo create cliente-X --private --template <next-template>
2. Clone localmente
3. Correr este script de patches
4. Adicionar site no BlindAI dashboard, copiar ID
5. Definir NEXT_PUBLIC_BLINDAI_SITE_ID em Vercel env vars
6. Deploy
7. Banner aparece automaticamente, scan diário corre via cron BlindAI
```
