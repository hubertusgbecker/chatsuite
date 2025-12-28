# AGENTS.md

<guidelines>
ChatSuite is a comprehensive AI collaboration platform that orchestrates multiple AI services, workflow automation tools, and database systems into a unified ecosystem. It uses Docker-based microservices architecture with NestJS APIs, React frontends, and an Nx monorepo structure to enable seamless collaboration between AI systems, automation workflows, and human users.

This document serves as the authoritative reference for all development, service architecture, and automation standards within the ChatSuite ecosystem. Whether you're a developer, DevOps engineer, or AI agent, this guide ensures consistent, high-quality implementations across the platform.

**Mission**: Enable seamless collaboration between AI systems, automation workflows, and human users through intelligent service orchestration and unified data access.
</guidelines>

---

## Table of Contents

1. [Development Rules](#development-rules)
2. [Project Overview](#project-overview)
3. [Repository Structure](#repository-structure)
4. [Quick Reference](#quick-reference--essential-commands)
5. [Getting Started](#getting-started)
6. [Development Workflow](#development-workflow)
7. [Testing Strategy](#testing-strategy)
8. [Code Quality Standards](#code-quality-standards)
9. [Architecture & Services](#architecture--services)
10. [Security & Compliance](#security--compliance)
11. [Deployment & Operations](#deployment--operations)
12. [Troubleshooting](#troubleshooting)

---

## Development Rules

**Critical guidelines that must be followed at all times:**

### Package Management

- **Always use `pnpm`** - Never use npm or yarn
  ```bash
  pnpm install              # Install dependencies
  pnpm add package-name     # Add package
  pnpm start                # Launch platform
  ```

- **Never use `pip`, `poetry`, or `conda`** - Always use `uv` for Python
  ```bash
  uv venv --python 3.11
  source .venv/bin/activate
  uv sync
  ```

### Type-Safe Coding

- Use **TypeScript strict mode** for all code
- Use **Pydantic v2 models** for all Python internal schemas, task inputs/outputs, and tools I/O
- All public functions MUST have type annotations
- Use interfaces and types for data structures

```typescript
// ✅ GOOD - Type-safe function with documentation
export async function processData(
  param1: string,
  param2: number,
  config: Record<string, any>
): Promise<DataResult | null> {
  /**
   * Processes data with specified parameters.
   *
   * @param param1 - Input data string
   * @param param2 - Processing threshold
   * @param config - Configuration object
   * @returns Processed data or null if processing fails
   * @throws {ValidationError} When param1 is invalid
   */
  // Implementation
}
```

### Pre-Commit Requirements

- **ALWAYS run pre-commit checks** before making PRs
  ```bash
  pnpm lint        # Run linters
  pnpm nx:test     # Run tests
  pnpm nx:build    # Verify builds
  ```

- Git hooks automatically enforce quality standards
- All commits must pass linting and security checks

### Documentation Standards

- Use TSDoc comments for all public APIs
- Include `@param`, `@returns`, `@throws` sections
- Update README.md and AGENTS.md for significant changes
- Use descriptive variable and function names
- Document all environment variables in templates

### Environment Configuration

- **NEVER commit `.env.*` files** - These contain secrets
- Always copy from templates (`env.dev`, `env.host`, `env.qa`)
- Use environment-specific configurations:
  ```bash
  pnpm env:set:dev   # Development environment
  pnpm env:set:qa    # QA environment
  pnpm env:set:host  # Production environment
  ```

### Security Rules

- **NEVER commit secrets or API keys**
- Use environment variables for all sensitive data
- Validate all user inputs
- Log errors without exposing sensitive data
- Follow OWASP security guidelines

### Code Organization

- Never create random example files to test features
- If testing is needed, use inline code in terminal
- Place all development scripts in `tools/dev-scripts/` with `cmd-` prefix
- Extract reusable code into appropriate library categories

### Docker-First Development

- All services run in Docker containers
- Use docker-compose for service orchestration
- Never run services directly on host (except local development)
- Always check service logs when troubleshooting

---

## Project Overview

**Project Name**: ChatSuite  
**Owner**: Dr. Hubertus Becker  
**Repository**: <https://github.com/hubertusgbecker/chatsuite>  
**License**: MIT  
**Tech Stack**: Docker, NestJS, React, Nx Monorepo, TypeScript, Python  
**Package Managers**: pnpm (Node.js), uv (Python)

### Platform Components

ChatSuite integrates multiple AI and productivity tools:

- **LibreChat** - Multi-model AI chat interface
- **n8n** - Visual workflow automation
- **MindsDB** - AI-powered database platform
- **NocoDB** - Intuitive database interface
- **MinIO** - S3-compatible object storage
- **MCPHub** - Model Context Protocol orchestration
- **MCP Email** - Intelligent email processing
- **React Client** - Modern web interface
- **NestJS API** - Scalable backend services

### AI Agent Communication Principles

You are an AI agent working with the ChatSuite codebase. Your responses should be:

- **Accurate and factual** - Answer with facts only, don't speculate or hallucinate
- **Clear and concise** - Use step-by-step reasoning with actionable insights
- **Type-safe** - Follow TypeScript and Pydantic conventions
- **Security-conscious** - Never expose or hardcode secrets
- **Documentation-driven** - Use TSDoc and clear comments
- **Plain ASCII** - No emoji, emoticons, or Unicode symbols except in code, math, URLs, file paths

**This AGENTS.md file is the authoritative reference and single source of truth for all coding standards, project structure, and development practices.**

---

## Repository Structure

```
chatsuite/
├── apps/                          # Deployable applications
│   ├── api-customer-service/     # NestJS backend API
│   └── client-app/               # React frontend application
├── libs/                          # Shared libraries (future expansion)
│   ├── core/                     # Core business logic
│   ├── data/                     # Data access and models
│   ├── features/                 # Complete shareable features
│   ├── ui/                       # Reusable UI components
│   └── utils/                    # Utility functions
├── config/                        # Centralized configuration
│   ├── env/                      # Environment templates
│   ├── librechat/               # LibreChat configuration
│   ├── mindsdb/                 # MindsDB configuration
│   ├── nginx/                   # Nginx proxy configuration
│   ├── mcp-email-server/        # MCP Email Server config
│   ├── mcphub/                  # MCPHub configuration
│   ├── nocodb/                  # NocoDB configuration
│   ├── n8n/                     # n8n configuration
│   ├── minio/                   # MinIO configuration
│   ├── postgres/                # PostgreSQL configuration
│   └── pnpm/                    # pnpm settings
├── data/                          # Persistent data volumes
│   ├── librechat/               # LibreChat data
│   ├── mindsdb/                 # MindsDB models and cache
│   ├── minio/                   # Object storage data
│   ├── nocodb/                  # NocoDB database
│   └── postgres/                # PostgreSQL data
├── schema/                        # Database schemas & migrations
│   ├── consumer/                # Consumer database
│   ├── customer/                # Customer database
│   └── orchestrator/            # Orchestrator database
├── tools/                         # Development tools
│   └── dev-scripts/             # Build and automation scripts
├── docs/                          # Documentation
├── tmp/                           # Temporary build artifacts
├── docker-compose.yaml           # Service orchestration
├── nx.json                       # Nx workspace configuration
├── package.json                  # Node.js dependencies
└── pnpm-workspace.yaml           # pnpm workspace config
```

### Directory Standards

- **`apps/`** - All new applications created using Nx generators
- **`config/`** - All configuration and Docker assets
- **`data/`** - All persistent data mapped to subdirectories
- **`docs/`** - All documentation
- **`libs/`** - All reusable code extracted as libraries
- **`schema/`** - All database changes with proper migrations
- **`tools/dev-scripts/`** - All development scripts with `cmd-` prefix
- **`tmp/`** - Temporary files only, never production code

---

## Quick Reference & Essential Commands

### Critical Files & Locations

| File/Directory | Purpose |
|---------------|---------|
| `AGENTS.md` | Authoritative reference for all development standards |
| `repomix-output.xml` | Machine-readable codebase summary |
| `tools/dev-scripts/` | All development automation |
| `config/nginx/default.dev.conf` | Central nginx proxy configuration |
| `config/env/` | Environment templates and runtime configuration |
| `docs/environment-configuration-solution.md` | Environment setup guide |

### Essential Commands

```bash
# Platform Operations
pnpm start                  # Launch all services
pnpm stop                   # Graceful shutdown
pnpm rebuild               # Complete system rebuild
pnpm test                  # Health checks and verification

# Environment Management
pnpm env:show              # Display current environment
pnpm env:set:dev           # Switch to development
pnpm env:set:qa            # Switch to QA
pnpm env:set:host          # Switch to production
pnpm env:verify            # Verify security configuration

# Development
pnpm lint                  # Run linters
pnpm nx:test               # Run tests
pnpm nx:build              # Build projects
pnpm nx affected:test      # Test only changed code

# Nx Operations
pnpm nx g @nx/react:lib my-library          # Generate React library
pnpm nx g @nx/nest:app my-api               # Generate NestJS app
pnpm nx build my-app                         # Build specific app
pnpm nx run-many --target=integration --all  # Run all integration tests
```

### Service Ports

| Service | Direct Port | Proxy Route (10443) | Status |
|---------|------------|---------------------|--------|
| Client App | 4200 | /app/ | HTTP + HTTPS |
| API Customer Service | 3333 | /api/customer/ | HTTP + HTTPS |
| LibreChat | 3080 | /librechat/ | HTTP + HTTPS |
| PgAdmin | (internal) | /pgadmin/ | HTTPS Only |
| N8N | 5678 | /n8n/ | HTTP + HTTPS |
| NocoDB | 8080 | /nocodb/ | HTTP + HTTPS |
| MCPHub | 3000 | /mcphub/ | HTTP + HTTPS |
| MCP Email | 9557 | /mcp-email/ | HTTP + HTTPS |
| MindsDB HTTP | 47334 | /mindsdb/ | HTTP + HTTPS |
| MinIO API | 9000 | /minio-api/ | HTTP + HTTPS |
| MinIO Console | 9001 | /minio/ | HTTP + HTTPS |
| Nginx Proxy | 10443 | (All services) | HTTPS Only |

---

## Getting Started

### 1. Prerequisites

- **Docker** & **Docker Compose** installed
- **Node.js 18+** and **pnpm** installed
- **Python 3.11+** and **uv** installed
- **Git** configured with SSH keys

### 2. Initial Setup

```bash
# Clone repository
git clone git@github.com:hubertusgbecker/chatsuite.git
cd chatsuite

# Install pnpm (if not already installed)
npm install -g pnpm

# Install Python uv (if not already installed)
pip install uv

# Install dependencies
pnpm install

# Setup environment configuration
cp config/env/env.dev config/env/.env.dev
cp config/env/env.host config/env/.env.host
cp config/env/env.qa config/env/.env.qa

# Update .env.* files with actual credentials
# NEVER commit .env.* files to git
```

### 3. Environment Configuration

Each environment has its own config file:

- **`config/env/.env.dev`** - Development (localhost, not in git)
- **`config/env/.env.qa`** - QA/Testing (not in git)
- **`config/env/.env.host`** - Production (not in git)

Templates (version-controlled):

- **`config/env/env.dev`** - Development template
- **`config/env/env.qa`** - QA template
- **`config/env/env.host`** - Production template

The active environment is controlled by root `.env`:

```bash
# chatsuite/.env
NX_APP_ENV=dev  # or qa, host
```

### 4. Launch Platform

```bash
# Set environment
pnpm env:set:dev

# Launch all services
pnpm start

# Verify all services healthy
pnpm test

# Access platform
open https://localhost:10443
```

### 5. Development Workflow

```bash
# Create new feature branch
git checkout -b feature/my-feature

# Make changes and test
pnpm lint
pnpm nx:test
pnpm nx:build

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

---

## Development Workflow

### Pre-Commit Workflow

All commits automatically run:

1. **ESLint** - Code quality and security checks
2. **Prettier** - Code formatting
3. **TypeScript** - Type checking
4. **Tests** - Unit and integration tests
5. **Security Scans** - KICS and Trivy scans

```bash
# Manual pre-commit check
./bin/lint.sh      # Run all linting
./bin/test.sh      # Run core tests
```

### Git Hooks

Configured via Husky:

- **pre-commit**: Linting, formatting, security checks
- **commit-msg**: Commit message validation (conventional commits)
- **pre-push**: Full test suite execution

### Branching Strategy

- **`main`** - Production-ready code
- **`feature/*`** - New features
- **`fix/*`** - Bug fixes
- **`docs/*`** - Documentation updates
- **`refactor/*`** - Code refactoring

### Commit Convention

Follow Conventional Commits:

```bash
feat: add new feature            # New feature
fix: resolve bug                 # Bug fix
docs: update documentation       # Documentation
refactor: restructure code       # Refactoring
test: add tests                  # Testing
chore: update dependencies       # Maintenance
perf: improve performance        # Performance
ci: update CI/CD                # CI/CD changes
```

### Pull Request Process

1. Create feature branch
2. Implement changes with tests
3. Run `pnpm lint` and `pnpm nx:test`
4. Push and create PR
5. Address review comments
6. Squash and merge

---

## Testing Strategy

### Test Types

ChatSuite implements comprehensive testing at multiple levels:

#### 1. Unit Tests

- **Location**: `src/**/*.spec.ts`
- **Tool**: Jest
- **Coverage Target**: >80%
- **Purpose**: Test individual functions and components

```typescript
// Example unit test
describe('DataProcessor', () => {
  it('should process data correctly', async () => {
    const processor = new DataProcessor();
    const result = await processor.process('input');
    expect(result).toBeDefined();
    expect(result.status).toBe('success');
  });
});
```

#### 2. Integration Tests

- **Location**: `tests/integration/` inside each project
- **Tool**: Jest with Docker containers
- **Purpose**: Test service interactions without mocking

```typescript
// Example integration test
describe('API Integration', () => {
  beforeAll(async () => {
    await startDockerServices(['postgres', 'redis']);
  });

  it('should create user and store in database', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test User' });
    
    expect(response.status).toBe(201);
    
    const dbUser = await db.users.findOne({ name: 'Test User' });
    expect(dbUser).toBeDefined();
  });

  afterAll(async () => {
    await stopDockerServices();
  });
});
```

#### 3. End-to-End Tests

- **Location**: `apps/*/e2e/`
- **Tool**: Cypress or Playwright
- **Purpose**: Test complete user workflows

```typescript
// Example e2e test
describe('User Registration Flow', () => {
  it('should register new user successfully', () => {
    cy.visit('/register');
    cy.get('[data-testid="name-input"]').type('John Doe');
    cy.get('[data-testid="email-input"]').type('john@example.com');
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Integration Test Requirements

Follow these rules for effective integration testing:

1. **Test Environment Setup**
   - Use `docker-compose` to start dependent services
   - Ensure databases are migrated and seeded before tests
   - Clean up state between test runs

2. **Test Location**
   - Place integration tests under `tests/integration/` inside each project
   - Keep tests close to the project they verify
   - Use descriptive test file names

3. **Execution**
   - Define `integration` target in `project.json`
   - Execute with: `pnpm nx run-many --target=integration --all`
   - Run on every PR using Nx affected commands

4. **Cross-Service Scenarios**
   - Cover interactions between APIs, workers, and databases
   - Validate shared libraries integrate correctly
   - Test authentication flows end-to-end
   - Verify data consistency across services

5. **Continuous Integration**
   - Run integration tests on every pull request
   - Fail pipeline when any integration test fails
   - Generate coverage reports
   - Track test execution time

6. **Coverage Requirement**
   - Every service must have at least one integration test
   - Target >80% coverage for business logic
   - Document test scenarios in README

### Running Tests

```bash
# Run all tests
pnpm nx:test

# Run tests for specific project
pnpm nx test api-customer-service

# Run only changed tests
pnpm nx affected:test

# Run integration tests
pnpm nx run-many --target=integration --all

# Run with coverage
pnpm nx test --coverage

# Watch mode for development
pnpm nx test --watch
```

### Test Best Practices

- **Write tests first** (TDD when appropriate)
- **Test behavior, not implementation**
- **Use descriptive test names**
- **Keep tests independent**
- **Mock external dependencies** in unit tests
- **Use real services** in integration tests
- **Clean up resources** after tests
- **Document complex test scenarios**

---

## Code Quality Standards

### Linting & Formatting

- **ESLint** - Enterprise-grade linting
  - Security plugins (@microsoft/eslint-plugin-sdl, eslint-plugin-security)
  - TypeScript strict checking
  - React best practices
  - Accessibility checks (eslint-plugin-jsx-a11y)

- **Prettier** - Consistent code formatting
  - 100-character line width
  - Single quotes, trailing commas
  - Automatic formatting on save

### Type Safety

- **TypeScript Strict Mode** enabled
- **No `any` types** without justification
- **Explicit return types** for all functions
- **Interface-first design** for data structures

```typescript
// ✅ GOOD
interface UserData {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<UserData | null> {
  // Implementation
}

// ❌ BAD
function getUser(id) {
  // Implementation
}
```

### Security Standards

- **Input validation** on all entry points
- **Output sanitization** for all user-facing data
- **Parameterized queries** to prevent SQL injection
- **Content Security Policy** headers
- **Rate limiting** on all APIs
- **TLS 1.2+** for all communications

### Performance Standards

- **Bundle size optimization** - Code splitting, tree shaking
- **Database indexing** - Query optimization
- **Caching strategies** - Redis, in-memory caching
- **Connection pooling** - Database connections
- **API pagination** - Cursor-based pagination

---

## Architecture & Services

### Microservices Architecture

ChatSuite follows domain-driven microservices architecture:

- **Service Boundaries**: Domain contexts with clear separation
- **Communication**: REST APIs via nginx proxy
- **Data Storage**: PostgreSQL, MongoDB, Redis
- **File Storage**: MinIO S3-compatible storage
- **Authentication**: JWT-based with refresh tokens

### Core Services

| Service | Purpose | Technology | Port |
|---------|---------|------------|------|
| Client App | Web frontend | React, TypeScript | 4200 |
| API Customer Service | Backend API | NestJS, TypeScript | 3333 |
| LibreChat | AI chat interface | Node.js, MongoDB | 3080 |
| n8n | Workflow automation | Node.js, PostgreSQL | 5678 |
| MindsDB | AI database | Python, PostgreSQL | 47334 |
| NocoDB | Database GUI | Node.js, PostgreSQL | 8080 |
| MCPHub | Protocol orchestration | Node.js | 3000 |
| MCP Email | Email processing | Python | 9557 |
| MinIO | Object storage | Go | 9000/9001 |
| Nginx | Reverse proxy | Nginx | 10443 |

### Nginx Reverse Proxy

All services accessible via unified nginx proxy (port 10443):

- **SSL Termination**: HTTPS for all external traffic
- **WebSocket Support**: Full HTTP/1.1 upgrade headers
- **Dynamic DNS Resolution**: Prevents startup failures
- **Health Checks**: Automatic service health monitoring
- **Path-based routing**: All services under unified domain

### Database Architecture

- **PostgreSQL**: Primary relational database
  - NocoDB data
  - n8n workflows
  - Application data
  
- **MongoDB**: Document storage
  - LibreChat conversations
  - User preferences

- **VectorDB**: Embeddings and semantic search
  - pgvector extension
  - LibreChat semantic search

### Code Sharing Strategy

Libraries organized by category:

1. **UI Components** (`libs/ui/*`)
   - Reusable UI components
   - Design system implementation
   - Zero business logic
   - Atomic design principles

2. **Features** (`libs/features/*`)
   - Complete reusable features
   - Business logic + UI
   - Encapsulated state management
   - Self-contained modules

3. **Core Libraries** (`libs/core/*`)
   - Business logic
   - Domain models
   - Pure TypeScript
   - Framework-agnostic

4. **Data Libraries** (`libs/data/*`)
   - API clients
   - Database connectors
   - Data transformation
   - Caching utilities

5. **Utility Libraries** (`libs/utils/*`)
   - Pure functions
   - Helper utilities
   - Type guards
   - Framework-agnostic

---

## Security & Compliance

### Authentication & Authorization

- **JWT-based authentication** with short-lived access tokens
- **Refresh token rotation** for security
- **Role-based access control** (RBAC)
- **Principle of least privilege**
- **HttpOnly cookies** (never localStorage)

### Data Protection

- **Field-level encryption** for sensitive data
- **Input sanitization** for all user inputs
- **Strong password hashing** (Argon2)
- **Data retention policies**
- **GDPR compliance** features

### Security Scanning

- **KICS** - Infrastructure-as-Code security
- **Trivy** - Docker image vulnerability scanning
- **ESLint Security Plugins** - Code security analysis
- **Automated scans** on every PR

### Compliance Standards

- **GDPR**: Data minimization, right to be forgotten
- **SOC2**: Logging, access control, audit trails
- **OWASP**: Top 10 security best practices

### API Security Best Practices

- Rate limiting to prevent abuse
- TLS 1.2+ for all communications
- Proper CORS configuration
- CSRF protection for browser-based clients
- Parameterized queries to prevent injection attacks

---

## Deployment & Operations

### Docker Deployment

```bash
# Production deployment
pnpm env:set:host
pnpm rebuild
pnpm test

# Verify all services healthy
docker ps -a | grep chatsuite

# Check logs
docker logs chatsuite_nginx
docker logs chatsuite_api-customer-service
```

### Environment Management

All sensitive data in `.env.*` files:

- Database credentials
- API keys
- JWT secrets
- Service URLs

### Health Checks

Built into docker-compose for all services:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3333/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Monitoring & Logging

- **Service logs**: `docker logs <container_name>`
- **Aggregated logs**: (Future: ELK stack)
- **Health checks**: Built into docker-compose
- **Performance metrics**: (Future: Prometheus/Grafana)

### Backup Strategy

- **Database backups**: Daily automated backups
- **Volume snapshots**: Docker volume backups
- **Configuration backups**: Version-controlled templates
- **Recovery procedures**: Documented in ops guide

---

## Troubleshooting

### Common Issues

#### Service Won't Start

```bash
# Check container status
docker ps -a | grep chatsuite

# Check logs
docker logs chatsuite_<service_name>

# Restart service
docker restart chatsuite_<service_name>

# Rebuild if necessary
pnpm rebuild
```

#### Environment Variables Not Loading

```bash
# Verify environment file exists
ls -la config/env/.env.*

# Check active environment
pnpm env:show

# Recreate container to reload env
docker stop chatsuite_<service_name>
docker rm chatsuite_<service_name>
docker-compose up -d <service_name>
```

#### Nginx Proxy Errors

```bash
# Check nginx config syntax
docker exec chatsuite_nginx nginx -t

# Reload nginx
docker exec chatsuite_nginx nginx -s reload

# Check nginx logs
docker logs chatsuite_nginx --tail 100

# Test service connectivity
curl -k https://localhost:10443/health
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
docker logs chatsuite_postgres

# Verify connection from container
docker exec chatsuite_api-customer-service pg_isready -h postgres -p 5432

# Check environment variables
docker exec chatsuite_api-customer-service env | grep POSTGRES

# Test direct connection
docker exec -it chatsuite_postgres psql -U admin -d chatsuite
```

#### Port Conflicts

```bash
# Check if port is in use
lsof -i :10443
netstat -an | grep 10443

# Stop conflicting service or change port in docker-compose.yaml
```

### Debug Workflows

#### Enable Debug Logging

```bash
# Set debug level in .env file
BROWSER_USE_LOGGING_LEVEL=debug

# Restart services
pnpm rebuild
```

#### Inspect Container State

```bash
# Enter running container
docker exec -it chatsuite_<service_name> /bin/sh

# Check process list
docker top chatsuite_<service_name>

# View container resource usage
docker stats chatsuite_<service_name>
```

### Getting Help

1. Check [GitHub Issues](https://github.com/hubertusgbecker/chatsuite/issues)
2. Review service-specific README files in `config/` directories
3. Check Docker logs for detailed error messages
4. Verify environment configuration matches templates
5. Search closed issues for similar problems
6. Open new issue with:
   - Error messages and logs
   - Steps to reproduce
   - Environment details (OS, Docker version)
   - Expected vs actual behavior

---

## Nx Workspace Guidelines

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

### General Guidelines for Working with Nx

- When running tasks (build, lint, test, e2e), always prefer `nx` commands over direct tooling
- Use `nx_workspace` tool to understand workspace architecture
- Use `nx_project_details` tool to analyze specific projects
- Use `nx_docs` tool for configuration questions (never assume)
- Run affected commands to optimize CI: `nx affected:test`, `nx affected:build`

### Nx Commands Reference

```bash
# Generate new apps/libs
nx g @nx/react:lib my-library
nx g @nx/nest:app my-api

# Run tasks
nx build my-app
nx test my-library
nx lint my-app

# Affected commands (CI optimization)
nx affected:test
nx affected:build
nx affected:lint

# Run multiple targets
nx run-many --target=test --all
nx run-many --target=integration --all

# Dependency graph
nx graph
```

<!-- nx configuration end-->

---

## Change Management

### Process for Updating AGENTS.md

1. Propose changes via pull request
2. Review by maintainer or lead developer required
3. Document all breaking changes
4. Update service READMEs as needed
5. Keep file synchronized with architectural changes

### Versioning

- Follow [Semantic Versioning](https://semver.org/)
- Update CHANGELOG.md for each release
- Tag releases in git
- Create GitHub releases with release notes

---

## Glossary

| Term | Definition |
|------|-----------|
| **Service** | API or backend component exposed via HTTP/HTTPS |
| **Feature** | Reusable business logic spanning multiple components |
| **Library** | Shared code (core, features, ui, utils, data) |
| **Unified Route** | Endpoint exposed via nginx proxy on port 10443 |
| **Integration Test** | Test covering service interactions without mocks |
| **Nx Workspace** | Monorepo structure with apps and libraries |
| **Docker Compose** | Multi-container orchestration tool |
| **Environment Template** | Version-controlled config file (env.dev, env.host, env.qa) |
| **Runtime Config** | Actual configuration file (.env.dev, .env.host, .env.qa) not in git |
| **MCP** | Model Context Protocol for AI agent communication |
| **TSDoc** | TypeScript documentation standard |
| **RBAC** | Role-Based Access Control |

---

## Final Notes

- This document is the **authoritative reference** for all ChatSuite development
- All communication, reasoning, and code standards are contained within AGENTS.md
- For automation and navigation, use `repomix-output.xml` as the codebase map
- If you find gaps or improvements, submit a pull request
- Follow the development rules religiously - they exist for platform stability and security

---

**Last Updated**: 2025-12-28  
**Version**: 2.0  
**Document Owner**: Dr. Hubertus Becker
