# Authentication

## Method

Email OTP only. No passwords, no magic links, no OAuth, no public sign-up.

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
- `disableSignUp: true` on the email OTP plugin — unknown emails cannot create accounts.

## Email OTP flow

1. User submits email on `/login`.
2. Frontend calls `authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" })` against `VITE_API_URL`.
3. Server validates email is in `ALLOWED_USERS`.
4. If allowed, better-auth generates a 6-digit OTP:
   - **Development** (`NODE_ENV=development`): OTP is logged to the API console.
   - **Production**: OTP is sent via [Resend](https://resend.com) using a [React Email](https://react.email) template (`apps/api/src/emails/otp.tsx`).
5. Login screen switches to the OTP step; user enters the code.
6. Frontend calls `authClient.signIn.emailOtp({ email, otp })` → session cookie set → redirect to dashboard.

OTP expires after 5 minutes (configurable via `expiresIn` on the `emailOTP` plugin).

## Email delivery

| Setting | Where | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Worker secret (`.env` locally, dashboard in production) | Resend API authentication |
| `RESEND_FROM_EMAIL` | `wrangler.jsonc` `vars` | Verified sender address (e.g. `Costly <login@yourdomain.com>`) |

The `from` address must use a domain verified in the Resend dashboard. Template: `OtpEmail` with the numeric code and plain-text fallback.

## Session

- Cookie-based sessions managed by better-auth.
- Auth HTTP endpoints live on the API worker at `/api/auth/*`.
- The browser auth client (`apps/frontend/src/lib/auth-client.ts`) calls the API at `VITE_API_URL`.
- Purchase API routes at `/api/v1/*` validate the session cookie via `sessionMiddleware`.
- Clients (web PWA and Tauri iOS) send `credentials: 'include'` on all API requests.
- Protected routes check session via `authClient.getSession()` in TanStack Router `beforeLoad`.

## Client ↔ API URLs

| Client | Var | API worker | Purpose |
| --- | --- | --- | --- |
| Web / Tauri | `VITE_API_URL` | `API_PUBLIC_URL` | API base URL |
| Web PWA | `VITE_PUBLIC_URL` | `CORS_ORIGINS` | Allowed client origin |
| Tauri iOS | — | `CORS_ORIGINS` | `tauri://localhost` |

Local dev: `VITE_API_URL=http://localhost:8787`, `VITE_PUBLIC_URL=http://localhost:3000`. Production web: `https://costly-frontend.stizzle.workers.dev`.

## Cookie configuration

| Setting | Where | Purpose |
| --- | --- | --- |
| `BETTER_AUTH_URL` | API `wrangler.jsonc` `vars` | Frontend public URL — better-auth `baseURL` |
| `API_PUBLIC_URL` | API `wrangler.jsonc` `vars` | API public URL — `trustedOrigins`; must match frontend `VITE_API_URL` |
| `COOKIE_DOMAIN` | API `wrangler.jsonc` `vars` | Shared cookie domain (`localhost` locally, `.stizzle.workers.dev` in production) |
| `CORS_ORIGINS` | API `wrangler.jsonc` `vars` | Frontend origin(s) for CORS and `trustedOrigins` |
| `VITE_API_URL` | Frontend `.env` / build vars | How the frontend reaches the API from the browser |
| `VITE_PUBLIC_URL` | Frontend `.env` / build vars | Frontend app URL |

`crossSubDomainCookies` ensures the session cookie set by the API worker is also available on the frontend hostname (and vice versa) when origins differ.

## Authorization

All authenticated users can:

- View all purchases and balance.
- Log new purchases.
- Trigger "Settle all".

There are no role differences between the two users in MVP.
