# ChatSuite Configuration

All service configuration, Docker entrypoints, and environment templates for the ChatSuite platform.

## Directory Structure

```text
config/
├── certificates/            SSL/TLS certificates
├── env/                     Environment configuration (dev, qa, host)
├── librechat/               AI chat platform
├── mcp-browser-use-server/  Browser automation MCP server (planned)
├── mcp-email-server/        Email MCP server
├── mcphub/                  MCP hub management
├── mindsdb/                 AI-powered database
├── minio/                   S3-compatible object storage
├── n8n/                     Workflow automation
├── nginx/                   Reverse proxy and TLS termination
├── nocodb/                  Database GUI / no-code platform
├── pgadmin/                 PostgreSQL administration
└── postgres/                Primary PostgreSQL database
```

## Services

### AI and Chat

| Service                                           | Port  | Purpose                           |
| ------------------------------------------------- | ----- | --------------------------------- |
| [LibreChat](./librechat/README.md)                | 3080  | Multi-model AI chat interface     |
| [MCPHub](./mcphub/README.md)                      | 3000  | Unified MCP server hub            |
| [MCP Email Server](./mcp-email-server/README.md)  | 9557  | IMAP/SMTP via MCP protocol        |
| [MindsDB](./mindsdb/README.md)                    | 47334 | AI database with ML capabilities  |

### Data and Storage

| Service                                           | Port  | Purpose                           |
| ------------------------------------------------- | ----- | --------------------------------- |
| [PostgreSQL](./postgres/README.md)                | 54320 | Primary relational database       |
| [PgAdmin](./pgadmin/README.md)                    | 8081  | PostgreSQL web administration     |
| [NocoDB](./nocodb/README.md)                      | 8080  | No-code database GUI              |
| [MinIO](./minio/README.md)                        | 9000  | S3-compatible object storage      |

### Infrastructure

| Service                                           | Port  | Purpose                           |
| ------------------------------------------------- | ----- | --------------------------------- |
| [Nginx](./nginx/README.md)                        | 10443 | Reverse proxy and TLS termination |
| [n8n](./n8n/README.md)                            | 5678  | Visual workflow automation        |
| [Certificates](./certificates/README.md)          | —     | Self-signed dev certificates      |
| [Environment](./env/README.md)                    | —     | Environment variable management   |

## Quick Start

```bash
# 1. Create runtime config from templates
cp config/env/env.dev config/env/.env.dev
# Edit .env.dev with your API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)

# 2. Set environment and start
pnpm env:set:dev
pnpm start

# 3. Verify
pnpm test
open https://localhost:10443
```

## Network Architecture

Four Docker networks isolate services:

| Network              | Purpose                    | Key Services                                |
| -------------------- | -------------------------- | ------------------------------------------- |
| `gateway`            | Main service mesh          | nginx, api, client, librechat, n8n, nocodb  |
| `database_pg`        | PostgreSQL access          | postgres, pgadmin, api, n8n, mindsdb        |
| `nocodb_network`     | NocoDB isolation           | nocodb, nocodb-postgres                     |
| `librechat_internal` | LibreChat ecosystem        | librechat, mongodb, meilisearch, vectordb   |

## Common Tasks

### Add AI API Keys

```bash
# Edit the active environment file
nano config/env/.env.dev

# Add keys:
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# Restart LibreChat to pick up changes
docker compose restart librechat
```

### Switch Environment

```bash
pnpm env:set:dev    # Development
pnpm env:set:qa     # QA / testing
pnpm env:set:host   # Production
pnpm env:show       # Show active environment
```

### Troubleshooting

```bash
docker compose ps                          # Service status
docker compose logs <service>              # Service logs
docker exec chatsuite_postgres psql -U admin -d chatsuite  # DB shell
curl -k https://localhost:10443/api/health # API health check
```
