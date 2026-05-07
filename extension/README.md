# BlindAI — Chrome Extension

Browser extension que mostra security score do site actual em 1 click. Sem signup. Aproveita o cache 24h compartilhado da API pública.

## Como funciona

1. Click no icon BlindAI na toolbar
2. Popup mostra o domain do tab actual
3. Faz fetch ao endpoint `/api/public/scan` da app principal
4. Se há cache (24h), mostra grade + findings imediatamente
5. Se não há cache, dá rate limit info ou prompt para abrir o report completo

## Instalar localmente (developer mode)

```
1. Abre chrome://extensions
2. Toggle "Developer mode" (canto superior direito)
3. Click "Load unpacked"
4. Escolhe esta pasta `extension/`
5. Aparece o icon BlindAI na toolbar
```

## Estrutura

```
extension/
├── manifest.json    # MV3, activeTab permission
├── popup.html       # UI com palette igual ao dashboard
├── popup.js         # query active tab → fetch /api/public/scan
└── README.md
```

## Publicar na Chrome Web Store

Requer:
- Conta Chrome Web Store Developer ($5 one-time)
- Icons 16/48/128 PNG (faltam — adicionar antes de publicar)
- Privacy policy URL (já temos: blindai.app)
- Description em loja

Status: developer-only por agora.

## Roadmap

- [ ] Icons PNG (16/48/128)
- [ ] Badge na toolbar com grade do site actual (chrome.action.setBadgeText)
- [ ] Light theme adaptive
- [ ] Settings page (custom blindai instance URL para self-host)
- [ ] Firefox/Safari port (manifest V3 compat)
