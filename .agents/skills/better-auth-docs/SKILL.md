---
name: better-auth-docs
description: Search Better Auth documentation for plugins, sessions, cookies, and Hono integration. Use when configuring or changing auth in apps/api or apps/frontend.
---

When the user asks about Better Auth, use current documentation instead of training data.

## Context7 (preferred)

| Source | Context7 library ID |
| --- | --- |
| Better Auth | `/better-auth/better-auth` |

Call `query-docs` with the user's full question (e.g. "email OTP sendVerificationOTP disableSignUp client signIn.emailOtp").

## Direct fallback

```bash
curl -s https://www.better-auth.com/llms.txt
curl -sH "Accept: text/markdown" https://www.better-auth.com/docs/plugins/email-otp
curl -s https://raw.githubusercontent.com/better-auth/better-auth/main/docs/content/docs/plugins/email-otp.mdx
```

Docs: https://www.better-auth.com/docs

## Repo conventions

- API: `apps/api/src/auth/index.ts` — `createAuth(lib)` with Drizzle adapter
- Client: `apps/frontend/src/lib/auth-client.ts` — `createAuthClient({ baseURL: VITE_API_URL })`
- Sign-in: Email OTP only; check `ALLOWED_USERS` before sending
- Emails: `apps/api/src/emails/` via Resend; log OTP in development
