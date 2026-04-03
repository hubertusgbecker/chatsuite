# AGENTS.md

<guidelines>
ChatSuite is a comprehensive AI collaboration platform that orchestrates multiple AI services, workflow automation tools, and database systems into a unified ecosystem. It uses Docker-based microservices architecture with NestJS APIs, React frontends, and an Nx monorepo structure to enable seamless collaboration between AI systems, automation workflows, and human users.

This document is the authoritative reference and single source of truth for all coding standards, project structure, and development practices within the ChatSuite ecosystem. When in doubt, this file wins.

**Mission**: Enable seamless collaboration between AI systems, automation workflows, and human users through intelligent service orchestration and unified data access.
</guidelines>

---

## Development Rules

- Always use [`pnpm`](https://pnpm.io/) -- never npm or yarn.
- Always use [`uv`](https://github.com/astral-sh/uv) for Python -- never pip, poetry, or conda.
- TypeScript strict mode for all code. Pydantic v2 models for all Python schemas.
- No `any` types without justification. Explicit return types for all functions.
- TSDoc comments (`@param`, `@returns`, `@throws`) for all public APIs.
- Never commit secrets, API keys, or `.env.*` files.
- Parameterized queries only -- no string concatenation for SQL.
- Always write tests before implementation (Red-Green-Refactor TDD cycle).
- Break all work into small steps (15-30 min each). Commit after each working increment.
- Never create random example files to test features; use inline code in terminal.
- Place dev scripts in `tools/dev-scripts/` with `cmd-` prefix.
- All services run in Docker via docker-compose. Never run directly on host (except Nx dev server).
- Always run `pnpm lint` and `pnpm nx:test` before making PRs.

```bash
# Node.js                          # Python
pnpm install                       uv venv --python 3.11
pnpm add <package>                 source .venv/bin/activate
                                   uv sync
```

---

## Code Style (Biome 2.4)

Enforced automatically via Biome. Key settings from `biome.json`:

| Setting          | Value                    |
| ---------------- | ------------------------ |
| Indent           | 2 spaces                 |
| Line width       | 100 characters           |
| Line ending      | LF                       |
| Quotes           | Single (JS/TS)           |
| JSX quotes       | Double                   |
| Semicolons       | Always                   |
| Trailing commas  | All                      |
| Arrow parens     | Always                   |
| Bracket spacing  | true                     |

**Critical lint rules** (errors that block commits):

- `useConst` -- prefer `const` over `let`
- `noUnusedVariables` / `noUnusedImports` -- dead code removal
- `noDoubleEquals` -- use `===` always
- `noShadowRestrictedNames` -- no shadowing globals
- `noDangerouslySetInnerHtml` -- XSS prevention
- `noExplicitAny` -- warn (error in production code, relaxed in tests)
- `noConsole` -- warn (allowed: `console.warn`, `console.error`)

Test files (`*.spec.ts`, `*.test.ts`) have relaxed rules: `noExplicitAny` off, `noConsole` off.

---

## Commit Convention

Enforced by Husky `commit-msg` hook with this regex:

```
^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\([a-zA-Z0-9_-]+\))?: .{1,72}
```

| Type     | Purpose              | Type     | Purpose              |
| -------- | -------------------- | -------- | -------------------- |
| feat     | New feature          | fix      | Bug fix              |
| docs     | Documentation        | refactor | Code restructure     |
| test     | Add/fix tests        | chore    | Maintenance          |
| perf     | Performance          | ci       | CI/CD changes        |
| build    | Build system         | revert   | Revert commit        |
| style    | Formatting only      |          |                      |

Scope is optional: `feat(api): add health endpoint` or `fix: resolve login bug`.

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
| Monorepo        | Nx 22.6.4 (`defaultProject`: api-customer-service)        |
| Backend         | NestJS 11, Express 5, TypeScript 6                        |
| Frontend        | React 19, React Router, Tailwind CSS, TypeScript 6        |
| Bundler         | Vite 8 + SWC                                              |
| Linter/Formatter| Biome 2.4.10                                              |
| Test Runner     | Vitest 4.1                                                |
| Python          | 3.11+ with `uv`                                           |
| Target          | ES2022, module: ESNext, moduleResolution: bundler          |

---

## Repository Structure

```
chatsuite/
├── apps/
│   ├── api-customer-service/      # NestJS backend API (port 3333)
│   │   ├── src/app/               # Controllers, services, module
│   │   ├── tests/integration/     # Integration tests + helpers
│   │   ├── vitest.config.ts       # Unit test config
│   │   └── vitest.config.integration.ts
│   └── client-app/                # React frontend (port 4200)
│       ├── src/                   # App component, main.tsx, assets
│       ├── config/nginx/          # Client-specific nginx configs
│       └── vite.config.ts         # Vite bundler config
├── libs/
│   └── core/                      # Shared NestJS library (@chatsuite/core)
│       └── src/                   # bootstrap, dto, exceptions, filters, middleware
├── config/
│   ├── env/                       # Environment templates (env.dev, env.qa, env.host)
│   ├── nginx/                     # Reverse proxy (Dockerfile.dev, default.dev.conf)
│   ├── postgres/                  # init-databases.sh, docker-entrypoint
│   ├── librechat/                 # Dockerfile, entrypoint, librechat.yaml
│   ├── mcphub/                    # Dockerfile.custom, mcp_settings.json.example
│   ├── mcp-email-server/          # config.example.toml
│   ├── mindsdb/                   # Dockerfile, entrypoint, mindsdb_config.json
│   ├── minio/                     # MinIO object storage
│   ├── n8n/                       # Dockerfile, entrypoint
│   ├── nocodb/                    # entrypoint
│   └── pgadmin/                   # entrypoint
├── schema/
│   ├── consumer/prisma/           # User, Conversation, Message models
│   ├── customer/prisma/           # Customer data models
│   └── orchestrator/              # Workflow, Task models
├── e2e/                           # End-to-end tests (Vitest + supertest)
│   ├── tests/api/                 # API health checks
│   └── tests/client/              # Client app tests
├── data/                          # Persistent bind mounts (gitignored)
├── tools/dev-scripts/             # Automation scripts (cmd-* prefix)
├── docs/                          # Documentation
├── tmp/                           # Temporary files only
├── docker-compose.yaml            # 17 service definitions
├── docker-compose.base.yaml       # Shared service base (nx-base)
├── biome.json                     # Linter/formatter config
├── nx.json                        # Nx workspace config
├── tsconfig.base.json             # Shared TypeScript config + path aliases
├── versions.json                  # App versions: {"client-app":"1.0.0","api-customer-service":"1.0.0"}
└── pnpm-workspace.yaml            # Workspace: apps/*, libs/*
```

### Directory Conventions

| Directory             | Rule                                                     |
| --------------------- | -------------------------------------------------------- |
| `apps/`               | Deployable applications, created via Nx generators       |
| `libs/`               | Shared code extracted as Nx library projects             |
| `config/`             | All Docker and service configuration                     |
| `data/`               | Persistent data volumes (bind mounts, gitignored)        |
| `schema/`             | Database schemas with Prisma migrations                  |
| `tools/dev-scripts/`  | All dev scripts with `cmd-` prefix                       |
| `e2e/`                | End-to-end tests (workspace-level)                       |
| `docs/`               | Project documentation                                    |
| `tmp/`                | Temporary files only, never production code              |

### TypeScript Path Aliases (`tsconfig.base.json`)

```
@chatsuite/core       → libs/core/src/index.ts       (exists)
@chatsuite/core/*     → libs/core/src/*               (exists)
@chatsuite/ui/*       → libs/ui/src/*                  (reserved)
@chatsuite/features/* → libs/features/src/*            (reserved)
@chatsuite/data/*     → libs/data/src/*                (reserved)
@chatsuite/utils      → libs/utils/src/index.ts        (reserved)
```

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
pnpm lint                        # Biome lint check (apps/ only)
pnpm format                      # Biome format + fix
pnpm nx:test                     # Run all unit tests (Vitest)
pnpm nx:test:affected            # Test only changed code
pnpm nx:integration              # Run all integration tests (serial)
pnpm nx:integration:affected     # Run affected integration tests
pnpm nx:build                    # Build all projects

# E2E
pnpm e2e                         # All e2e tests
pnpm e2e:api                     # API health e2e
pnpm e2e:client                  # Client app e2e

# Nx Generators
pnpm nx g @nx/react:lib my-lib   # Generate React library
pnpm nx g @nx/nest:app my-api    # Generate NestJS app
pnpm nx graph                    # Dependency visualization
pnpm nx affected --target=test   # Test affected projects
```

### Helper Scripts

```bash
tools/dev-scripts/cmd-rebuild.sh              # Full platform rebuild (down + build + up)
tools/dev-scripts/cmd-test.sh                 # Run platform health checks
tools/dev-scripts/cmd-verify-security.sh      # Security configuration audit
tools/dev-scripts/cmd-fix-data-permissions.sh # Fix bind mount permissions
tools/dev-scripts/cmd-write-env.sh            # Write environment variable to .env
tools/dev-scripts/cmd-resolve-env.js          # Resolve current NX_APP_ENV
tools/dev-scripts/cmd-check-dependencies.js   # Verify Node/pnpm/Docker versions
tools/dev-scripts/cmd-check-node-modules.js   # Verify node_modules integrity
tools/dev-scripts/cmd-clean-node-modules.sh   # Remove all node_modules
tools/dev-scripts/cmd-prune.js                # Docker system prune + cleanup
tools/dev-scripts/cmd-generate-calver.js      # Calendar versioning generator
tools/dev-scripts/cmd-bump-project-version.js # Version bumping utility
tools/dev-scripts/cmd-migrate-n8n-sqlite-to-postgres.py  # n8n DB migration (Python)
```

### Service Ports

| Service              | Direct Port  | Nginx Route (10443) |
| -------------------- | ------------ | ------------------- |
| Client App           | 4200         | /                   |
| API Customer Service | 3333         | /api/               |
| LibreChat            | 3080         | /librechat/         |
| PgAdmin              | 8081         | /pgadmin/           |
| n8n                  | 5678         | /n8n/               |
| NocoDB               | 8080         | /nocodb/            |
| MCPHub               | 3000         | /mcphub/            |
| MCP Email            | 9557         | /mcp-email/         |
| MindsDB HTTP         | 47334        | /mindsdb/           |
| MinIO API            | 9000         | /minio-api/         |
| MinIO Console        | 9001         | /minio/             |
| Paperclip            | 3100         | /paperclip/         |
| PostgreSQL           | 54320        | --                  |
| MongoDB              | 27018        | --                  |
| Nginx (HTTPS)        | 10443        | --                  |

### Critical Files

| File / Directory                    | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `AGENTS.md`                         | Authoritative development reference      |
| `docker-compose.yaml`               | All 17 service definitions               |
| `docker-compose.base.yaml`          | Shared base service config (nx-base)     |
| `config/nginx/default.dev.conf`     | Central reverse proxy routing            |
| `config/env/env.{dev,qa,host}`      | Environment variable templates           |
| `config/postgres/init-databases.sh` | PostgreSQL bootstrap script              |
| `.github/workflows/ci.yaml`         | CI/CD pipeline (7 jobs)                  |
| `biome.json`                        | Linter and formatter configuration       |
| `nx.json`                           | Nx workspace + caching configuration     |
| `tsconfig.base.json`                | Shared TS config + path aliases          |
| `versions.json`                     | Application version tracking             |

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
| `.env.example`             | Example       | Yes     |

Root `.env` contains `NX_APP_ENV=dev|qa|host` which selects the active environment file.

---

## Development Workflow

### Git Hooks (Husky)

| Hook          | Checks                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| `pre-commit`  | `pnpm lint`, `nx affected --target=test --base=HEAD~1 --parallel=3`            |
| `commit-msg`  | Conventional commit regex validation (72-char subject, types + optional scope) |
| `pre-push`    | `pnpm nx:test`, `nx affected --target=integration --parallel=1`, `pnpm env:verify` |

### Branching Strategy

| Branch         | Purpose                 |
| -------------- | ----------------------- |
| `main`         | Production-ready code   |
| `feature/*`    | New features            |
| `fix/*`        | Bug fixes               |
| `docs/*`       | Documentation updates   |
| `refactor/*`   | Code refactoring        |

### Pull Request Process

1. Create feature branch from `main`
2. Implement with TDD (test first, implement, refactor)
3. Run `pnpm lint && pnpm nx:test`
4. Push and create PR
5. CI pipeline validates automatically (7 jobs)
6. Squash and merge after review

---

## Testing Strategy

### Unit Tests

- **Location**: `src/**/*.spec.ts` inside each project
- **Runner**: Vitest 4.1
- **Config**: `vitest.config.ts` per project
- **Coverage**: >80% target for business logic

```bash
pnpm nx test api-customer-service          # One project
pnpm nx:test                               # All unit tests
pnpm nx:test:affected                      # Only affected
```

### Integration Tests

- **Location**: `tests/integration/` inside each project
- **Runner**: Vitest with real Docker services (no mocks)
- **Config**: `vitest.config.integration.ts` per project
- **Timeout**: 30 seconds per test
- **Caching**: Disabled (`cache: false` in nx.json)
- **Status**: 24/24 tests passing across 9 services

```bash
pnpm nx integration api-customer-service   # One project
pnpm nx:integration                        # All projects (serial, --parallel=1)
pnpm nx:integration:affected               # Only affected
```

**Service coverage**: PostgreSQL (54320), MongoDB (27018), MinIO (9000), n8n (5678), NocoDB (8080), MindsDB (47334), MCPHub (3000), MCP Email (9557), Paperclip (3100).

**Test helpers** in `tests/integration/helpers/`:

| Helper              | Functions                                                         |
| ------------------- | ----------------------------------------------------------------- |
| `test-db.ts`        | `setupTestDatabase()`, `cleanupTestDatabase()`, `closeTestDatabase()` |
| `test-mongodb.ts`   | `setupTestMongoDB()`, `createTestCollection()`, `verifyMongoConnection()` |
| `test-minio.ts`     | `setupTestMinIO()`, `getMinIOClient()`                             |
| `test-n8n.ts`       | `setupTestN8n()`, `createTestWorkflow()`, `cleanupTestN8n()`       |
| `test-nocodb.ts`    | `setupTestNocodb()`, `createTestBase()`, `cleanupTestNocodb()`     |
| `test-mindsdb.ts`   | `setupTestMindsDB()`, `executeMindsDBQuery()`, `listMindsDBDatabases()` |
| `test-mcphub.ts`    | `setupTestMCPHub()`, `verifyMCPHubConnection()`, `listMCPServers()` |
| `test-mcp-email.ts` | `setupTestMCPEmail()`, `verifyMCPEmailConnection()`, `checkMCPEmailSSEEndpoint()` |
| `test-paperclip.ts` | `setupTestPaperclip()`, `verifyPaperclipConnection()`, `listPaperclipCompanies()` |
| `test-server.ts`    | `setupTestServer()`, `closeTestServer()`, `getTestServer()`        |
| `factories.ts`      | `UserFactory.create()`, `ConversationFactory.create()` (uses @faker-js) |

Tests automatically load environment from `config/env/.env.${NX_APP_ENV}` and map Docker hostnames to localhost. Optional services (n8n, NocoDB) skip gracefully when credentials are not configured.

### E2E Tests

- **Location**: `e2e/` at workspace root
- **Runner**: Vitest + supertest
- **Config**: `e2e/vitest.config.ts`

```bash
pnpm e2e                                   # All e2e tests
pnpm e2e:api                               # API health endpoint tests
pnpm e2e:client                            # Client rendering tests
```

### CI/CD Pipeline

**`.github/workflows/ci.yaml`** -- 7 jobs on every PR and push to `main`: lint, type check, unit tests, integration tests, build, security scan, coverage (uploaded to Codecov).

**`.github/workflows/kics-security-scan.yml`** -- Weekly (Monday 6 AM UTC) + push to main. Runs KICS IaC scan and Trivy container scans on nginx, api-customer-service, and client-app images. Fails on high severity.

**`.github/workflows/stale.yaml`** -- Automatic stale issue/PR management.

---

## Architecture

### Docker Services (17 containers, 4 networks)

| Service              | Image / Build                         | Port  | Networks                    |
| -------------------- | ------------------------------------- | ----- | --------------------------- |
| nginx                | `config/nginx/Dockerfile.dev`         | 10443 | gateway                     |
| postgres             | `postgres:17`                         | 54320 | gateway, database_pg        |
| pgadmin              | `dpage/pgadmin4`                      | 8081  | gateway, database_pg        |
| api-customer-service | `apps/.../Dockerfile.dev` + nx-base   | 3333  | gateway, database_pg        |
| client-app           | `apps/.../Dockerfile.dev` + nx-base   | 4200  | gateway                     |
| librechat            | `config/librechat/Dockerfile`         | 3080  | gateway, librechat_internal |
| mongodb              | `mongo:latest`                        | 27018 | librechat_internal          |
| meilisearch          | `getmeili/meilisearch:v1.12.3`        | 7700  | librechat_internal          |
| vectordb             | `config/librechat/vectordb/Dockerfile` | --   | librechat_internal          |
| mindsdb              | `config/mindsdb/Dockerfile`           | 47334 | gateway, database_pg        |
| n8n                  | `config/n8n/Dockerfile`               | 5678  | gateway, database_pg        |
| nocodb-postgres      | `postgres:17`                         | --    | nocodb_network              |
| nocodb               | `nocodb/nocodb:latest`                | 8080  | gateway, nocodb_network     |
| mcphub               | `config/mcphub/Dockerfile.custom`     | 3000  | gateway                     |
| mcp-email-server     | `zerolib/mcp-email:latest`            | 9557  | gateway                     |
| minio                | `minio/minio:latest`                  | 9000  | gateway                     |
| paperclip            | `ghcr.io/paperclipai/paperclip:latest`| 3100  | gateway, database_pg        |

**Networks**: `gateway` (main service mesh), `database_pg` (PostgreSQL access), `nocodb_network` (NocoDB isolation), `librechat_internal` (LibreChat ecosystem).

**`docker-compose.base.yaml`** defines `nx-base` -- a shared service base that `api-customer-service` and `client-app` extend for volume mounts, env_file, and build context.

### Nginx Reverse Proxy

All services accessible via HTTPS on port 10443:

- SSL termination with self-signed certs in `config/certificates/`
- WebSocket support on all routes (LibreChat, n8n, MCPHub, Paperclip)
- Dynamic DNS via `resolver 127.0.0.11` (Docker embedded DNS)
- SSE stream buffering disabled for MCPHub
- Path-based routing: `/` (client), `/api/` (API), `/librechat/`, `/n8n/`, `/paperclip/`, etc.

### Database Architecture

| Database   | Engine                    | Port  | Purpose                              |
| ---------- | ------------------------- | ----- | ------------------------------------ |
| PostgreSQL | `postgres:17`             | 54320 | Application data, n8n, MindsDB       |
| MongoDB    | `mongo:latest`            | 27018 | LibreChat conversations              |
| VectorDB   | pgvector (custom build)   | --    | Embeddings, semantic search          |
| NocoDB PG  | `postgres:17`             | --    | NocoDB isolated database             |
| MinIO      | `minio/minio:latest`      | 9000  | S3-compatible object/file storage    |

### Prisma Schemas

Three Prisma schemas in `schema/`, each with its own PostgreSQL datasource:

**`schema/consumer/`** -- Consumer-facing data:
- `User` (id, email, name, role: CUSTOMER|ADMIN, conversations[], timestamps)
- `Conversation` (id, title, userId FK, messages[], timestamps)
- `Message` (id, conversationId FK, role: USER|ASSISTANT|SYSTEM, content, createdAt)

**`schema/customer/`** -- Customer/business data (Prisma generator + datasource configured).

**`schema/orchestrator/`** -- Workflow orchestration:
- `Workflow` (id, name, description, status: DRAFT|ACTIVE|PAUSED|ARCHIVED, tasks[], timestamps)
- `Task` (id, workflowId FK, name, type: HTTP_REQUEST|DATABASE_QUERY|AI_PROMPT|NOTIFICATION|TRANSFORM, config: JsonB, order, status: PENDING|RUNNING|COMPLETED|FAILED, timestamps)

### Shared Library: `@chatsuite/core`

`libs/core/src/` exports:

| Module          | Exports                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `bootstrap/`    | `configureApp()` -- CORS, validation pipe, global exception filter, correlation-ID middleware |
| `dto/`          | `HealthResponseDto` (status, timestamp, version, uptime), `WelcomeResponseDto` (message) |
| `exceptions/`   | `BusinessException`, `ConflictException`, `ResourceNotFoundException`, `ServiceUnavailableException`, `ValidationException`, `ErrorCode` enum |
| `filters/`      | `GlobalExceptionFilter` -- standardized error responses with correlation ID |
| `middleware/`    | `CorrelationIdMiddleware` -- generates/propagates `x-correlation-id` header (UUID v4) |

### API Endpoints (`api-customer-service`)

| Method | Path      | Handler              | Response                              |
| ------ | --------- | -------------------- | ------------------------------------- |
| GET    | `/`       | `getData()`          | `WelcomeResponseDto` (message)        |
| GET    | `/health` | `getHealth()`        | `HealthResponseDto` (status, uptime, version, timestamp) |

Entry point: `main.ts` calls `configureApp()` from `@chatsuite/core`, listens on port 3333 (or `PORT` env).

---

## Security

- Never commit secrets or `.env.*` files (enforced by `.gitignore`)
- All sensitive config via environment variables and `env_file` in docker-compose
- Input validation on all API entry points (global `ValidationPipe`: whitelist, forbidNonWhitelisted, transform)
- Parameterized queries only (Prisma handles this)
- TLS for all external traffic (nginx SSL termination, port 10443)
- CORS enabled via `configureApp()`
- KICS weekly scans for infrastructure-as-code vulnerabilities (fails on high)
- Trivy container image scans in CI
- Biome `noDangerouslySetInnerHtml` rule (error level)

---

## Deployment

### Production (Synology DiskStation)

```bash
ssh root@synology
cd /volume1/docker/chatsuite
pnpm env:set:host
pnpm rebuild
pnpm test
docker ps -a | grep chatsuite      # Verify all healthy
```

### Health Checks

Every service has Docker healthchecks in `docker-compose.yaml`:

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
docker logs chatsuite_<service>              # Service logs
docker logs chatsuite_nginx --tail 100       # Nginx recent logs
docker exec -it chatsuite_<service> /bin/sh  # Container shell
docker exec chatsuite_nginx nginx -t         # Nginx config test
docker exec -it chatsuite_postgres psql -U admin -d chatsuite  # DB shell
lsof -i :10443                               # Port conflicts
pnpm env:show                                # Active environment
ls -la config/env/.env.*                     # Runtime configs exist?
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

**Caching**: `build`, `test`, `lint`, `e2e` are cached. `integration` is NOT cached (`cache: false`).

**Named inputs**: `default` (all project files + sharedGlobals), `production` (excludes spec/test), `sharedGlobals` (pnpm-workspace.yaml, pnpm-lock.yaml).

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
| nx-base              | Shared docker-compose service config in `docker-compose.base.yaml` |
| Correlation ID       | UUID v4 in `x-correlation-id` header for request tracing         |
| TSDoc                | TypeScript documentation standard                                |
| RBAC                 | Role-Based Access Control                                        |

---

**Last Updated**: 2026-04-03
**Version**: 4.0
**Document Owner**: Dr. Hubertus Becker
