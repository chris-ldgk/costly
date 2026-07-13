# Database connectivity

## Overview

Production PostgreSQL is private — not exposed to the public internet. The API Worker reaches it through a single **Hyperdrive** binding (`DB`). Hyperdrive handles connection pooling and routes to Postgres through Cloudflare's private connectivity layer (tunnel + VPC service configured in the account — not as Worker bindings).

```
costly-api Worker
  → Hyperdrive (`DB` binding)
    → Hyperdrive config (`costly-db`) — routes via private connectivity
      → Cloudflare Tunnel (`costly-db`)
        → PostgreSQL on the tunnel host (Docker, host port 6001)
```

Local development uses `localConnectionString` on the top-level Hyperdrive binding to talk to Docker Postgres instead of the production Hyperdrive config.

## Cloudflare resources

| Resource | Name / ID | Purpose |
| --- | --- | --- |
| Account | Personal - Chris (`4c1f658199b03cc5095e7a3c6563457d`) | Hosts Workers, tunnel, VPC, Hyperdrive |
| Tunnel | `costly-db` (`c64a2817-e14d-40d6-842c-2554b45bb79b`) | Outbound connector from the Postgres host |
| VPC Service | `costly-db-postgres` (`019f5cb7-5cf7-7313-a044-5bd5bde09191`) | Private route Hyperdrive uses to reach `127.0.0.1:6001` (not a Worker binding) |
| Hyperdrive | `costly-db` (`bd79b0e6deac49488e97473faa5d76b3`) | Backs the Worker `DB` binding |

## Production Postgres (tunnel host)

Hyperdrive requires **TLS on Postgres**. Use `docker-compose.production.yml` on the server — it generates self-signed certs on first start.

On the tunnel host:

```bash
cp .env.production.example .env.production
# set POSTGRES_PASSWORD in .env.production
docker compose -f docker-compose.production.yml up -d
```

Or pass an env file explicitly (works with `sudo`):

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d
```

| Setting | Value |
| --- | --- |
| Host (from tunnel) | `127.0.0.1` |
| Port (from tunnel) | `6001` (Docker maps `6001:5432`) |
| Database | `costly-api` |
| User | `postgres` |
| TLS | Auto-generated self-signed certs (`postgres_ssl` volume) |

## Worker bindings (`apps/api/wrangler.jsonc`)

The Worker declares **only** the Hyperdrive binding. VPC network and service resources exist in the account for Hyperdrive's backend routing — they are not bound to the Worker.

Wrangler does not inherit bindings into named environments. Production Hyperdrive lives under `env.main`; local dev uses top-level config with `localConnectionString`.

| Binding | Type | Where | Notes |
| --- | --- | --- | --- |
| `DB` | Hyperdrive | Top-level (local) and `env.main` (production) | Local includes `localConnectionString`; production uses Hyperdrive config ID only |

## Hyperdrive setup

After Postgres is running with TLS on the tunnel host:

```bash
cd apps/api
PRODUCTION_DB_PASSWORD=<secret> bun run hyperdrive:setup
```

This creates the `costly-db` Hyperdrive config, updates `wrangler.jsonc`, and runs `cf-typegen`.

## Production migrations (GitHub Actions)

Schema migrations use **Drizzle Kit** with a direct TCP connection to Postgres on the tunnel host. They do **not** go through Hyperdrive — only the API Worker uses Hyperdrive at runtime.

```
GitHub Actions (ubuntu-latest)
  → ephemeral Tailscale node (tag:ci)
    → TCP 100.69.229.78:6001
      → PostgreSQL (Docker, TLS)
```

### Tailscale setup (one-time)

1. **Create a tag** in the [Tailscale admin console](https://login.tailscale.com/admin/acls/tags) — e.g. `tag:ci`.
2. **Create an OAuth client** ([Settings → OAuth clients](https://login.tailscale.com/admin/settings/oauth)) with the **`auth_keys`** scope and the `tag:ci` tag assigned.
3. **Add ACL rules** so CI nodes can reach Postgres on the tunnel host. Example grant (ACL policy file):

```json
{
  "grants": [
    {
      "src": ["tag:ci"],
      "dst": ["100.69.229.78"],
      "ip": ["100.69.229.78/32:6001"]
    }
  ]
}
```

Adjust the IP if your tunnel host has a different Tailscale address.

4. **Add GitHub repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `TS_OAUTH_CLIENT_ID` | OAuth client ID from step 2 |
| `TS_OAUTH_SECRET` | OAuth client secret from step 2 |
| `PRODUCTION_DB_PASSWORD` | Postgres password from tunnel host `.env.production` |

The workflow uses [`tailscale/github-action@v4`](https://github.com/tailscale/github-action) to join an **ephemeral** node for the job duration. The node is removed automatically when the job finishes.

### Triggers

| Trigger | When |
| --- | --- |
| `workflow_dispatch` | Manual run from the GitHub Actions tab |
| Push to `main` | When files under `apps/api/drizzle/**` change |

Workflow file: `.github/workflows/migrate-production.yml` — runs on `ubuntu-latest` (no permanently Tailscale-connected runner required).

### Connection string

The helper script `apps/api/scripts/migrate-production.sh` builds:

```
postgres://postgres:<password>@100.69.229.78:6001/costly-api?sslmode=no-verify
```

Override host, port, database, user, or SSL mode with env vars (`PRODUCTION_DB_HOST`, `PRODUCTION_DB_PORT`, `PRODUCTION_DB_NAME`, `PRODUCTION_DB_USER`, `PRODUCTION_DB_SSLMODE`).

**TLS:** Production Postgres uses self-signed certs (required for Hyperdrive). Migrations default to `sslmode=no-verify` — encrypted connection without CA verification (appropriate for self-signed certs on a private Tailscale path). Override with `PRODUCTION_DB_SSLMODE` if needed.

### Local / manual run

From a machine on Tailscale (or the tunnel host):

```bash
cd apps/api
PRODUCTION_DB_PASSWORD=<secret> bun run db:migrate:production
```

## Invariants

- Only `apps/api` connects to the database.
- The Worker binds **Hyperdrive only** — no VPC network or VPC service bindings in `wrangler.jsonc`.
- Production never uses a public Postgres hostname; Hyperdrive routes over private connectivity.
- Postgres must speak TLS for Hyperdrive (self-signed certs are fine).
- Tunnel connector (`cloudflared`) must run on a host that can reach `127.0.0.1:6001`.
