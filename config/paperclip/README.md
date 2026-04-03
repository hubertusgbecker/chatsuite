# Paperclip — AI Agent Orchestration

Open-source orchestration platform for managing teams of AI agents as a company — with
org charts, budgets, governance, goal alignment, and a ticket system.

- **Image**: `ghcr.io/paperclipai/paperclip:latest`
- **Port**: 3100 (API + UI served from same origin)
- **Nginx Route**: `/paperclip/`
- **Health Endpoint**: `GET /api/health` → `{"status":"ok"}`
- **Database**: Shared PostgreSQL (`paperclip` database, initialized by `init-databases.sh`)
- **Deployment Mode**: `authenticated/private` (requires `BETTER_AUTH_SECRET`)
- **Data Volume**: `./data/paperclip:/paperclip` (DB data, secrets, agent workspaces, backups)
- **Upstream**: <https://github.com/paperclipai/paperclip>

## Environment Variables

| Variable                       | Purpose                                           |
| ------------------------------ | ------------------------------------------------- |
| `PAPERCLIP_HOST`               | Docker hostname (`paperclip`)                     |
| `PAPERCLIP_PORT`               | Service port (`3100`)                             |
| `PAPERCLIP_URL`                | Internal URL (`http://paperclip:3100`)            |
| `PAPERCLIP_HOME`               | Data root inside container (`/paperclip`)         |
| `PAPERCLIP_INSTANCE_ID`        | Instance identifier (`default`)                   |
| `PAPERCLIP_DEPLOYMENT_MODE`    | `authenticated` or `local_trusted`                |
| `PAPERCLIP_DEPLOYMENT_EXPOSURE`| `private` or `public`                             |
| `PAPERCLIP_PUBLIC_URL`         | External URL for auth callbacks                   |
| `BETTER_AUTH_SECRET`           | Auth secret — **generate with `openssl rand -hex 32`** |
| `DATABASE_URL`                 | PostgreSQL connection string (overrides embedded DB) |
| `OPENAI_API_KEY`               | Optional — enables OpenAI-based agent adapters    |
| `ANTHROPIC_API_KEY`            | Optional — enables Claude Code agent adapter      |

## First Boot

After the service starts for the first time:

1. Open `https://localhost:10443/paperclip/`
2. Create your initial user account (signup)
3. Bootstrap the CEO invite: `docker exec chatsuite_paperclip pnpm paperclipai auth bootstrap-ceo`
4. Accept the bootstrap invite in the UI

## Troubleshooting

```bash
# Service logs
docker logs chatsuite_paperclip

# Container shell
docker exec -it chatsuite_paperclip /bin/sh

# Health check
curl http://localhost:3100/api/health

# List companies
curl http://localhost:3100/api/companies

# Verify database exists
docker exec chatsuite_postgres psql -U admin -l | grep paperclip

# Fix data directory permissions
tools/dev-scripts/cmd-fix-data-permissions.sh
```
