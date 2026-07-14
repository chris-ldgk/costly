# Costly

A private, mobile-first PWA for two people to track shared purchases and settle up. Built on Cloudflare Workers with TanStack Start (frontend) and Hono (API).

## Repository structure

```
apps/
  api/          # Cloudflare Worker — database, auth, purchase RPC + HTTP v1
  frontend/     # TanStack Start app — mobile-first PWA UI
  mobile/       # Expo iOS app — HTTP client via @costly/api-client
packages/
  api-client/   # Type-safe Hono RPC client (mobile + external HTTP access)
  components/   # Shared UI library (Subframe-generated, web only)
docs/           # Product and domain documentation
```

## Stack

| Layer    | Technologies                                                                       |
| -------- | ---------------------------------------------------------------------------------- |
| Monorepo | Bun workspaces, TypeScript, ESLint                                                 |
| Runtime  | Cloudflare Workers                                                                 |
| API      | Hono, Drizzle ORM, better-auth (email OTP), PostgreSQL via Hyperdrive             |
| Frontend | TanStack Start/Router/Query/Form, React 19, PWA (vite-plugin-pwa), Tailwind CSS v3 |
| Mobile   | Expo Router, React Native, TanStack Query, NativeWind                              |
| UI       | `@costly/components` (Subframe, web); custom RN components (mobile)                |

## Core principles

1. **Database and auth live in the API only** — frontend uses service bindings; mobile uses HTTP.
2. **Dual purchase access** — RPC for web server functions; authenticated HTTP `/api/v1/*` for mobile.
3. **Email OTP auth only** — two users seeded from `ALLOWED_USERS`; no public registration.
4. **Mobile-first** — PWA (web) and native iOS app (Expo).

See [`docs/`](./docs/) for product rules and [`.cursor/rules/monorepo-architecture.mdc`](./.cursor/rules/monorepo-architecture.mdc) for technical architecture.

## Getting started

```bash
bun install
```

### API

```bash
cd apps/api
cp .env.example .env   # secrets + DATABASE_URL (do not use .dev.vars)
bun run db:up
bun run db:migrate
bun run dev:scheduled   # start API with /__scheduled test endpoint
bun run scheduled:run   # trigger seed (in another terminal, after dev is up)
```

Set public vars (`ALLOWED_USERS`, `BETTER_AUTH_URL`, etc.) in [`apps/api/wrangler.jsonc`](apps/api/wrangler.jsonc) `vars`.

### Frontend

```bash
cd apps/frontend
cp .env.example .env   # VITE_PUBLIC_URL, VITE_API_URL
bun run dev
```

`VITE_API_URL` is how the browser reaches the API (auth client); it must match `API_PUBLIC_URL` on the API worker. Server-side handlers use the `API` service binding instead.

Open http://localhost:3000, sign in with a seeded email, and check the API console for the OTP in development.

### Mobile (Expo iOS)

```bash
cd apps/mobile
cp .env.example .env   # EXPO_PUBLIC_API_URL
bun run ios
```

Set `EXPO_PUBLIC_API_URL` to the API worker URL (same as `VITE_API_URL`, e.g. `http://localhost:8787`). The API must be running for auth and data.

## Deployment

Workers are deployed through **[Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)** when changes merge to `main` — not via `package.json` deploy scripts. Preview builds are disabled (`preview_urls: false`; non-production branch builds off in the dashboard). See [`docs/architecture/deployment.md`](./docs/architecture/deployment.md) for per-Worker build settings (`costly-api`, `costly-frontend`).

### Checks

```bash
bun run check   # typecheck + lint
```
