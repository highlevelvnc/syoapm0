# BlindAI

> 100% defensive — RGPD/LGPD compliance + security em 1 linha de código.

Plataforma SaaS multi-tenant para proteger sites de empresas com cookie banner universal, security scanner, anti-phishing e alerts. Layout hacker/gamificado. Free tier para sempre nos primeiros 100 sites.

---

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind 3
- **Supabase** (Postgres + Auth magic link + Row Level Security)
- **Vercel Hobby** (deploy + cron)
- **Vanilla JS** no widget cliente (~3KB target gzip)

## O que está feito (Sprint 1 · v0.1)

- Cookie banner widget multi-língua (PT-PT / PT-BR / EN)
- 4 categorias: necessary / functional / analytics / marketing
- API `/api/v1/consent` com hash SHA-256 de IP (RGPD)
- Schema multi-tenant via RLS, histórico completo de consents (auditoria legal)
- Auth via Supabase magic link
- Dashboard hacker-style (overview, add site, ver log de consents)
- Landing page com demo interactiva do widget
- Security headers (X-Frame-Options, Referrer-Policy, etc.)

---

## Setup local · passo a passo

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar projecto Supabase

1. Vai a [https://supabase.com](https://supabase.com) → **New project**
2. Region: **`eu-west-2`** (London) ou **`eu-central-1`** (Frankfurt) — mais próximos para PT/UE
3. Define password forte para a DB
4. Copia da página **Settings → API**:
   - `Project URL`
   - `anon public` key
   - `service_role` key (mantém secreta)

### 3. Correr migrations

No **Supabase Dashboard → SQL Editor**, cola o conteúdo de [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) e executa.

Cria 3 tabelas (`profiles`, `sites`, `consents`), policies RLS, e trigger que auto-cria profile no signup.

### 4. Configurar .env.local

```bash
cp .env.example .env.local
```

Preenche `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
IP_HASH_SALT=$(openssl rand -hex 32)   # gera um aleatório
```

### 5. Configurar redirect URLs no Supabase

**Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** adicionar:
  - `http://localhost:3000/auth/callback`
  - `https://*.vercel.app/auth/callback` (preview deploys)
  - `https://blindai.vercel.app/auth/callback` (prod, quando tiver)

### 6. Correr local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), faz signup com magic link.

---

## Deploy Vercel

### 1. Push para GitHub

```bash
gh repo create blindai --private --source=. --remote=origin --push
```

### 2. Conectar Vercel

[https://vercel.com/new](https://vercel.com/new) → import o repo → deploy.

### 3. Adicionar env vars no Vercel

**Project → Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://blindai.vercel.app` (ou domínio próprio depois)
- `IP_HASH_SALT` → mesmo valor de local

Re-deploy: `vercel --prod`.

### 4. Actualizar Supabase com URL Vercel

Volta a **Authentication → URL Configuration** e adiciona o URL Vercel à lista.

---

## Como usar (cliente final)

Depois de criar conta no dashboard + adicionar um site, recebes um snippet. Cola em qualquer site (Next.js, WordPress, HTML cru, qualquer stack):

```html
<script
  src="https://blindai.vercel.app/cdn/w.js"
  data-site="<O-TEU-SITE-ID>"
  async
></script>
```

### API JavaScript

Disponível em `window.BlindAI`:

```js
window.BlindAI.show()    // reabrir o banner
window.BlindAI.reset()   // apagar consent e mostrar de novo
window.BlindAI.consent   // ler consent actual { necessary, functional, analytics, marketing }
```

### Evento custom

Para integração com Google Analytics, Meta Pixel, etc.:

```js
window.addEventListener('blindai:consent', (e) => {
  if (e.detail.choices.analytics) {
    // carregar GA aqui
  }
  if (e.detail.choices.marketing) {
    // carregar Meta Pixel aqui
  }
})
```

### Opções extra

```html
<!-- desactivar badge "Powered by BlindAI" (futura versão paga) -->
<script src=".../cdn/w.js" data-site="abc" data-badge="false" async></script>

<!-- API base custom (se BlindAI estiver self-hosted) -->
<script src=".../cdn/w.js" data-site="abc" data-api="https://blindai.exemplo.com" async></script>
```

---

## Estrutura

```
.
├── public/
│   └── cdn/
│       └── w.js                          # widget vanilla JS (servido via CDN Vercel)
├── src/
│   ├── app/
│   │   ├── api/v1/consent/route.ts       # endpoint que recebe consents
│   │   ├── auth/                         # login + callback Supabase
│   │   ├── dashboard/                    # área autenticada (RLS-protected)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                      # landing
│   ├── components/                       # UI hacker primitives
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── supabase/                     # clients: browser, server, middleware, service
│   │   └── utils.ts
│   └── middleware.ts                     # auth guard
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## Roadmap

- [x] **v0.1** — Cookie banner RGPD/LGPD universal · widget vanilla JS · dashboard
- [ ] **v0.2** — Security scanner: SSL Labs + Mozilla Observatory + DNS (DMARC/SPF/DKIM/CAA) + Lighthouse
- [ ] **v0.3** — Anti-phishing & typosquatting monitor (dnstwist + Google Safe Browsing)
- [ ] **v0.4** — Vulnerability scanner (CVEs em deps via GitHub Dependabot API)
- [ ] **v0.5** — Privacy policy / DPA generator por país (PT, BR, ES, FR...)
- [ ] **v1.0** — Dashboard gamificado: XP, achievements desbloqueáveis, leaderboard

## Filosofia

BlindAI é a camada de **monitoring + compliance**. Para protecção de runtime (DDoS / WAF / bot mitigation), os sites devem estar atrás do **Cloudflare free tier** — BlindAI orquestra via API, não substitui. Construir esses serviços do zero é inviável.

100% defensivo. Zero ofensivo.

---

## Licença

A definir. Default proprietária até decidir.
