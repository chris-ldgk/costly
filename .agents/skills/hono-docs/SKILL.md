---
name: hono-docs
description: Search Hono web framework documentation. Use when working with Hono routing, middleware, helpers, RPC, JSX, or runtime setup (Workers, Deno, Bun, Node.js).
---

When the user asks about Hono, use current documentation instead of training data.

## MCP tools (preferred)

If the `hono` MCP server is available:

1. `search_hono_docs` — search with optional `category` filter
2. `fetch_hono_doc` — fetch Markdown by URL or slug
3. `list_hono_topics` — browse topics by category

Always search before fetching. Fetch the top 1–2 most relevant pages.

## Context7 fallback

| Source | Context7 library ID |
| --- | --- |
| Docs site (preferred) | `/websites/hono_dev` |
| Website repo | `/honojs/website` |
| Source repo | `/honojs/hono` |
| LLMs full index | `/llmstxt/hono_dev_llms-full_txt` |

Call `resolve-library-id` first if unsure, then `query-docs` with the user's full question.

## Direct fallback

```bash
curl -s https://hono.dev/llms.txt
curl -sH "Accept: text/markdown" https://hono.dev/docs/<slug>
```

## Category filters

`getting-started`, `middleware`, `helpers`, `guides`, `concepts`, `api`

## Common slugs

- Cloudflare Workers: `getting-started/cloudflare-workers`
- Basic setup: `getting-started/basic`
- Hono API: `api/hono`
- JWT middleware: `middleware/builtin/jwt`
- CORS: `middleware/builtin/cors`
- RPC guide: `guides/rpc`
- Validation: `guides/validation`
