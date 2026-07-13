# Architecture Overview

## App vs monorepo

This project separates **product architecture** (documented here and in sibling `docs/` folders) from **monorepo architecture** (documented in [`.cursor/rules/monorepo-architecture.mdc`](../../.cursor/rules/monorepo-architecture.mdc)).

| Concern | Documented in |
| --- | --- |
| What features exist, who can do what, domain rules | `docs/product/`, `docs/domain/` |
| Which services own which data, external integrations | `docs/architecture/` |
| How code is organized (API, frontend, handlers, RPC) | `.cursor/rules/monorepo-architecture.mdc` |
| How to run and configure workers locally | Workspace READMEs |
| How Workers are deployed to Cloudflare | [`deployment.md`](./deployment.md) |

## Current stack (implementation)

- **API** (`apps/api`) — sole owner of database and external services
- **Frontend** (`apps/frontend`) — SSR UI; calls API via Cloudflare service bindings
- **Shared packages** — typed HTTP client and UI components

When adding a new bounded context, integration, or data store, document the decision in `docs/decisions/` and update this file if boundaries change.
