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
3. If allowed, better-auth sends a magic link (email in prod, console log in dev).
4. User clicks link → session cookie set → redirect to dashboard.

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
