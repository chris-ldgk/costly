# Product & Domain Documentation

This directory is the source of truth for **what the app does** and **why**. Code in `apps/` implements these docs.

For technical setup (commands, bindings, file layout), see the root [README](../README.md) and workspace READMEs.

## Structure

| Path | Purpose |
| --- | --- |
| [product/](./product/) | Product vision, users, flows, feature scope |
| [domain/](./domain/) | Entities, rules, invariants, calculations |
| [architecture/](./architecture/) | App-level design and service boundaries |
| [decisions/](./decisions/) | Architecture and product decision records (ADRs) |

## Conventions

- One topic per file; use kebab-case filenames (e.g. `billing-rules.md`).
- Prefer present tense and explicit rules ("A book must have at least one author") over vague descriptions.
- When a rule changes, update the doc in the same PR/task as the code change.
- Link related docs and ADRs at the top of each file.

## Adding documentation

1. Choose the right folder (`product`, `domain`, `architecture`, or `decisions`).
2. Create or update the markdown file.
3. Add a link in this README under the relevant section below.
4. Implement or adjust code to match.

## Index

### Product

- [Overview](./product/overview.md) — vision, users, core flows, UX principles

### Domain

- [Purchases & settlements](./domain/purchases.md) — entities, split rule, balance, settlement
- [Authentication](./domain/auth.md) — magic link, user provisioning, session

### Architecture

- [Overview](./architecture/overview.md) — how product architecture relates to the monorepo
- [Database connectivity](./architecture/database-connectivity.md) — production Postgres via Workers VPC, tunnel, and Hyperdrive

### Decisions

- [2026-07-13 — Auth via HTTP (proxied) and purchases via RPC](./decisions/2026-07-13-auth-and-api-access.md)
