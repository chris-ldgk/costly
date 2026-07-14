# Auth and purchases via authenticated HTTP API

## Status

Accepted — supersedes [2026-07-13-auth-and-api-access.md](./2026-07-13-auth-and-api-access.md)

## Context

Costly needs clients that cannot use Cloudflare service bindings: a static web SPA on a Worker and a native iOS app (Tauri). Purchase data must remain session-protected.

## Decision

1. **Auth HTTP on API worker** at `/api/auth/*` via better-auth on Hono (unchanged).
2. **Purchase data via authenticated REST** at `/api/v1/*` — session cookie validated by `sessionMiddleware` on every purchase route.
3. **Remove service binding RPC** — `FrontendEntrypoint` and the `API` service binding are removed.
4. **`@costly/api-client` is the primary access path** for purchase data from web and mobile clients, using `credentials: 'include'`.
5. **Frontend is a static Vite SPA** — TanStack Router, Query, and Form; no TanStack Start SSR or server functions.
6. **Web PWA** deploys as `costly-frontend` Worker serving Vite `dist/` via Wrangler static assets (`ASSETS` binding).
7. **Tauri iOS** wraps the same frontend build; API calls go to `VITE_API_URL` over HTTP.

## Client origins

| Client | Origin | Deployment |
| --- | --- | --- |
| Static web PWA | `https://costly-frontend.stizzle.workers.dev` (production) | Cloudflare Worker (static assets) |
| Local dev | `http://localhost:3000` | Vite dev server |
| Tauri iOS | `tauri://localhost` | Tauri WebView |

All client origins are listed in API `CORS_ORIGINS` and better-auth `trustedOrigins`.

## Consequences

- Browser and Tauri clients call the API directly with session cookies.
- No server functions, no RPC, no TanStack Start SSR.
- Frontend Worker only serves static assets — no application logic on the edge.
- API worker remains the sole database accessor.
- Cookie auth across origins requires `credentials: 'include'` on all API fetches and correct CORS configuration.

## Related

- [Auth domain](../domain/auth.md)
- [Deployment](../architecture/deployment.md)
