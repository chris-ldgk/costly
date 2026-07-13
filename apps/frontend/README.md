# frontend

TanStack Start **Costly** app — mobile-first PWA for tracking shared purchases.

## Purpose

- Server-rendered React UI that calls the API via **Cloudflare service bindings** and **server functions**.
- Proxies `/api/auth/*` to the API worker so session cookies stay on the frontend origin.
- Installable as a PWA (vite-plugin-pwa + web manifest).

## Routes

| Path             | Description                                    |
| ---------------- | ---------------------------------------------- |
| `/login`         | Magic-link sign in                             |
| `/`              | Dashboard — balance, purchase list, settle all |
| `/purchases/new` | Add a new purchase                             |

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

## Deployment

Production deploys run through **[Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)** when changes merge to `main`. There is no `deploy` script — Workers Builds runs `bun run build` then `npx wrangler deploy` from dashboard settings. See [`docs/architecture/deployment.md`](../../docs/architecture/deployment.md).

## Environment

Copy `.env.example` → `.env` for local dev bindings:

| Variable | Purpose |
| --- | --- |
| `VITE_PUBLIC_URL` | App URL |
| `VITE_API_URL` | API URL (auth client baseURL, HTTP fallback client) |

Do not use `.dev.vars` — Vite and Wrangler load `.env` for local development.

`workers_dev: true` and `preview_urls: false` in `wrangler.jsonc`. See [`docs/architecture/deployment.md`](../../docs/architecture/deployment.md) for Workers Builds settings.
