# Nginx

Reverse proxy and TLS termination point for all ChatSuite services. Exposes HTTPS on port 10443 and routes requests by URL path.

## Overview

| Property   | Value                            |
| ---------- | -------------------------------- |
| Container  | `chatsuite_nginx`                |
| Build      | `config/nginx/Dockerfile.dev`    |
| Port       | 10443 (HTTPS)                    |
| Network(s) | gateway                          |
| Depends on | client-app, api-customer-service, n8n, pgadmin |

## Files

- `Dockerfile.dev` — Development proxy image build
- `default.dev.conf` — Nginx server configuration (routing rules)
- `../certificates/` — TLS certificates (`localhost-crt.pem`, `localhost-key.pem`)

## Routing

| Path              | Backend Service                |
| ----------------- | ------------------------------ |
| `/`               | client-app:4200                |
| `/api/`           | api-customer-service:3333      |
| `/n8n/`           | n8n:5678                       |
| `/nocodb/`        | nocodb:8080                    |
| `/pgadmin/`       | pgadmin:80                     |
| `/librechat/`     | librechat:3080                 |
| `/mcphub/`        | mcphub:3000                    |
| `/mcp-email/`     | mcp-email-server:9557          |
| `/mindsdb/`       | mindsdb:47334                  |
| `/minio/`         | minio:9001 (Console)           |
| `/minio-api/`     | minio:9000 (API)               |

All routes support WebSocket upgrades. SSE stream buffering is disabled for MCPHub.

## Features

- TLS termination with self-signed certificates (production: CA-signed)
- Dynamic DNS via `resolver 127.0.0.11` (Docker embedded DNS)
- WebSocket proxy on all routes
- Security headers and CORS

## Usage

```bash
# Start backends first, then Nginx
docker compose up -d

# Test connectivity
curl -k https://localhost:10443/
curl -k https://localhost:10443/api/health
```

## Troubleshooting

```bash
docker compose logs nginx                                       # Logs
docker exec chatsuite_nginx nginx -t                            # Config test
docker exec chatsuite_nginx nginx -s reload                     # Reload config
docker exec chatsuite_nginx curl http://client-app:4200         # Test backend
docker exec chatsuite_nginx curl http://api-customer-service:3333/health
```

| Issue                    | Solution                                              |
| ------------------------ | ----------------------------------------------------- |
| Certificate warnings     | Expected with self-signed certs; click **Advanced** → **Proceed** |
| 502/503/504 errors       | Check if backend services are healthy: `docker compose ps` |
| SSL/TLS errors           | Verify cert files exist and have correct permissions  |
| Service not reachable    | Confirm the service is running and on the `gateway` network |

## Production

Replace self-signed certificates, enable rate limiting, and configure WAF rules. See [certificates/README.md](../certificates/README.md) for cert replacement instructions.
