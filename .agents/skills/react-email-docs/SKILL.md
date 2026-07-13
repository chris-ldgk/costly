---
name: react-email-docs
description: Search React Email documentation for templates, components, and rendering. Use when creating or editing email templates in apps/api/src/emails/.
---

When the user asks about React Email, use current documentation instead of training data.

## Context7 (preferred)

| Source | Context7 library ID |
| --- | --- |
| React Email | `/resend/react-email` |

Call `query-docs` with the user's full question (e.g. "magic link Button Preview Text template").

## Direct fallback

```bash
curl -s https://raw.githubusercontent.com/resend/react-email/canary/skills/react-email/references/COMPONENTS.md
curl -s https://raw.githubusercontent.com/resend/react-email/canary/skills/react-email/references/SENDING.md
```

## Repo conventions

- Templates: `apps/api/src/emails/*.tsx`
- Import from `react-email`
- Pair with Resend via `resend-docs` skill for sending
