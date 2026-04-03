# AGENTS.md Version 3

<guidelines>
ChatSuite is a comprehensive AI collaboration platform that orchestrates multiple AI services, workflow automation tools, and database systems into a unified ecosystem. It uses Docker-based microservices architecture with NestJS APIs, React frontends, and an Nx monorepo structure to enable seamless collaboration between AI systems, automation workflows, and human users.

This document is the authoritative reference and single source of truth for all coding standards, project structure, and development practices within the ChatSuite ecosystem.

**Mission**: Enable seamless collaboration between AI systems, automation workflows, and human users through intelligent service orchestration and unified data access.
</guidelines>

---

## Development Rules

Critical guidelines that must be followed at all times.

### Package Management

- **Always use `pnpm`** -- never use npm or yarn
- **Always use `uv`** for Python -- never use pip, poetry, or conda
- Never create random example files to test features; use inline code in terminal

```bash
# Node.js
pnpm install              # Install dependencies
pnpm add <package>        # Add package

# Python
uv venv --python 3.11
source .venv/bin/activate
uv sync
```

### Type Safety

- TypeScript strict mode for all code
- Pydantic v2 models for all Python schemas, task inputs/outputs, and tools I/O
- All public functions must have type annotations
- No `any` types without justification
- Explicit return types for all functions
- Use interfaces and types for data structures

```typescript
// Correct
interface UserData {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<UserData | null> {
  // ...
}
```

### Pre-Commit and Quality Gates

- Always run `pnpm lint` and `pnpm nx:test` before making PRs
- Git hooks (Husky) automatically enforce: Biome lint, affected unit tests, conventional commit messages
- All commits must pass quality gates

### Documentation

- TSDoc comments for all public APIs with `@param`, `@returns`, `@throws`
- Update README.md and AGENTS.md for significant changes
- Document all environment variables in templates

### Security

- Never commit secrets, API keys, or `.env.*` files
- Use environment variables for all sensitive data
- Validate all user inputs; sanitize all outputs
- Parameterized queries only -- no string concatenation in SQL
- Follow OWASP Top 10 guidelines
- Log errors without exposing sensitive data

### Test-Driven Development

- Always write tests before implementation code
- Follow Red-Green-Refactor:
  1. **Red**: Write a failing test defining desired behavior
  2. **Green**: Write minimal code to pass the test
  3. **Refactor**: Improve code quality while keeping tests green
- Test behavior, not implementation
- Use descriptive test names that explain what should happen
- Never skip tests to save time

### Incremental Development

- Break all work into small steps (15-30 minutes each)
- Commit after each working increment
- If a task feels too big, break it down further
- Focus on one failing test at a time

### Code Organization

- Place development scripts in `tools/dev-scripts/` with `cmd-` prefix
- Extract reusable code into appropriate library under `libs/`
- All services run in Docker via docker-compose
- Never run services directly on host (except local Nx dev server)

---

## Project Overview

| Field           | Value                                                     |
| --------------- | --------------------------------------------------------- |
| Project         | ChatSuite                                                 |
| Owner           | Dr. Hubertus Becker                                       |
| Repository      | https://github.com/hubertusgbecker/chatsuite              |
| License         | MIT                                                       |
| Node.js         | >=24.0.0 (`.nvmrc`: 24)                                  |
| Package Manager | pnpm 10.26.2                                              |
| Monorepo        | Nx 22.6.4                                                 |
| Backend         | NestJS 11 + Express 5, TypeScript 6                       |
| Frontend        | React 19, TypeScript 6                                    |
| Bundler         | Vite 8 + SWC                                              |
| Linter/Formatter| Biome 2.4                                                 |
| Test Runner     | Vitest 4.1                                                |
| Python          | 3.11+ with `uv`                                           |

### Platform Components

