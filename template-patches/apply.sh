#!/usr/bin/env bash
# BlindAI template patches · apply num projecto Next.js existente.
# Corre do root do projecto que queres patchar.
#
# Faz:
# 1. Copia blindai-banner.tsx para src/components/
# 2. Anexa env vars ao .env.example
# 3. Mostra diffs manuais para next.config.ts e app/layout.tsx

set -e

PATCH_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ ! -f "package.json" ]]; then
  echo "ERRO: corre este script do root de um projecto Next.js (sem package.json no cwd)"
  exit 1
fi

echo "→ a aplicar BlindAI patches em $(pwd)"

# 1. Componente
mkdir -p src/components
cp "$PATCH_DIR/blindai-banner.tsx" src/components/blindai-banner.tsx
echo "  [ok] src/components/blindai-banner.tsx"

# 2. Env vars
if [[ -f ".env.example" ]]; then
  if ! grep -q "NEXT_PUBLIC_BLINDAI_SITE_ID" .env.example; then
    echo "" >> .env.example
    cat "$PATCH_DIR/env.example" >> .env.example
    echo "  [ok] .env.example actualizado"
  else
    echo "  [skip] .env.example já tem NEXT_PUBLIC_BLINDAI_SITE_ID"
  fi
else
  cp "$PATCH_DIR/env.example" .env.example
  echo "  [ok] .env.example criado"
fi

# 3. Patches manuais — mostrar
cat <<'EOF'

─────────────────────────────────────────────
manuais — copia/cola tu próprio:
─────────────────────────────────────────────

1) next.config.ts
   Merge o conteúdo de:
EOF
echo "   $PATCH_DIR/next.config.security.ts"
cat <<'EOF'
   Pelo menos: poweredByHeader: false, e a function headers() com security headers.

2) src/app/layout.tsx (ou pages/_app.tsx em pages router)
   Adiciona:

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

3) Vercel
   Project → Settings → Environment Variables:
   NEXT_PUBLIC_BLINDAI_SITE_ID=<copia do dashboard BlindAI>

4) Footer do site
   <a href={`https://syoapm0.vercel.app/p/${process.env.NEXT_PUBLIC_BLINDAI_SITE_ID}`}>
     Política de Privacidade
   </a>

─────────────────────────────────────────────
EOF
