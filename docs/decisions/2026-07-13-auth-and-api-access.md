# Auth via HTTP (proxied) and purchases via service binding RPC

## Status

Accepted

## Context

Costly is a private two-user app deployed as separate Cloudflare Workers (frontend + API). Purchase data must not be exposed via a public REST API. Authentication requires HTTP endpoints for magic-link verification callbacks and session cookies.

## Decision

1. **Auth HTTP on API worker** at `/api/auth/*`, mounted via better-auth on Hono.
2. **Auth proxy on frontend worker** — requests to `/api/auth/*` are forwarded to the API worker via the `API` service binding so session cookies remain on the frontend origin.
3. **Purchase data via RPC only** — `FrontendEntrypoint` methods on the API worker; no Hono `/api/v1/purchases` routes.
4. **Database access stays API-only** — auth uses the same Drizzle pool as purchase handlers.

## Consequences

- Magic-link callbacks use `BETTER_AUTH_URL` = frontend public URL (`VITE_PUBLIC_URL`).
- Browser auth requests use the API at `VITE_API_URL` (= API `API_PUBLIC_URL`); `crossSubDomainCookies` shares the session cookie across both origins.
- Frontend server functions validate session via RPC `getSession(headers)` before calling purchase RPC methods.
- `@costly/api-client` is unused for Costly business logic.
- CORS on the API worker remains configured for the frontend origin (auth proxy passthrough).

## Related

- [Auth domain](../domain/auth.md)
- [Product overview](../product/overview.md)
