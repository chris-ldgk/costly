# Costly

A private, mobile-first PWA for two people to track shared purchases and settle up. Built on Cloudflare Workers with TanStack Start (frontend) and Hono (API).

## Repository structure

```
apps/
  api/          # Cloudflare Worker — database, auth, purchase RPC
  frontend/     # TanStack Start app — mobile-first PWA UI
packages/
  api-client/   # Type-safe Hono RPC client (unused for Costly business logic)
  components/   # Shared UI library (Subframe-generated)
docs/           # Product and domain documentation
```

## Stack

| Layer    | Technologies                                                                       |
| -------- | ---------------------------------------------------------------------------------- |
| Monorepo | Bun workspaces, TypeScript, ESLint                                                 |
| Runtime  | Cloudflare Workers                                                                 |
| API      | Hono, Drizzle ORM, better-auth (magic link), PostgreSQL via Hyperdrive             |
| Frontend | TanStack Start/Router/Query/Form, React 19, PWA (vite-plugin-pwa), Tailwind CSS v3 |
| UI       | `@costly/components` (Subframe)                                                    |

## Core principles

1. **Database and auth live in the API only** — frontend calls the API via Cloudflare service bindings.
2. **Purchase data via RPC only** — no public REST API for purchases; auth uses proxied HTTP at `/api/auth/*`.
3. **Magic-link auth only** — two users seeded from `ALLOWED_USERS`; no public registration.
4. **Mobile-first PWA** — installable on iOS/Android home screens.

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
cp .env.example .env
bun run dev
```

Open http://localhost:3000, sign in with a seeded email, and check the API console for the magic link in development.

## Deployment

Workers are deployed through **[Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)** when changes merge to `main` — not via `package.json` deploy scripts. Preview builds are disabled (`preview_urls: false`; non-production branch builds off in the dashboard). See [`docs/architecture/deployment.md`](./docs/architecture/deployment.md) for per-Worker build settings (`costly-api`, `costly-frontend`).

### Checks

```bash
bun run check   # typecheck + lint
```