| Component           | Purpose                           |
| ------------------- | --------------------------------- |
| LibreChat           | Multi-model AI chat interface     |
| n8n                 | Visual workflow automation        |
| MindsDB             | AI-powered database platform      |
| NocoDB              | Database spreadsheet interface    |
| MinIO               | S3-compatible object storage      |
| MCPHub              | Model Context Protocol hub        |
| MCP Email           | Intelligent email processing      |
| React Client App    | Web frontend                      |
| NestJS API          | Scalable backend services         |
| Nginx               | Reverse proxy + SSL termination   |

---

## Repository Structure

```
chatsuite/
├── apps/
│   ├── api-customer-service/     # NestJS backend API
│   └── client-app/               # React frontend application
├── libs/
│   └── core/                     # Shared NestJS core library
├── config/
│   ├── env/                      # Environment templates (env.dev, env.qa, env.host)
│   ├── nginx/                    # Reverse proxy configuration
│   ├── postgres/                 # PostgreSQL init scripts
│   ├── librechat/                # LibreChat + MongoDB + VectorDB config
│   ├── mcphub/                   # MCPHub configuration
│   ├── mcp-email-server/         # MCP Email config
│   ├── mcp-browser-use-server/   # MCP Browser Use config (preparation)
│   ├── mindsdb/                  # MindsDB configuration
│   ├── minio/                    # MinIO object storage config
│   ├── n8n/                      # n8n workflow config
│   ├── nocodb/                   # NocoDB config
│   └── pgadmin/                  # PgAdmin config
├── schema/
│   ├── consumer/                 # Consumer Prisma schema
│   ├── customer/                 # Customer Prisma schema
│   └── orchestrator/             # Orchestrator Prisma schema
├── data/                          # Persistent data (bind mounts, gitignored)
├── tools/dev-scripts/             # Build and automation scripts (cmd-* prefix)
├── docs/                          # Documentation
├── tmp/                           # Temporary build artifacts
├── docker-compose.yaml            # Service orchestration (16 containers)
├── nx.json                        # Nx workspace configuration
├── biome.json                     # Biome linter/formatter config
├── package.json                   # Root dependencies and scripts
└── pnpm-workspace.yaml            # pnpm workspace config
```

### Directory Conventions

| Directory             | Rule                                                  |
| --------------------- | ----------------------------------------------------- |
| `apps/`               | Deployable applications, created via Nx generators    |
| `libs/`               | Shared code extracted as Nx library projects          |
| `config/`             | All Docker and service configuration                  |
| `data/`               | Persistent data volumes (bind mounts, gitignored)     |
| `schema/`             | Database schemas with Prisma migrations               |
| `tools/dev-scripts/`  | All dev scripts with `cmd-` prefix                    |
| `docs/`               | Project documentation                                 |
| `tmp/`                | Temporary files only, never production code           |

---

## Quick Reference

### Essential Commands

```bash
# Platform Lifecycle
pnpm start                       # Launch all Docker services
pnpm stop                        # Graceful shutdown
pnpm rebuild                     # Full rebuild (stop + build + start)
pnpm test                        # Health checks and verification

# Environment
pnpm env:show                    # Display current environment
pnpm env:set:dev                 # Switch to development
pnpm env:set:qa                  # Switch to QA
pnpm env:set:host                # Switch to production
pnpm env:verify                  # Verify security configuration

# Development
pnpm lint                        # Biome lint check
pnpm format                      # Biome format + fix
pnpm nx:test                     # Run all unit tests (Vitest)
pnpm nx:test:affected            # Test only changed code
pnpm nx:integration              # Run all integration tests
pnpm nx:integration:affected     # Run affected integration tests
pnpm nx:build                    # Build all projects

# Nx
pnpm nx g @nx/react:lib my-lib   # Generate React library
pnpm nx g @nx/nest:app my-api    # Generate NestJS app
pnpm nx graph                    # Dependency graph
pnpm nx affected --target=test   # Test affected projects
```

### Helper Scripts

