# frontend

TanStack Start **Costly** app — mobile-first PWA for tracking shared purchases.

## Purpose

- Server-rendered React UI that calls the API via **Cloudflare service bindings** and **server functions**.
- Proxies `/api/auth/*` to the API worker so session cookies stay on the frontend origin.
- Installable as a PWA (vite-plugin-pwa + web manifest).

## Routes

| Path | Description |
| --- | --- |
| `/login` | Magic-link sign in |
| `/` | Dashboard — balance, purchase list, settle all |
| `/purchases/new` | Add a new purchase |

## Layout

```
src/
├── routes/           # File-based pages
├── handlers/         # Server functions (purchases, session)
├── middlewares/      # Auth proxy, auth guard, lib injection
├── lib/auth-client.ts
└── start.ts          # CSRF + auth proxy + lib middleware
```

## Scripts

```bash
bun run dev              # Dev server on port 3000
bun run generate-routes  # Regenerate route tree after route changes
bun run cf-typegen       # Regenerate bindings (includes API RPC types)
bun run build            # Production build (includes service worker)
```

## Environment

Copy `.env.example` → `.env` for both secrets and public vars:

| Variable | Purpose |
| --- | --- |
| `SECRET_VALUE` | Server secret |
| `VITE_PUBLIC_URL` | App URL (auth client baseURL) |
| `VITE_API_URL` | API URL reference |
