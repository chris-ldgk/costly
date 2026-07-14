# Deployment

Costly runs as two Cloudflare Workers (`costly-api`, `costly-frontend`). **Deployment is handled by [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)** — not local `wrangler deploy` scripts in this repo.

## Workers

| Worker | Wrangler config | Root directory | Production URL (workers.dev) |
| --- | --- | --- | --- |
| `costly-api` | `apps/api/wrangler.jsonc` | `apps/api` | `https://costly-api.stizzle.workers.dev` |
| `costly-frontend` | `apps/frontend/wrangler.jsonc` | `apps/frontend` | `https://costly-frontend.stizzle.workers.dev` |

Both workers have `workers_dev: true`, `preview_urls: false`, and **Smart Placement** (`placement.mode: "smart"` in each `wrangler.jsonc`). Production URLs use the default `<worker-name>.<account-subdomain>.workers.dev` pattern (no custom hostnames).

Smart Placement analyzes traffic after deploy and may relocate each Worker closer to its busiest back-end services (for example Hyperdrive/Postgres on `costly-api`, or the `API` service binding on `costly-frontend`). Analysis can take up to ~15 minutes to take effect.

## Preview builds (disabled)

Preview builds are **off** for both workers:

| Control | Setting |
| --- | --- |
| `preview_urls` in `wrangler.jsonc` | `false` — no versioned preview URLs on `workers.dev` after deploy |
| Workers Builds branch control | **Builds for non-production branches** unchecked on `costly-api` and `costly-frontend` |

Only pushes to the production branch (typically `main`) should trigger a build. Non-production branches do not run `npx wrangler versions upload` or publish preview deployments.

In the dashboard for each Worker: **Settings → Build → Branch control** → disable **Builds for non-production branches**. Redeploy from `main` so `preview_urls: false` in Wrangler is not overwritten by dashboard defaults.

## Workers Builds (per Worker)

Each Worker is connected to the monorepo Git repository in the Cloudflare dashboard (**Workers & Pages → Worker → Settings → Build**). On push to the production branch (typically `main`), Workers Builds runs:

1. **Build command** (optional) — compile or install dependencies
2. **Deploy command** — upload and publish the Worker (defaults to `npx wrangler deploy`)

Configure builds separately for each Worker. Suggested settings for this monorepo:

### `costly-api`

| Setting | Value |
| --- | --- |
| Root directory | `apps/api` |
| Production branch | `main` |
| Builds for non-production branches | **Disabled** |
| Build command | `cd ../.. && bun install` |
| Deploy command | `npx wrangler deploy --env main --minify` |
| Build watch paths | `apps/api/**`, `packages/**` (if API imports shared packages) |

No compile step — Wrangler bundles TypeScript at deploy time. Runtime secrets (`BETTER_AUTH_SECRET`) and production `vars` are set in the dashboard (**Settings → Variables & Secrets**), not in git.

**API token:** If `costly-api` deploy fails binding Hyperdrive, add **Hyperdrive Edit** to the Workers Builds API token — see [Workers Builds API token](#workers-builds-api-token) below.

### `costly-frontend`

| Setting | Value |
| --- | --- |
| Root directory | `apps/frontend` |
| Production branch | `main` |
| Builds for non-production branches | **Disabled** |
| Build command | `cd ../.. && bun install && cd apps/frontend && bun run build` |
| Deploy command | `npx wrangler deploy --env main` |
| Build watch paths | `apps/frontend/**`, `packages/**` |

The frontend build produces the Worker assets TanStack Start needs. Set `VITE_*` in frontend `.env` locally and in the Workers Builds environment (or `wrangler.jsonc` `vars`) for production:

| Frontend var | Local | Production | API worker counterpart |
| --- | --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8787` | `https://costly-api.stizzle.workers.dev` | `API_PUBLIC_URL` |
| `VITE_PUBLIC_URL` | `http://localhost:3000` | `https://costly-frontend.stizzle.workers.dev` | `BETTER_AUTH_URL`, `CORS_ORIGINS` |

## What is not deployed via Workers Builds

| Task | How it runs |
| --- | --- |
| Production DB migrations | GitHub Actions — [`.github/workflows/migrate-production.yml`](../../.github/workflows/migrate-production.yml) |
| iOS GitHub Release | GitHub Actions — [`.github/workflows/ios-release.yml`](../../.github/workflows/ios-release.yml) (manual dispatch) |
| iOS TestFlight | GitHub Actions — [`.github/workflows/ios-testflight.yml`](../../.github/workflows/ios-testflight.yml) on `mobile-v*` tag or manual dispatch |
| Local development | `bun run dev` / `bun run dev:scheduled` in each app |

See [database connectivity](./database-connectivity.md) for migration CI setup. See [`apps/mobile/README.md`](../../apps/mobile/README.md) for iOS release secrets and one-time EAS setup.

## Local development vs production

Wrangler does **not** inherit bindings into named environments — each `env.<name>` block must declare its own bindings. Costly uses top-level config for local `wrangler dev` and `env.main` for production Workers Builds deploys (`--env main`).

**Local secrets:** use `.env` only (copy from `.env.example`). Do **not** create `.dev.vars` — if present, Wrangler prefers it over `.env`.

### `costly-api` bindings

| Binding | Local (top-level) | Production (`env.main`) |
| --- | --- | --- |
| `DB` (Hyperdrive) | Yes — includes `localConnectionString` for Docker Postgres | Yes — Hyperdrive config ID only (no `localConnectionString`) |

The Worker does **not** bind VPC network or VPC service resources. Tunnel and VPC service exist in the account for Hyperdrive's backend routing — see [database connectivity](./database-connectivity.md).

### Other config

| Concern | Local | Production |
| --- | --- | --- |
| Worker secrets | `apps/*/.env` | Cloudflare dashboard Variables & Secrets |
| Public env vars | `wrangler.jsonc` top-level `vars` (localhost) | `wrangler.jsonc` `env.main.vars` or dashboard |
| Deploy | Not from this repo — push to Git | Workers Builds on merge to `main` (`--env main`) |

## Workers Builds API token

Workers Builds deploys with a **user API token** (auto-created or selected under **Settings → Build → API token**). The auto-generated token includes Workers Scripts, KV, R2, and routes.

`costly-api` production deploys (`--env main`) bind the Hyperdrive config. If the build token lacks Hyperdrive access, deploy may fail when attaching the `DB` binding. Add **Hyperdrive → Edit** on the build token under [My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens), then retry the build.

`costly-frontend` has no Hyperdrive binding — the default build token is usually sufficient.

See [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#api-token).

## Related docs

- [Database connectivity](./database-connectivity.md) — production Postgres, Hyperdrive, migration CI
- [Monorepo architecture](../../.cursor/rules/monorepo-architecture.mdc) — app layout and service bindings
- [Cloudflare Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Cloudflare Workers Builds build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/) — production vs non-production branch control
- [Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/) — `preview_urls` in Wrangler
- [Monorepo advanced setups](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/)