```bash
tools/dev-scripts/cmd-rebuild.sh              # Full platform rebuild
tools/dev-scripts/cmd-test.sh                 # Run platform health checks
tools/dev-scripts/cmd-verify-security.sh      # Security configuration audit
tools/dev-scripts/cmd-fix-data-permissions.sh # Fix bind mount permissions
tools/dev-scripts/cmd-write-env.sh            # Write environment variable to .env
tools/dev-scripts/cmd-resolve-env.js          # Resolve current NX_APP_ENV
tools/dev-scripts/cmd-check-dependencies.js   # Verify Node/pnpm/Docker versions
tools/dev-scripts/cmd-check-node-modules.js   # Verify node_modules integrity
tools/dev-scripts/cmd-clean-node-modules.sh   # Remove all node_modules
tools/dev-scripts/cmd-prune.js                # Docker system prune + cleanup
```

### Service Ports

| Service              | Direct Port | Nginx Route (10443) |
| -------------------- | ----------- | ------------------- |
| Client App           | 4200        | /app/               |
| API Customer Service | 3333        | /api/customer/      |
| LibreChat            | 3080        | /librechat/         |
| PgAdmin              | (internal)  | /pgadmin/           |
| n8n                  | 5678        | /n8n/               |
| NocoDB               | 8080        | /nocodb/            |
| MCPHub               | 3000        | /mcphub/            |
| MCP Email            | 9557        | /mcp-email/         |
| MindsDB HTTP         | 47334       | /mindsdb/           |
| MinIO API            | 9000        | /minio-api/         |
| MinIO Console        | 9001        | /minio/             |
| Nginx (HTTPS)        | 10443       | --                  |

### Critical Files

