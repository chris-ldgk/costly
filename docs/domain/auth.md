# Authentication

## Method

Magic link only. No passwords, no OAuth, no public sign-up.

## User provisioning

Users are defined in the `ALLOWED_USERS` environment variable:

```json
[
  { "email": "alice@example.com", "name": "Alice" },
  { "email": "bob@example.com", "name": "Bob" }
]
```

- Exactly two users for MVP.
- Users are seeded into the database by a scheduled Worker cron (hourly, idempotent) reading `ALLOWED_USERS` from the Worker env. Locally, trigger via `bun run scheduled:run` while `bun run dev:scheduled` is running.
- `disableSignUp: true` on the magic-link plugin — unknown emails cannot create accounts.

## Magic link flow

1. User submits email on `/login`.
2. Server validates email is in `ALLOWED_USERS`.
3. If allowed, better-auth generates a magic link:
   - **Development** (`NODE_ENV=development`): link is logged to the API console.
   - **Production**: link is sent via [Resend](https://resend.com) using a [React Email](https://react.email) template (`apps/api/src/emails/magic-link.tsx`).
4. User clicks link → session cookie set → redirect to dashboard.

## Email delivery

| Setting | Where | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Worker secret (`.env` locally, dashboard in production) | Resend API authentication |
| `RESEND_FROM_EMAIL` | `wrangler.jsonc` `vars` | Verified sender address (e.g. `Costly <login@yourdomain.com>`) |

The `from` address must use a domain verified in the Resend dashboard. Template: `MagicLinkEmail` with sign-in button and plain-text fallback link.

## Session

- Cookie-based sessions managed by better-auth.
- Auth HTTP endpoints live on the API worker at `/api/auth/*`.
- The browser auth client (`apps/frontend/src/lib/auth-client.ts`) calls the API at `VITE_API_URL` (must match the API worker's `API_PUBLIC_URL` per environment).
- The frontend worker also proxies same-origin `/api/auth/*` to the API via the `API` service binding (for magic-link verification when the link targets the frontend URL).
- Session cookies are shared across frontend and API origins via `crossSubDomainCookies` (see env vars below).
- Protected routes and server functions require a valid session (validated via RPC `getSession`, not `VITE_API_URL`).

## Frontend ↔ API URLs

| Frontend (`apps/frontend`) | API worker (`apps/api`) | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `API_PUBLIC_URL` | Public API base URL — auth client, HTTP fallback client |
| `VITE_PUBLIC_URL` | `BETTER_AUTH_URL`, `CORS_ORIGINS` | Frontend app URL — magic-link `callbackURL`, better-auth `baseURL` |

Local dev: `VITE_API_URL=http://localhost:8787`, `VITE_PUBLIC_URL=http://localhost:3000`. Production: `https://costly-api.stizzle.workers.dev` and `https://costly-frontend.stizzle.workers.dev` respectively.

## Cookie configuration

| Setting | Where | Purpose |
| --- | --- | --- |
| `BETTER_AUTH_URL` | API `wrangler.jsonc` `vars` | Frontend public URL — better-auth `baseURL` and magic-link generation |
| `API_PUBLIC_URL` | API `wrangler.jsonc` `vars` | API public URL — `trustedOrigins`; must match frontend `VITE_API_URL` |
| `COOKIE_DOMAIN` | API `wrangler.jsonc` `vars` | Shared cookie domain (`localhost` locally, `.stizzle.workers.dev` in production) |
| `CORS_ORIGINS` | API `wrangler.jsonc` `vars` | Frontend origin(s) for CORS and `trustedOrigins` |
| `VITE_API_URL` | Frontend `.env` / build vars | How the frontend reaches the API from the browser |
| `VITE_PUBLIC_URL` | Frontend `.env` / build vars | Frontend app URL — post-login redirect target |

`crossSubDomainCookies` ensures the session cookie set by the API worker is also available on the frontend hostname (and vice versa) when origins differ.

## Authorization

All authenticated users can:

- View all purchases and balance.
- Log new purchases.
- Trigger "Settle all".

There are no role differences between the two users in MVP.
