# Deployment

Costly runs as two Cloudflare Workers (`costly-api`, `costly-frontend`). **Deployment is handled by [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)** — not local `wrangler deploy` scripts in this repo.

## Workers

| Worker | Wrangler config | Root directory | Production URL (workers.dev) |
| --- | --- | --- | --- |
| `costly-api` | `apps/api/wrangler.jsonc` | `apps/api` | `https://costly-api.stizzle.workers.dev` |
| `costly-frontend` | `apps/frontend/wrangler.jsonc` | `apps/frontend` | `https://costly-frontend.stizzle.workers.dev` |

Both workers have `workers_dev: true` and `preview_urls: false`. Production URLs use the default `<worker-name>.<account-subdomain>.workers.dev` pattern (no custom hostnames).

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

**API token:** The default Workers Builds token does not include Workers VPC permissions. For `costly-api`, the build token must be able to bind `env.main` VPC and Hyperdrive resources — see [Workers Builds API token](#workers-builds-api-token) below.

### `costly-frontend`

| Setting | Value |
| --- | --- |
| Root directory | `apps/frontend` |
| Production branch | `main` |
| Builds for non-production branches | **Disabled** |
| Build command | `cd ../.. && bun install && cd apps/frontend && bun run build` |
| Deploy command | `npx wrangler deploy --env main` |
| Build watch paths | `apps/frontend/**`, `packages/**` |

The frontend build produces the Worker assets TanStack Start needs. `VITE_*` values for production are in `wrangler.jsonc` `env.main.vars` or dashboard variables, depending on which environment the build deploys.

## What is not deployed via Workers Builds

| Task | How it runs |
| --- | --- |
| Production DB migrations | GitHub Actions — [`.github/workflows/migrate-production.yml`](../../.github/workflows/migrate-production.yml) |
| Local development | `bun run dev` / `bun run dev:scheduled` in each app |

See [database connectivity](./database-connectivity.md) for migration CI setup.

## Local development vs production

Wrangler does **not** inherit bindings into named environments — each `env.<name>` block must declare its own bindings. Costly uses top-level config for local `wrangler dev` and `env.main` for production Workers Builds deploys (`--env main`).

### `costly-api` bindings

| Binding | Local (top-level) | Production (`env.main`) |
| --- | --- | --- |
| `DB` (Hyperdrive) | Yes — includes `localConnectionString` for Docker Postgres | Yes — Hyperdrive ID only (no `localConnectionString`) |
| `COSTLY_DB` (VPC Network) | No | Yes — `costly-db` tunnel |
| `COSTLY_DB_POSTGRES` (VPC Service) | No | Yes — Postgres service through tunnel |

### Other config

| Concern | Local | Production |
| --- | --- | --- |
| Worker secrets | `apps/*/.dev.vars` | Cloudflare dashboard Variables & Secrets |
| Public env vars | `wrangler.jsonc` top-level `vars` (localhost) | `wrangler.jsonc` `env.main.vars` or dashboard |
| Deploy | Not from this repo — push to Git | Workers Builds on merge to `main` (`--env main`) |

## Workers Builds API token

Workers Builds deploys with a **user API token** (auto-created or selected under **Settings → Build → API token**). The auto-generated token includes Workers Scripts, KV, R2, and routes — but **not** Workers VPC or Hyperdrive.

`costly-api` production deploys (`--env main`) bind Hyperdrive plus VPC network/service resources. If the build token lacks VPC access, deploy fails with:

```
Workers VPC binding configuration failed because your credentials are not authorized
for the requested VPC resource. [code: 10196]
```

### Fix (one-time)

1. Open [My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Find the token used by Workers Builds (often named like `costly-api build token`).
3. **Edit** the token and add these **Account** permissions for your account (`Personal - Chris`):

| Permission | Access | Why |
| --- | --- | --- |
| Connectivity Directory Read | Read | List/view VPC tunnels and services |
| Connectivity Directory Bind | Edit | Bind `COSTLY_DB_POSTGRES` VPC Service |
| Connectivity Directory Admin | Edit | Bind `COSTLY_DB` VPC Network (tunnel) |
| Hyperdrive | Edit | Bind production `DB` Hyperdrive config |

Keep existing Workers Scripts (Edit), KV/R2 (Edit), and Workers Routes permissions.

4. Save the token.
5. In **Workers & Pages → costly-api → Settings → Build**, confirm the same token is selected (or choose a custom token you created with the permissions above).
6. **Retry** the failed build.

`costly-frontend` has no VPC bindings — the default build token is usually sufficient.

See [Workers VPC troubleshooting](https://developers.cloudflare.com/workers-vpc/reference/troubleshooting/#permission-errors) and [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#api-token).

## Related docs

- [Database connectivity](./database-connectivity.md) — production Postgres, Hyperdrive, migration CI
- [Monorepo architecture](../../.cursor/rules/monorepo-architecture.mdc) — app layout and service bindings
- [Cloudflare Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Cloudflare Workers Builds build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/) — production vs non-production branch control
- [Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/) — `preview_urls` in Wrangler
- [Monorepo advanced setups](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/)
