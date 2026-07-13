# Database connectivity

## Overview

Production PostgreSQL is private — not exposed to the public internet. The API Worker reaches it through **Workers VPC** and **Hyperdrive**.

```
costly-api Worker
  → Hyperdrive (connection pooling)
    → VPC Service (costly-db-postgres, TCP :6001)
      → Cloudflare Tunnel (costly-db)
        → PostgreSQL on the tunnel host (Docker, host port 6001)
```

Local development uses `localConnectionString` on the Hyperdrive binding to talk to Docker Postgres instead of the tunnel.

## Cloudflare resources

| Resource | Name / ID | Purpose |
| --- | --- | --- |
| Account | Personal - Chris (`4c1f658199b03cc5095e7a3c6563457d`) | Hosts Workers, tunnel, VPC, Hyperdrive |
| Tunnel | `costly-db` (`c64a2817-e14d-40d6-842c-2554b45bb79b`) | Outbound connector from the Postgres host |
| VPC Service | `costly-db-postgres` (`019f5cb7-5cf7-7313-a044-5bd5bde09191`) | TCP route to `127.0.0.1:6001` through the tunnel |
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

| Binding | Type | Target |
| --- | --- | --- |
| `COSTLY_DB` | VPC Network | `costly-db` tunnel |
| `COSTLY_DB_POSTGRES` | VPC Service | Registered Postgres service |
| `DB` | Hyperdrive | Pooled Postgres access for Drizzle |

## Hyperdrive setup

After Postgres is running with TLS on the tunnel host:

```bash
cd apps/api
PRODUCTION_DB_PASSWORD=<secret> bun run hyperdrive:setup
```

This creates the `costly-db` Hyperdrive config, updates `wrangler.jsonc`, and runs `cf-typegen`.

## Production migrations (GitHub Actions)

Schema migrations use **Drizzle Kit** with a direct TCP connection to Postgres on the tunnel host. They do **not** go through Hyperdrive or Workers VPC — only the API Worker uses those at runtime.

```
GitHub Actions (self-hosted runner on Tailscale)
  → TCP 100.69.229.78:6001
    → PostgreSQL (Docker, TLS)
```

### Why self-hosted

GitHub-hosted runners cannot reach the Tailscale IP (`100.69.229.78`). The workflow in `.github/workflows/migrate-production.yml` uses `runs-on: self-hosted` so the job runs on a machine on the same Tailscale network as the tunnel host.

### Triggers

| Trigger | When |
| --- | --- |
| `workflow_dispatch` | Manual run from the GitHub Actions tab |
| Push to `main` | When files under `apps/api/drizzle/**` change |

### Required secret

| Secret | Value |
| --- | --- |
| `PRODUCTION_DB_PASSWORD` | Postgres password from the tunnel host `.env.production` (`POSTGRES_PASSWORD`) |

### Connection string

The helper script `apps/api/scripts/migrate-production.sh` builds:

```
postgres://postgres:<password>@100.69.229.78:6001/costly-api?sslmode=require
```

Override host, port, database, user, or SSL mode with env vars (`PRODUCTION_DB_HOST`, `PRODUCTION_DB_PORT`, `PRODUCTION_DB_NAME`, `PRODUCTION_DB_USER`, `PRODUCTION_DB_SSLMODE`).

**TLS:** Production Postgres uses self-signed certs (required for Hyperdrive). Migrations default to `sslmode=require` (encrypt without CA verification). If Drizzle Kit fails with an SSL error, try `PRODUCTION_DB_SSLMODE=disable` only when Postgres is configured without TLS on that path — production compose enables TLS by default.

### Local / manual run

From a machine on Tailscale (or the tunnel host):

```bash
cd apps/api
PRODUCTION_DB_PASSWORD=<secret> bun run db:migrate:production
```

## Invariants

- Only `apps/api` connects to the database.
- Production never uses a public Postgres hostname; traffic stays on Workers VPC + Hyperdrive.
- Postgres must speak TLS for Hyperdrive (self-signed certs are fine; VPC service uses `cert_verification_mode: disabled`).
- Tunnel connector (`cloudflared`) must run on a host that can reach `127.0.0.1:6001`.
