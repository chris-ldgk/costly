---
name: tanstack-docs
description: Search TanStack Start, Router, Query, Form, DevTools, and CLI documentation. Use when working with TanStack libraries, scaffolding projects, or answering API/setup questions.
---

When the user asks about TanStack libraries, use current documentation instead of training data.

## MCP tools (preferred)

If the `tanstack` MCP server is available:

1. `search_tanstack_docs` — search with optional `library` filter (`start`, `router`, `query`, `form`, `devtools`, `cli`)
2. `fetch_tanstack_doc` — fetch full page content by `library` + `path`
3. `list_tanstack_libraries` — list all TanStack libraries and docs URLs

Always search before fetching. Fetch the top 1–2 most relevant pages.

## Context7 fallback

If TanStack MCP is unavailable, use Context7:

| Product | Context7 library ID |
| --- | --- |
| Start | `/websites/tanstack_start_framework_react` |
| Router | `/tanstack/router` |
| Query | `/tanstack/query` |
| Form | `/tanstack/form` |
| DevTools | `/tanstack/devtools` |
| CLI | `/tanstack/cli` |

Call `resolve-library-id` first if unsure, then `query-docs` with the user's full question.

## CLI fallback

```bash
npx @tanstack/cli search-docs "<query>" --library <lib> --framework react --json
npx @tanstack/cli doc <lib> "<path>" --json
```

Library IDs: `start`, `router`, `query`, `form`, `devtools`, `cli`.

## Common doc paths

- Start overview: `framework/react/overview`
- Router quick start: `framework/react/quick-start`
- Query overview: `framework/react/overview`
- Form basics: `framework/react/guides/basic-concepts`
- DevTools overview: `overview`
- CLI reference: `cli-reference`
