# PgAdmin

Web-based PostgreSQL administration interface for managing the ChatSuite database.

## Overview

| Property   | Value                            |
| ---------- | -------------------------------- |
| Container  | `chatsuite_pgadmin`              |
| Image      | `dpage/pgadmin4`                 |
| Port       | 8081                             |
| Network(s) | gateway, database_pg             |
| Data       | `./data/pgadmin/`               |
| Depends on | postgres                         |

## Files

- `docker-entrypoint-pgadmin.sh` — Custom entrypoint for directory setup and permissions

## Usage

```bash
docker compose up pgadmin -d
open http://localhost:8081                      # Direct
open https://localhost:10443/pgadmin/           # Via Nginx proxy
```

### Default Credentials

| Setting   | Default                                               |
| --------- | ----------------------------------------------------- |
| Email     | `${PGADMIN_DEFAULT_EMAIL:-admin@example.com}`         |
| Password  | `${PGADMIN_DEFAULT_PASSWORD:-admin}`                  |

Set in `config/env/.env.${NX_APP_ENV}` or via environment variable fallbacks in `docker-compose.yaml`.

### Connecting to PostgreSQL

After login, add a server connection:

| Field    | Value                    |
| -------- | ------------------------ |
| Host     | `postgres`               |
| Port     | `5432`                   |
| Database | `chatsuite`              |
| Username | `admin`                  |
| Password | (from env file)          |

## NAS / Synology Mounts

When running on Synology DiskStation with SMB/CIFS mounts, the container may not be able to change file ownership. To fix:

1. Find the mount owner UID/GID:

   ```bash
   stat -c '%u:%g %n' ./data/pgadmin
   # or: ls -n ./data | grep pgadmin
   ```

2. Set `HOST_UID` and `HOST_GID` in root `.env`:

   ```bash
   HOST_UID=1026
   HOST_GID=100
   ```

3. Recreate the container:

   ```bash
   docker compose up -d --no-deps --build pgadmin
   ```

> Prefer NFS with Unix permissions over SMB mounts when possible. Always back up `./data/pgadmin/` before changing ownership.

## Troubleshooting

```bash
docker compose logs pgadmin                     # Container logs
docker compose ps pgadmin                       # Health status
```

| Issue             | Solution                                              |
| ----------------- | ----------------------------------------------------- |
| Slow startup      | Healthcheck allows 120s start period; wait for ready  |
| Permission errors | See NAS / Synology section above                      |
| Login fails       | Verify `PGADMIN_DEFAULT_EMAIL` / `PASSWORD` in env    |
