# Costly

A private, mobile-first app for two people to track shared purchases and settle up. Web PWA (Cloudflare Worker) + native iOS (Tauri), backed by a Cloudflare Worker API.

## Repository structure

```
apps/
  api/          # Cloudflare Worker — database, auth, purchase HTTP API
  frontend/     # Static Vite SPA — mobile-first PWA UI
  mobile/       # Tauri iOS shell wrapping frontend dist
packages/
  api-client/   # Type-safe Hono HTTP client
  components/   # Shared UI library (Subframe-generated)
docs/           # Product and domain documentation
```

## Stack

| Layer | Technologies |
| --- | --- |
| Monorepo | Bun workspaces, TypeScript, ESLint |
| API | Cloudflare Workers, Hono, Drizzle ORM, better-auth, Hyperdrive |
| Web | Vite SPA, TanStack Router/Query/Form, React 19, PWA, Tailwind v3 |
| iOS | Tauri v2, shared React UI in WebView |
| UI | `@costly/components` (Subframe) |

## Core principles

1. **Database lives in the API only** — clients call HTTP endpoints with session cookies.
2. **Purchase data via `/api/v1/*`** — authenticated REST routes; no service bindings.
3. **Email OTP auth only** — two users seeded from `ALLOWED_USERS`.
4. **Shared UI** — one frontend build for web PWA and Tauri iOS.

See [`docs/`](./docs/) and [`.cursor/rules/monorepo-architecture.mdc`](./.cursor/rules/monorepo-architecture.mdc).

## Getting started

```bash
bun install
```

### API

```bash
cd apps/api
cp .env.example .env
bun run db:up
bun run db:migrate
bun run dev:scheduled
```

### Web frontend

```bash
cd apps/frontend
cp .env.example .env   # VITE_PUBLIC_URL, VITE_API_URL
bun run dev
```

### iOS (macOS + Xcode)

```bash
cd apps/mobile
bun run dev:ios
```

See [`apps/mobile/README.md`](./apps/mobile/README.md) for physical device setup.

## Deployment

- **API:** Cloudflare Workers Builds on merge to `main`
- **Web PWA:** Cloudflare Workers Builds (`costly-frontend`)
- **iOS:** Local/Xcode builds via Tauri

See [`docs/architecture/deployment.md`](./docs/architecture/deployment.md).

## Checks

```bash
bun run check   # typecheck + lint
```
