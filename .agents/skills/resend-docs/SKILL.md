---
name: resend-docs
description: Search Resend Node SDK documentation for sending transactional email. Use when implementing email delivery in apps/api.
---

When the user asks about Resend, use current documentation instead of training data.

## Context7 (preferred)

| Source | Context7 library ID |
| --- | --- |
| Resend Node SDK | `/resend/resend-node` |

Call `query-docs` with the user's full question (e.g. "send email with react component error handling").

## Direct fallback

```bash
curl -s https://raw.githubusercontent.com/resend/resend-node/canary/readme.md
curl -s https://raw.githubusercontent.com/resend/resend-node/canary/_autodocs/api-reference/emails.md
```

Docs: https://resend.com/docs

## Repo conventions

- API-only (`apps/api`)
- Secrets: `RESEND_API_KEY` in `.env` / dashboard
- Vars: `RESEND_FROM_EMAIL` in `wrangler.jsonc` `vars`
- Send helpers: `apps/api/src/emails/`
