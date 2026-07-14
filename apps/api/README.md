# @costly/api

Cloudflare Worker backend for **Costly** — auth, database access, and purchase RPC.

## Purpose

- The **only** workspace that talks to the database and Cloudflare platform bindings.
- **better-auth** email OTP authentication at `/api/auth/*`.
- Purchase operations exposed via **RPC only** on `FrontendEntrypoint` — no public REST routes for purchases.

```
handlers/purchases.ts  ← shared business logic
  └── FrontendEntrypoint.createPurchase()  ← RPC (service binding)
```

## Stack

| Concern    | Technology                                                                             |
| ---------- | -------------------------------------------------------------------------------------- |
| Runtime    | Cloudflare Workers                                                                     |
| HTTP       | Hono (auth routes + CORS)                                                              |
| Auth       | better-auth + Drizzle adapter, email OTP plugin; codes via Resend + React Email |
| Database   | Drizzle ORM + PostgreSQL via Hyperdrive (`DB` binding) |
| Validation | Zod                                                                                    |

## Layout

```
src/
├── index.ts          # fetch handler + FrontendEntrypoint RPC
├── auth/             # better-auth config, allowed-users helper
├── emails/           # React Email templates + Resend send helpers
├── handlers/         # Purchase business logic
├── routers/          # Hono routes (auth + CORS)
├── schema/           # Auth tables (CLI-generated) + purchases/settlements
├── scripts/          # auth CLI config for schema regen
└── utils/
```

## Scripts

```bash
bun run dev          # Wrangler dev
bun run db:up        # Start local Postgres
bun run db:migrate   # Apply migrations (local DATABASE_URL from .env)
bun run db:migrate:production  # Apply migrations to production (Tailscale TCP)
bun run dev:scheduled  # Wrangler dev + run seed cron once on startup
bun run cf-typegen   # Regenerate CloudflareBindings
```

## Deployment

Production deploys run through **[Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)** when changes merge to `main`. There is no `deploy` script in this workspace — configure build settings in the dashboard for the `costly-api` Worker. See [`docs/architecture/deployment.md`](../../docs/architecture/deployment.md).

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | `.env` (from `.env.example`) | Auth signing secret (Wrangler dev) |
| `DATABASE_URL` | `.env` (from `.env.example`) | Drizzle Kit migrations/seed only |
| `PUBLIC_URL`         | `wrangler.jsonc` `vars`      | API public URL                              |
| `CORS_ORIGINS`       | `wrangler.jsonc` `vars`      | Allowed frontend origins                    |
| `BETTER_AUTH_URL`    | `wrangler.jsonc` `vars`      | Frontend URL for auth callbacks             |
| `API_PUBLIC_URL`     | `wrangler.jsonc` `vars`      | API public URL (`trustedOrigins`; must match frontend `VITE_API_URL`) |
| `COOKIE_DOMAIN`      | `wrangler.jsonc` `vars`      | Shared auth cookie domain                   |
| `ALLOWED_USERS`      | `wrangler.jsonc` `vars`      | JSON array of two `{ email, name }` objects |
| `RESEND_FROM_EMAIL`  | `wrangler.jsonc` `vars`      | Verified Resend sender (`Costly <login@domain>`) |
| `RESEND_API_KEY`     | `.env` / dashboard secret | Resend API key (required in production) |
| `NODE_ENV`           | `wrangler.jsonc` `vars`      | `development` / `production`                |

Local dev: copy `.env.example` → `.env` for secrets and `DATABASE_URL`. Public vars come from `wrangler.jsonc`. **Do not use `.dev.vars`** — Wrangler loads `.env` when no `.dev.vars` file exists.

Both workers have `workers_dev: true`, `preview_urls: false`, and Smart Placement enabled (`placement.mode: "smart"`). See [`docs/architecture/deployment.md`](../../docs/architecture/deployment.md) for Workers Builds and preview-build settings.

User accounts are seeded automatically by the scheduled Worker handler (`handlers/seed-users.ts`, cron `0 * * * *`). It reads `ALLOWED_USERS` from Worker env and upserts missing users.

Local testing:

1. `bun run dev:scheduled` — starts dev server with the `/__scheduled` test endpoint
2. `bun run scheduled:run` — triggers the seed handler (server must be running; set `WRANGLER_PORT` if not 8787)

Regenerate auth schema after plugin changes:

```bash
bunx @better-auth/cli generate --config src/scripts/auth.cli.ts --output src/schema/auth.ts -y
bun run db:generate && bun run db:migrate
```

## Production database (Hyperdrive)

Production Postgres is private and reached through Hyperdrive. The tunnel and VPC service are account-level resources Hyperdrive uses — not Worker bindings. See [`docs/architecture/database-connectivity.md`](../../docs/architecture/database-connectivity.md).

**On the tunnel host** (Postgres must use TLS for Hyperdrive):

```bash
cp .env.production.example .env.production
# set POSTGRES_PASSWORD in .env.production
docker compose -f docker-compose.production.yml up -d
```

The compose file generates self-signed TLS certs on first start (`postgres-ssl-init` service). Password comes from `.env.production`, not shell interpolation.

**From your dev machine** (after Postgres is up with TLS):

```bash
PRODUCTION_DB_PASSWORD=<secret> bun run hyperdrive:setup
```

`wrangler.jsonc` binds `DB` (Hyperdrive) only — top-level for local dev (`localConnectionString`), `env.main` for production. Production deploys use `--env main` (see [`docs/architecture/deployment.md`](../../docs/architecture/deployment.md)).

### Production migrations

Migrations use Drizzle Kit over **direct TCP** to Postgres on the tunnel host — not Hyperdrive. From a Tailscale-connected machine:

```bash
PRODUCTION_DB_PASSWORD=<secret> bun run db:migrate:production
```

`scripts/migrate-production.sh` builds `DATABASE_URL` (default host `100.69.229.78`, port `6001`, `sslmode=no-verify` for self-signed certs). Override with `PRODUCTION_DB_HOST`, `PRODUCTION_DB_PORT`, `PRODUCTION_DB_SSLMODE`, etc.

**GitHub Actions:** workflow `.github/workflows/migrate-production.yml` joins an **ephemeral Tailscale node** per run (`tailscale/github-action@v4`), then migrates over TCP to `100.69.229.78:6001`. Runs on `ubuntu-latest` — the runner does not need to be on Tailscale permanently.

Repository secrets: `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET` (OAuth client with `auth_keys` scope, `tag:ci`), and `PRODUCTION_DB_PASSWORD`. See [`docs/architecture/database-connectivity.md`](../../docs/architecture/database-connectivity.md) for Tailscale ACL and OAuth setup.

Trigger manually via **Actions → Migrate production database → Run workflow**, or automatically on push to `main` when `apps/api/drizzle/**` changes.

See [`docs/architecture/database-connectivity.md`](../../docs/architecture/database-connectivity.md) for connectivity details and SSL notes.
