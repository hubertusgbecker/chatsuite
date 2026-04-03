# NocoDB

No-code database platform that turns PostgreSQL into a smart spreadsheet with auto-generated REST and GraphQL APIs.

## Overview

| Property   | Value                            |
| ---------- | -------------------------------- |
| Container  | `chatsuite_nocodb`               |
| Image      | `nocodb/nocodb:latest`           |
| Port       | 8080                             |
| Network(s) | gateway, nocodb_network          |
| Data       | `./data/nocodb/`                 |
| Depends on | nocodb-postgres                  |

NocoDB uses its own dedicated PostgreSQL instance (`nocodb-postgres`), completely isolated from the main ChatSuite database.

### Dedicated Database

| Property  | Value                              |
| --------- | ---------------------------------- |
| Container | `chatsuite_nocodb-postgres`        |
| Image     | `postgres:17`                      |
| Network   | nocodb_network                     |
| Volume    | `nocodb_postgres_data`             |
| Database  | `nocodb`                           |

## Files

- `docker-entrypoint-nocodb-postgres.sh` — Creates `nocodb_user` and `nocodb` database on first startup

## Environment Variables

Credentials are set per-environment in `config/env/.env.${NX_APP_ENV}`:

```bash
NOCODB_POSTGRES_PASSWORD=nocodb_password_123    # Admin password
NOCODB_DB_PASSWORD=nocodb_user_pass             # App user password
```

**Use strong, unique passwords for qa and host environments.**

## Usage

```bash
docker compose up nocodb-postgres nocodb -d
open http://localhost:8080                      # Direct
open https://localhost:10443/nocodb/            # Via Nginx proxy
```

## Features

- Spreadsheet, form, gallery, and kanban views
- Auto-generated REST and GraphQL APIs
- Role-based access control
- Webhooks and automation

## Troubleshooting

```bash
docker compose logs nocodb                      # App logs
docker compose logs nocodb-postgres             # Database logs
docker exec chatsuite_nocodb-postgres psql -U nocodb_user -d nocodb -c "\dt"
docker compose config | grep NC_DB              # Verify env loading
```
