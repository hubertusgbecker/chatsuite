# MindsDB

AI-powered database that brings machine learning to your data using SQL commands.

## Overview

| Property   | Value                            |
| ---------- | -------------------------------- |
| Container  | `chatsuite_mindsdb`              |
| Image      | `mindsdb/mindsdb:latest`         |
| Port(s)    | 47334 (HTTP), 47335 (MySQL), 47337 (MCP), 47338 (A2A) |
| Network(s) | gateway, database_pg             |
| Data       | `./data/mindsdb/`               |

## Files

- `mindsdb_config.json` — MindsDB configuration
- `docker-entrypoint-mindsdb.sh` — Custom startup script
- `fix-mindsdb-permissions.sh` — Permission fixing script

## Usage

```bash
docker compose up mindsdb -d
open http://localhost:47334                 # Web interface
open https://localhost:10443/mindsdb/       # Via Nginx proxy
```

## API Access

### HTTP API (port 47334)

```bash
curl http://localhost:47334/api/status
curl -X POST http://localhost:47334/api/sql/query \
  -H "Content-Type: application/json" \
  -d '{"query": "SHOW DATABASES;"}'
```

### MySQL Interface (port 47335)

```bash
mysql -h localhost -P 47335 -u mindsdb -p
```

### MCP Endpoint (port 47337)

MindsDB exposes MCP for AI-powered database queries. Can be registered in MCPHub.

## Example: Connect to ChatSuite Database

```sql
CREATE DATABASE my_postgres
WITH ENGINE = "postgres",
PARAMETERS = {
    "user": "admin",
    "password": "admin",
    "host": "postgres",
    "port": "5432",
    "database": "chatsuite"
};
```

## Configuration

Edit `mindsdb_config.json`:

```json
{
  "storage_dir": "/root/mdb_storage",
  "log": { "level": "INFO" },
  "api": {
    "http": { "host": "0.0.0.0", "port": "47334" },
    "mysql": { "host": "0.0.0.0", "port": "47335" }
  }
}
```

## Troubleshooting

```bash
docker compose logs mindsdb                # Container logs
curl http://localhost:47334/api/status      # Health check
docker exec -it chatsuite_mindsdb bash     # Shell access
```
