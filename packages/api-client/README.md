# @costly/api-client

Type-safe HTTP client for the API. Types are **inferred at compile time** from the `AppRouter` exported by `@costly/api` — there is no code generation step.

## Purpose

- Provides a typed Hono RPC client (`hc`) so consumers can call API HTTP routes with full type safety.
- Primary access path for the frontend SPA and Tauri iOS app.

## Stack

| Concern | Technology |
| --- | --- |
| Client | [Hono](https://hono.dev) RPC client (`hc`) |
| Types | Inferred from `@costly/api` `AppRouter` |
| Language | TypeScript |

## Usage

```typescript
import { createApiClientWithCredentials } from "@costly/api-client";

const client = createApiClientWithCredentials("http://localhost:8787");

// List purchases (session cookie required)
const res = await client.api.v1.purchases.$get({
  query: { limit: 20, offset: 0 },
});
const { purchases, hasMore } = await res.json();

// Create purchase
await client.api.v1.purchases.$post({
  json: {
    name: "Groceries",
    amountCents: 4500,
    partnerSharePercent: 50,
    purchasedAt: new Date().toISOString(),
  },
});

// Balance
const balanceRes = await client.api.v1.balance.$get();
const balance = await balanceRes.json();
```

Use `createApiClientWithCredentials` (not `createApiClient`) so session cookies are sent on every request.

## Scripts

```bash
bun run typecheck   # Type-check
bun run lint        # Lint
```
