# @costly/api-client

Type-safe HTTP client for the API. Types are **inferred at compile time** from the `AppRouter` exported by `@costly/api` — there is no code generation step.

## Purpose

- Provides a typed Hono RPC client (`hc`) so consumers can call API HTTP routes with full type safety.
- **Mobile app** (`apps/mobile`) — primary data access path for purchases and balance.
- **Web frontend** — prefer server functions + service binding; use this client only when client-side HTTP is genuinely needed.

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

// List purchases (requires session cookie)
const res = await client.api.v1.purchases.$get({
  query: { limit: 20, offset: 0 },
});
const { purchases, hasMore } = await res.json();

// Current balance
const balanceRes = await client.api.v1.balance.$get();
const balance = await balanceRes.json();

// Create purchase
await client.api.v1.purchases.$post({
  json: {
    name: "Groceries",
    amountCents: 4250,
    partnerSharePercent: 50,
    purchasedAt: new Date(),
  },
});
```

### Mobile (authenticated)

The mobile app wraps `createApiClient` and attaches Better Auth session cookies:

```typescript
// apps/mobile/src/lib/api-client.ts
const client = createApiClient(apiUrl, {
  fetch: async (input, init) => {
    const headers = new Headers(init?.headers);
    const cookies = authClient.getCookie();
    if (cookies) headers.set("Cookie", cookies);
    return fetch(input, { ...init, headers, credentials: "omit" });
  },
});
```

See [`apps/mobile/README.md`](../../apps/mobile/README.md).

## HTTP routes

All `/api/v1/*` routes require a valid Better Auth session. See [`apps/api/README.md`](../../apps/api/README.md).

## Scripts

```bash
bun run typecheck   # Type-check
bun run lint        # Lint
```
