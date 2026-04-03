# n8n

Visual workflow automation platform with 500+ integrations, connected to PostgreSQL for persistent storage.

## Overview

| Property   | Value                            |
| ---------- | -------------------------------- |
| Container  | `chatsuite_n8n`                  |
| Image      | `n8nio/n8n:latest`               |
| Port       | 5678                             |
| Network(s) | gateway, database_pg             |
| Data       | `./data/n8n/`                    |
| Depends on | postgres                         |

## Files

- `docker-entrypoint-n8n.sh` — Startup script with SSL support, permission fixes, and Chromium setup

## Database

n8n uses PostgreSQL (not SQLite) for persistent storage of workflows, credentials, and execution data:

- **Host**: `postgres` (chatsuite_postgres container)
- **Database**: `chatsuite`
- **Schema**: `n8n`
- **Migrations**: Applied automatically on startup

### Environment Variables

Use `DB_TYPE` and `DB_POSTGRESDB_*` (not the `N8N_DB_*` prefix) per n8n documentation:

```bash
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${POSTGRES_HOST}
DB_POSTGRESDB_PORT=${POSTGRES_PORT}
DB_POSTGRESDB_DATABASE=${POSTGRES_DB}
DB_POSTGRESDB_USER=${POSTGRES_USER}
DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
DB_POSTGRESDB_SCHEMA=n8n
```

## Chromium / Puppeteer

The entrypoint automatically installs Chromium and all dependencies on Alpine Linux, enabling browser automation tasks (web scraping, screenshots, PDF generation).

## Usage

```bash
docker compose up n8n -d
open http://localhost:5678                   # Direct
open https://localhost:10443/n8n/            # Via Nginx proxy
```

First visit: create your admin account (first user becomes admin).

### Updating

```bash
docker compose pull n8n
docker compose up -d n8n
# Or: pnpm rebuild
```

## Permissions

The entrypoint script handles all permission scenarios automatically:
- Creates required subdirectories (workflows, credentials, logs, nodes)
- Fixes ownership on bind-mounted `./data/n8n/`
- Configures SSL certificates if available
- No external permission scripts needed

## API Key for Integration Tests

See [docs/n8n-api-key-setup.md](../../docs/n8n-api-key-setup.md) for generating an API key used by integration tests.

## Troubleshooting

| Issue              | Solution                                              |
| ------------------ | ----------------------------------------------------- |
| Won't start        | Check postgres is healthy: `docker compose ps postgres` |
| Permission errors  | Container restart auto-fixes; check logs if persistent |
| Webhook issues     | Verify `WEBHOOK_URL` in env file matches Nginx config |
| Browser tasks fail | Check Chromium install in logs: `docker compose logs n8n` |
