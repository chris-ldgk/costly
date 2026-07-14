# @costly/api

Cloudflare Worker backend for **Costly** — auth, database access, and purchase HTTP API.

## Purpose

- The **only** workspace that talks to the database.
- **better-auth** email OTP authentication at `/api/auth/*`.
- **Purchase operations** at `/api/v1/*` with session cookie auth.

```
handlers/purchases.ts  ← shared business logic
  └── routers/api/v1/purchases.ts  ← Hono HTTP routes
```

## Stack

| Concern | Technology |
| --- | --- |
| Runtime | Cloudflare Workers |
| HTTP | Hono (auth + v1 purchase routes + CORS) |
| Auth | better-auth + Drizzle adapter, email OTP |
| Database | Drizzle ORM + PostgreSQL via Hyperdrive (`DB` binding) |
| Validation | Zod + `@hono/zod-validator` |

## Layout

```
src/
├── index.ts          # fetch handler + scheduled cron
├── auth/             # better-auth config
├── handlers/         # Purchase business logic
├── middlewares/      # lib injection, session auth
├── routers/          # Hono routes
│   └── api/v1/       # Purchase REST routes
├── schema/           # Drizzle tables + Zod schemas
└── exports.ts        # AppRouter + shared types for api-client
```

## HTTP routes

| Method | Path | Auth |
| --- | --- | --- |
| `GET/POST` | `/api/auth/*` | Public (better-auth) |
| `GET` | `/api/v1/purchases` | Session |
| `POST` | `/api/v1/purchases` | Session |
| `GET` | `/api/v1/purchases/:id` | Session |
| `PUT` | `/api/v1/purchases/:id` | Session |
| `GET` | `/api/v1/balance` | Session |
| `POST` | `/api/v1/purchases/settle-all` | Session |

## Scripts

```bash
bun run dev          # Wrangler dev
bun run db:up        # Start local Postgres
bun run db:migrate   # Apply migrations
bun run cf-typegen   # Regenerate CloudflareBindings
```

## Environment

See `wrangler.jsonc` `vars` and `.env` for secrets. `CORS_ORIGINS` must include the web PWA origin and `tauri://localhost`.

See [`docs/decisions/2026-07-14-http-api-and-mobile.md`](../../docs/decisions/2026-07-14-http-api-and-mobile.md) for the API access model.
