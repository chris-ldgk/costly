---
name: tauri-docs
description: Search Tauri v2 documentation for desktop and mobile app development. Use when working with Tauri project setup, iOS/Android builds, Vite frontend integration, IPC, capabilities, or distribution.
---

When the user asks about Tauri, use current documentation instead of training data.

## MCP tools (preferred)

If the `tauri` MCP server is available:

1. `search_tauri_docs` — search with optional `category` filter
2. `fetch_tauri_doc` — fetch Markdown by URL or slug
3. `list_tauri_topics` — browse topics by category

Always search before fetching. Fetch the top 1–2 most relevant pages.

## Context7 fallback

| Source | Context7 library ID |
| --- | --- |
| Tauri v2 | `/tauri-apps/tauri` |
| Docs site | `/websites/v2_tauri_app` |

Call `resolve-library-id` first if unsure, then `query-docs` with the user's full question.

## Direct fallback

```bash
curl -s https://v2.tauri.app/llms.txt
curl -sH "Accept: text/markdown" https://v2.tauri.app/<slug>
```

## Category filters

`start`, `concept`, `security`, `develop`, `distribute`, `learn`, `plugins`, `about`, `reference`

## Common slugs

- Vite frontend: `start/frontend/vite`
- Project structure: `start/project-structure`
- iOS distribution: `distribute/app-store/ios`
- Capabilities: `security/capabilities`
- Configuration: `develop/configuration-files`

## Costly monorepo notes

- `apps/mobile` wraps `apps/frontend/dist` via `tauri.conf.json`
- Frontend is a static Vite SPA shared by web PWA and Tauri iOS
- API calls use `VITE_API_URL` with `credentials: 'include'`
