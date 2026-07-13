# @costly/api-client

Type-safe HTTP client for the API. Types are **inferred at compile time** from the `AppRouter` exported by `@costly/api` — there is no code generation step.

## Purpose

- Provides a typed Hono RPC client (`hc`) so consumers can call API HTTP routes with full type safety.
- Intended for cases where client-side HTTP fetch is genuinely needed (e.g. external clients, browser-side requests).
- In the frontend app, prefer server functions + service bindings over this client. See the [frontend README](../../apps/frontend/README.md).

## Stack

| Concern | Technology |
| --- | --- |
| Client | [Hono](https://hono.dev) RPC client (`hc`) |
| Types | Inferred from `@costly/api` `AppRouter` |
| Language | TypeScript |

## Usage

```typescript
import { createApiClient } from "@costly/api-client";

const client = createApiClient("http://localhost:8787");

// Fully typed — mirrors the Hono router structure
const res = await client.api.v1.books.$get({ query: { limit: 10 } });
const books = await res.json();
```

## Scripts

```bash
bun run typecheck   # Type-check
bun run lint        # Lint
```
