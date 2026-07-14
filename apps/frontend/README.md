# frontend

Static Vite SPA for **Costly** — mobile-first PWA for tracking shared purchases. The same build is wrapped by the Tauri iOS app in `apps/mobile`.

## Purpose

- Client-side React UI with TanStack Router, Query, and Form.
- **Purchase data** via `@costly/api-client` HTTP calls with session cookies.
- **Auth** via `better-auth` client at `VITE_API_URL`.
- Installable as a PWA (vite-plugin-pwa + web manifest).

## Routes

| Path | Description |
| --- | --- |
| `/login` | Email OTP sign in |
| `/` | Dashboard — balance, settle all |
| `/purchases` | Purchase list |
| `/purchases/new` | Add a purchase |
| `/purchases/$id/edit` | Edit a purchase |

## Layout

```
src/
├── routes/           # File-based TanStack Router pages
├── lib/              # apiClient, purchases API, auth-client, session
├── components/       # App-specific UI
├── main.tsx          # Client entry
├── router.tsx        # Router factory
└── styles/tailwind.css
```

## Scripts

```bash
bun run dev              # Vite dev server on port 3000
bun run generate-routes  # Regenerate route tree after route changes
bun run build            # Production static build → dist/
bun run cf-typegen       # Regenerate ASSETS binding types
bun run preview          # Preview production build locally
```

## Deployment

Production deploys as a **Cloudflare Worker** (`costly-frontend`) that serves the Vite `dist/` build via static assets. See [`docs/architecture/deployment.md`](../../docs/architecture/deployment.md).

## Worker

`src/index.ts` delegates all requests to the `ASSETS` binding. Wrangler config sets `not_found_handling: "single-page-application"` for client-side routing.

```bash
bun run build        # Build dist/
bun run dev:worker   # Serve dist/ locally via wrangler (after build)
```

## Environment

Copy `.env.example` → `.env` for local dev:

| Variable | Purpose |
| --- | --- |
| `VITE_PUBLIC_URL` | Frontend app URL |
| `VITE_API_URL` | API worker URL (auth + purchase API calls) |

Set `VITE_API_URL` to match the API worker's public URL (local: `http://localhost:8787`; production: `https://costly-api.stizzle.workers.dev`).

All API requests use `credentials: 'include'` for session cookies.