| File / Directory                    | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `AGENTS.md`                         | Authoritative development reference      |
| `docker-compose.yaml`               | All 16 service definitions               |
| `config/nginx/default.dev.conf`     | Central reverse proxy routing            |
| `config/env/env.{dev,qa,host}`      | Environment variable templates           |
| `config/postgres/init-databases.sh` | PostgreSQL bootstrap script              |
| `.github/workflows/ci.yaml`         | CI/CD pipeline (7 jobs)                  |
| `biome.json`                        | Linter and formatter configuration       |
| `nx.json`                           | Nx workspace + caching configuration     |

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 24+ and pnpm 10+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- Python 3.11+ and uv (`brew install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Git configured with SSH keys

### Setup

```bash
git clone git@github.com:hubertusgbecker/chatsuite.git
cd chatsuite
pnpm install

# Create runtime config from templates
cp config/env/env.dev config/env/.env.dev
cp config/env/env.qa config/env/.env.qa
cp config/env/env.host config/env/.env.host
# Edit .env.* files with actual credentials -- NEVER commit these

# Set environment and launch
pnpm env:set:dev
pnpm start
pnpm test                # Verify all services healthy
open https://localhost:10443
```

### Environment Configuration

| File                       | Scope         | In Git? |
| -------------------------- | ------------- | ------- |
| `config/env/env.dev`       | Dev template  | Yes     |
| `config/env/env.qa`        | QA template   | Yes     |
| `config/env/env.host`      | Prod template | Yes     |
| `config/env/.env.dev`      | Dev runtime   | No      |
| `config/env/.env.qa`       | QA runtime    | No      |
| `config/env/.env.host`     | Prod runtime  | No      |
| `.env` (root)              | Active env    | No      |

The root `.env` contains `NX_APP_ENV=dev|qa|host` which selects the active environment file.

---

## Development Workflow

### Git Hooks (Husky)

| Hook          | Checks                                                          |
| ------------- | --------------------------------------------------------------- |
| `pre-commit`  | Biome lint, unit tests on affected projects                     |
| `commit-msg`  | Conventional commit format validation                           |
| `pre-push`    | Full unit tests, affected integration tests, security verify    |

### Branching Strategy

| Branch         | Purpose                 |
| -------------- | ----------------------- |
| `main`         | Production-ready code   |
| `feature/*`    | New features            |
| `fix/*`        | Bug fixes               |
| `docs/*`       | Documentation updates   |
| `refactor/*`   | Code refactoring        |

### Commit Convention

```
feat: add new feature            fix: resolve bug
docs: update documentation       refactor: restructure code
test: add tests                  chore: update dependencies
perf: improve performance        ci: update CI/CD
```

### Pull Request Process

1. Create feature branch from `main`
2. Implement with TDD (test first, implement, refactor)
3. Run `pnpm lint && pnpm nx:test`
4. Push and create PR
5. CI pipeline validates automatically
6. Squash and merge after review

---

## Testing Strategy

### Unit Tests

- **Location**: `src/**/*.spec.ts` inside each project
- **Runner**: Vitest 4.1
- **Coverage**: >80% target for business logic
- **Config**: `jest.config.ts` per project (Vitest with Jest compat)

```bash
pnpm nx test api-customer-service          # Run tests for one project
pnpm nx:test                               # Run all unit tests
pnpm nx:test:affected                      # Run only affected
```

### Integration Tests

- **Location**: `tests/integration/` inside each project
- **Runner**: Vitest with real Docker services (no mocks)
- **Config**: `jest.config.integration.ts` per project
- **Status**: 24/24 tests passing across 8 services

```bash
pnpm nx integration api-customer-service   # One project
pnpm nx:integration                        # All projects (serial)
pnpm nx:integration:affected               # Only affected
```

**Service coverage**: PostgreSQL (54320), MongoDB (27018), MinIO (9000), n8n (5678), NocoDB (8080), MindsDB (47334), MCPHub (3000), MCP Email (9557).

Test helpers in `tests/integration/helpers/` provide setup, cleanup, and factory utilities for each service. Tests automatically load environment from `config/env/.env.${NX_APP_ENV}` and map Docker hostnames to localhost.

### E2E Tests

- **Location**: `e2e/` at project root
- **Runner**: Vitest + supertest
- **Config**: `e2e/vitest.config.ts`

```bash
pnpm e2e                                   # Run all e2e tests
pnpm e2e:api                               # API e2e only
pnpm e2e:client                            # Client e2e only
```

### CI/CD Pipeline

Defined in `.github/workflows/ci.yaml` with 7 jobs: lint, type check, unit tests, integration tests, build, security scan, coverage. Runs on every PR and push to main. Coverage reports uploaded to Codecov.

Additional workflows:
- `kics-security-scan.yml`: Infrastructure-as-Code security scanning
- `stale.yaml`: Automatic stale issue/PR management

---

## Architecture

### Docker Services (16 containers, 4 networks)

| Service              | Image                     | Networks                    |
| -------------------- | ------------------------- | --------------------------- |
| nginx                | custom build              | gateway                     |
| postgres             | postgres:17               | gateway, database_pg        |
| pgadmin              | dpage/pgadmin4            | gateway, database_pg        |
| api-customer-service | custom build              | gateway, database_pg        |
| client-app           | custom build              | gateway                     |
| librechat            | custom build              | gateway, librechat_internal |
| mongodb              | mongo:latest              | gateway, librechat_internal |
| meilisearch          | meilisearch:v1.12.3       | librechat_internal          |
| vectordb             | ankane/pgvector:latest    | librechat_internal          |
| mindsdb              | mindsdb/mindsdb:latest    | gateway, database_pg        |
| n8n                  | n8nio/n8n:latest          | gateway, database_pg        |
| nocodb-postgres      | postgres:17               | nocodb_network              |
| nocodb               | nocodb/nocodb:latest      | gateway, nocodb_network     |
| mcphub               | custom build              | gateway                     |
| mcp-email-server     | zerolib/mcp-email         | gateway                     |
| minio                | minio/minio:latest        | gateway                     |

**Networks**: `gateway` (main service mesh), `database_pg` (PostgreSQL access), `nocodb_network` (NocoDB isolation), `librechat_internal` (LibreChat ecosystem).

### Nginx Reverse Proxy

All services accessible via HTTPS on port 10443:

- SSL termination with certificates in `config/certificates/`
- WebSocket support for all routes
- Dynamic DNS resolution (prevents startup ordering failures)
- Path-based routing to all services

### Database Architecture

| Database   | Engine            | Purpose                              |
| ---------- | ----------------- | ------------------------------------ |
| PostgreSQL | postgres:17       | Application data, n8n, MindsDB       |
| MongoDB    | mongo:latest      | LibreChat conversations              |
| VectorDB   | pgvector:latest   | Embeddings, semantic search          |
| NocoDB PG  | postgres:17       | NocoDB isolated database             |
| MinIO      | minio:latest      | S3-compatible object/file storage    |

### Prisma Schemas

Three Prisma schemas in `schema/`:

- `consumer/` -- Consumer-facing data models
- `customer/` -- Customer/business data models
- `orchestrator/` -- Workflow orchestration models

### Code Sharing

Libraries under `libs/` as Nx projects:

- **`libs/core`** -- Shared NestJS modules: health checks, global exception filter, validation pipes, Prisma service, common decorators

Future library categories as needed: `ui/`, `features/`, `data/`, `utils/`.

---

## Security

- Never commit secrets or `.env.*` files
- All sensitive config via environment variables
- Input validation on all API entry points
- Output sanitization for user-facing data
- Parameterized queries only (Prisma handles this)
- TLS for all external traffic (nginx SSL termination)
- HttpOnly cookies for authentication tokens
- CORS properly configured per environment
- KICS scans for infrastructure-as-code vulnerabilities
- Biome security lint rules enabled

---

## Deployment

### Production (Synology DiskStation)

```bash
# SSH to DiskStation
ssh root@synology
cd /volume1/docker/chatsuite

# Deploy
pnpm env:set:host
pnpm rebuild
pnpm test

# Verify
docker ps -a | grep chatsuite
```

### Health Checks

All services have Docker healthchecks defined in `docker-compose.yaml`:

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:3333/health']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Troubleshooting

```bash
# Service logs
docker logs chatsuite_<service_name>
docker logs chatsuite_nginx --tail 100

# Container shell
docker exec -it chatsuite_<service_name> /bin/sh

# Nginx config test
docker exec chatsuite_nginx nginx -t

# Database connection
docker exec -it chatsuite_postgres psql -U admin -d chatsuite

# Port conflicts
lsof -i :10443

# Environment check
pnpm env:show
ls -la config/env/.env.*
```

---

## Nx Workspace

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

### Working with Nx

- Always use `nx` commands over direct tooling for build, lint, test, e2e
- Use `nx_workspace` tool to understand workspace architecture
- Use `nx_project_details` tool to analyze specific projects
- Use `nx_docs` tool for configuration questions (never assume)
- Use affected commands to optimize CI: `nx affected --target=test`

```bash
# Generate
nx g @nx/react:lib my-library
nx g @nx/nest:app my-api

# Run tasks
nx build my-app
nx test my-library
nx lint my-app

# Affected (CI optimization)
nx affected --target=test
nx affected --target=build
nx affected --target=lint

# Multiple targets
nx run-many --target=test --all
nx run-many --target=integration --all

# Visualize
nx graph
```

<!-- nx configuration end-->

---

## Glossary

| Term                 | Definition                                                       |
| -------------------- | ---------------------------------------------------------------- |
| Service              | Docker container exposed via HTTP/HTTPS                          |
| Library              | Shared Nx project under `libs/`                                  |
| Unified Route        | Path on nginx proxy (port 10443)                                 |
| Integration Test     | Test against real Docker services without mocks                  |
| Environment Template | Git-tracked config template (`env.dev`, `env.qa`, `env.host`)    |
| Runtime Config       | Actual `.env.*` file with secrets, never committed               |
| MCP                  | Model Context Protocol for AI agent communication                |
| Bind Mount           | Docker volume mapped to `./data/` directory on host              |
| TSDoc                | TypeScript documentation standard                                |
| RBAC                 | Role-Based Access Control                                        |

---

**Last Updated**: 2026-04-03
**Version**: 3.0
**Document Owner**: Dr. Hubertus Becker
