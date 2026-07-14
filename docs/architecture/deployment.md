# Deployment

Costly deploys the API and web client as Cloudflare Workers (`costly-api`, `costly-frontend`), and the iOS app via Tauri (local/Xcode builds). **Deployment is handled by [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)** — not local `wrangler deploy` scripts in this repo.

## Workers

| Worker | Wrangler config | Root directory | Production URL |
| --- | --- | --- | --- |
| `costly-api` | `apps/api/wrangler.jsonc` | `apps/api` | `https://costly-api.stizzle.workers.dev` |
| `costly-frontend` | `apps/frontend/wrangler.jsonc` | `apps/frontend` | `https://costly-frontend.stizzle.workers.dev` |

Both workers have `workers_dev: true`, `preview_urls: false`, and **Smart Placement** (`placement.mode: "smart"`).

The frontend worker serves the Vite `dist/` output via Wrangler **static assets** with SPA fallback (`not_found_handling: "single-page-application"`). A minimal Worker entrypoint (`src/index.ts`) delegates to the `ASSETS` binding.

## Preview builds (disabled)

Preview builds are **off** for both workers. Only pushes to `main` should trigger production builds.

## Workers Builds

### `costly-api`

| Setting | Value |
| --- | --- |
| Root directory | `apps/api` |
| Production branch | `main` |
| Builds for non-production branches | **Disabled** |
| Build command | `cd ../.. && bun install` |
| Deploy command | `npx wrangler deploy --env main --minify` |
| Build watch paths | `apps/api/**`, `packages/**` |

### `costly-frontend`

| Setting | Value |
| --- | --- |
| Root directory | `apps/frontend` |
| Production branch | `main` |
| Builds for non-production branches | **Disabled** |
| Build command | `cd ../.. && bun install && cd apps/frontend && bun run build` |
| Deploy command | `npx wrangler deploy --env main` |
| Build watch paths | `apps/frontend/**`, `packages/**` |

Set `VITE_*` in Workers Builds environment for the frontend build step:

| Frontend var | Local | Production | API worker counterpart |
| --- | --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8787` | `https://costly-api.stizzle.workers.dev` | `API_PUBLIC_URL` |
| `VITE_PUBLIC_URL` | `http://localhost:3000` | `https://costly-frontend.stizzle.workers.dev` | `CORS_ORIGINS` |

## Tauri iOS — `apps/mobile`

Built locally with Xcode. See [`apps/mobile/README.md`](../../apps/mobile/README.md).

## What is not deployed via Workers Builds

| Task | How it runs |
| --- | --- |
| Production DB migrations | GitHub Actions |
| Local development | `bun run dev` in `apps/api` and `apps/frontend` |
| iOS app | `bun run dev:ios` in `apps/mobile` |

## Related docs

- [HTTP API and mobile ADR](../decisions/2026-07-14-http-api-and-mobile.md)
- [Database connectivity](./database-connectivity.md)
