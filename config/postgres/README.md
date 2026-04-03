# PostgreSQL

Primary relational database for ChatSuite. Serves multiple services via schemas and databases.

## Overview

| Property   | Value                            |
| ---------- | -------------------------------- |
| Container  | `chatsuite_postgres`             |
| Image      | `postgres:17`                    |
| Port       | 54320 → 5432 (internal)         |
| Network(s) | gateway, database_pg             |
| Data       | `./data/postgres/`              |

## Files

- `docker-entrypoint-postgres.sh` — Custom startup logic
- `init-databases.sh` — Creates databases, schemas, and users on first boot

## Environment Variables

Set in `config/env/.env.${NX_APP_ENV}`:

```bash
POSTGRES_DB=chatsuite
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin          # Change for qa/host
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

## Database Structure

The initialization script creates:

| Database / Schema | Used by                          |
| ----------------- | -------------------------------- |
| `chatsuite`       | API Customer Service, Prisma     |
| `chatsuite.n8n`   | n8n workflow engine              |
| `nocodb`          | NocoDB (separate instance)       |

## Connected Services

| Service              | Connection                                                |
| -------------------- | --------------------------------------------------------- |
| API Customer Service | `postgresql://admin:admin@postgres:5432/chatsuite`        |
| n8n                  | `postgresql://admin:admin@postgres:5432/chatsuite` (schema: n8n) |
| MindsDB              | Connects via gateway/database_pg networks                 |
| PgAdmin              | Web GUI on port 8081 / `https://localhost:10443/pgadmin/` |

## Usage

```bash
docker compose up postgres -d

# Direct psql access
docker exec -it chatsuite_postgres psql -U admin -d chatsuite
```

### Common psql Commands

```sql
\l                    -- List databases
\c chatsuite          -- Connect to database
\dt                   -- List tables
\dn                   -- List schemas
```

## Backup and Restore

```bash
# Single database backup
docker exec chatsuite_postgres pg_dump -U admin chatsuite > backup.sql

# All databases
docker exec chatsuite_postgres pg_dumpall -U admin > full_backup.sql

# Restore
docker exec -i chatsuite_postgres psql -U admin chatsuite < backup.sql
```

## Monitoring

```sql
SELECT * FROM pg_stat_activity;              -- Active connections
SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;  -- DB sizes
```

## Troubleshooting

| Issue              | Solution                                              |
| ------------------ | ----------------------------------------------------- |
| Connection refused | Ensure container is healthy: `docker compose ps postgres` |
| Auth failure       | Verify `POSTGRES_USER` / `POSTGRES_PASSWORD` in env file |
| Init script errors | Check first-boot logs: `docker compose logs postgres`  |
| Port conflict      | Host port 54320 already in use: `lsof -i :54320`     |
