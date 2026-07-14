# HTTP API for mobile and dual access for purchases

## Status

Accepted — supersedes the purchase REST prohibition in [2026-07-13](./2026-07-13-auth-and-api-access.md) for `/api/v1/*`.

## Context

Costly needs a native iOS app. The web frontend uses Cloudflare service-binding RPC (`FrontendEntrypoint`) for purchase data, which is unavailable to a standalone mobile client. Auth already uses HTTP at `/api/auth/*`.

## Decision

1. **Dual access for purchases** — shared handlers in `apps/api/src/handlers/purchases.ts`, exposed via both:
   - **RPC** — `FrontendEntrypoint` methods (web frontend via service binding, unchanged)
   - **HTTP** — authenticated Hono routes at `/api/v1/*` (mobile and `@costly/api-client`)
2. **API-side session enforcement** — HTTP purchase routes require a valid Better Auth session cookie; `userId` for create/settle comes from the session, not the request body.
3. **Mobile client** — Expo app in `apps/mobile` using Better Auth Expo (`@better-auth/expo`) with `expo-secure-store` for cookie persistence.
4. **Web unchanged** — TanStack Start server functions continue using RPC; no frontend migration in this phase.

## HTTP routes

| Route | Method | Handler |
| --- | --- | --- |
| `/api/v1/purchases` | GET | `getPurchases` |
| `/api/v1/purchases` | POST | `createPurchase` |
| `/api/v1/purchases/:purchaseId` | GET | `getPurchase` |
| `/api/v1/purchases/:purchaseId` | PUT | `updatePurchase` |
| `/api/v1/balance` | GET | `getBalance` |
| `/api/v1/settlements` | POST | `settleAllPurchases` |

Auth remains at `/api/auth/*`. Session introspection uses Better Auth endpoints, not a custom route.

## Mobile auth

- Deep link scheme: `costly://`
- API `trustedOrigins` includes `costly://`
- Mobile auth client calls `EXPO_PUBLIC_API_URL` directly (same as web `VITE_API_URL`)
- Purchase API calls attach session cookies via `authClient.getCookie()` on the Hono RPC client

## Consequences

- `@costly/api-client` is the primary data access path for mobile.
- API-side session middleware closes the gap where RPC relied on frontend middleware for auth.
- CORS and `trustedOrigins` must include the Expo deep-link scheme.
- Web RPC path remains for lower-latency, same-origin server functions.

## Related

- [Auth domain](../domain/auth.md)
- [Architecture overview](../architecture/overview.md)
