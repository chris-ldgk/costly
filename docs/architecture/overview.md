# Architecture Overview

## App vs monorepo

This project separates **product architecture** (documented here and in sibling `docs/` folders) from **monorepo architecture** (documented in [`.cursor/rules/monorepo-architecture.mdc`](../../.cursor/rules/monorepo-architecture.mdc)).

| Concern | Documented in |
| --- | --- |
| What features exist, who can do what, domain rules | `docs/product/`, `docs/domain/` |
| Which services own which data, external integrations | `docs/architecture/` |
| How code is organized (API, frontend, mobile, HTTP client) | `.cursor/rules/monorepo-architecture.mdc` |
| How to run and configure apps locally | Workspace READMEs |
| How services are deployed | [`deployment.md`](./deployment.md) |

## Current stack (implementation)

- **API** (`apps/api`) — sole owner of database; Hono HTTP routes for auth and purchases
- **Frontend** (`apps/frontend`) — static Vite SPA served by `costly-frontend` Worker; HTTP API client with session cookies
- **Mobile** (`apps/mobile`) — Tauri iOS WebView wrapping the frontend build
- **Shared packages** — typed HTTP client and UI components

When adding a new bounded context, integration, or data store, document the decision in `docs/decisions/` and update this file if boundaries change.
