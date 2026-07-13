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
- Frontend proxies `/api/auth/*` so cookies stay on the frontend origin.
- Protected routes and server functions require a valid session.

## Authorization

All authenticated users can:

- View all purchases and balance.
- Log new purchases.
- Trigger "Settle all".

There are no role differences between the two users in MVP.
