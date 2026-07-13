---
name: drizzle-docs
description: Search Drizzle ORM and Drizzle Kit documentation. Use when working with Drizzle schemas, queries, relations, migrations, drizzle-kit, or database setup questions.
---

When the user asks about Drizzle ORM, use current documentation instead of training data.

## MCP tools (preferred)

If the `drizzle` MCP server is available:

1. `search_drizzle_docs` — search indexed topics
2. `fetch_drizzle_doc` — fetch content by slug
3. `list_drizzle_topics` — browse topics by section

Always search before fetching. Fetch the top 1–2 most relevant pages.

## Context7 fallback

| Topic | Context7 library ID |
| --- | --- |
| Docs (best coverage) | `/drizzle-team/drizzle-orm-docs` |
| ORM source | `/drizzle-team/drizzle-orm` |
| LLMs index | `/llmstxt/orm_drizzle_team_llms_txt` |

Call `resolve-library-id` first if unsure, then `query-docs` with the user's full question.

## Direct fallback

```bash
curl -s https://orm.drizzle.team/llms.txt
curl -s https://raw.githubusercontent.com/drizzle-team/drizzle-orm-docs/main/src/content/docs/<slug>.mdx
```

## Common doc slugs

- Overview: `overview`
- Postgres setup: `get-started/postgresql-new`
- Schema: `sql-schema-declaration`
- Relational queries: `rqb`
- SQL queries: `select`
- Migrations: `migrations`
- Drizzle Kit: `pg/kit-overview` (or `mysql/kit-overview`, `sqlite/kit-overview`)
- Config: `drizzle-config-file`
- Relations: `relations`

Drizzle docs are dialect-specific — use `pg/`, `mysql/`, `sqlite/` prefixes when the user mentions a specific database.
