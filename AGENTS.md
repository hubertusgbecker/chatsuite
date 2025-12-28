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

### Test-Driven Development (TDD)

- **ALWAYS write tests before implementation code**
- Follow the Red-Green-Refactor cycle:
  1. **Red**: Write a failing test that defines desired behavior
  2. **Green**: Write minimal code to make the test pass
  3. **Refactor**: Improve code quality while keeping tests green
- Start with integration tests for new features
- Add unit tests for complex business logic
- Use tests as living documentation
- Never skip tests "to save time" - they save time in the long run

### Incremental Development

- **Break all work into small, achievable steps**
- Each step should be completable in 15-30 minutes
- Commit after each working increment
- Deploy small changes frequently rather than large batches
- Example breakdown:
  - ❌ BAD: "Implement user authentication system"
  - ✅ GOOD: 
    1. Create user model with tests (15 min)
    2. Add password hashing with tests (20 min)
    3. Implement login endpoint with tests (25 min)
    4. Add JWT generation with tests (20 min)
    5. Create auth middleware with tests (15 min)
- If a task feels too big, break it down further
- Focus on one failing test at a time
- Validate each increment before moving forward

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
- **Test-driven** - Always write tests before implementation code
- **Incremental** - Break work into small, achievable steps (15-30 min each)
- **Type-safe** - Follow TypeScript and Pydantic conventions
- **Security-conscious** - Never expose or hardcode secrets
- **Documentation-driven** - Use TSDoc and clear comments
- **Plain ASCII** - No emoji, emoticons, or Unicode symbols except in code, math, URLs, file paths

**Development Approach:**
- When implementing features, always propose a breakdown into 5-10 small incremental steps
- Each step should include: test first, implementation, commit
- Prioritize small working increments over large batches
- Use TDD cycle (Red-Green-Refactor) for all new code

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
| `docs/integration-testing-strategy.md` | Comprehensive testing strategy |
| `.husky/` | Git hooks for automated quality checks |
| `.github/workflows/` | CI/CD pipeline definitions |

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
pnpm format                # Format code with Prettier
pnpm format:check          # Check code formatting
pnpm nx:test               # Run all unit tests
pnpm nx:test:affected      # Test only changed code
pnpm nx:integration        # Run all integration tests
pnpm nx:integration:affected # Run affected integration tests
pnpm nx:build              # Build all projects

# Nx Operations
pnpm nx g @nx/react:lib my-library          # Generate React library
pnpm nx g @nx/nest:app my-api               # Generate NestJS app
pnpm nx build my-app                         # Build specific app
pnpm nx run-many --target=integration --all  # Run all integration tests
pnpm nx affected --target=test               # Run affected unit tests
pnpm nx affected --target=integration        # Run affected integration tests
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

### 5. Development Workflow (Test-Driven & Incremental)

```bash
# Create new feature branch
git checkout -b feature/my-feature

# STEP 1: Write failing test first (RED)
pnpm nx test my-app --watch  # Watch mode for TDD
# Write test that fails, defining desired behavior

# STEP 2: Implement minimal code (GREEN)
# Write just enough code to make test pass
pnpm nx test my-app  # Verify test passes

# STEP 3: Refactor if needed
# Improve code quality while keeping tests green
pnpm lint
pnpm format

# STEP 4: Commit this small increment
git add .
git commit -m "test: add test for feature X"
git commit -m "feat: implement feature X (step 1/5)"

# STEP 5: Repeat for next increment
# Continue small steps until feature complete

# STEP 6: Run full test suite
pnpm nx:test
pnpm nx:integration
pnpm nx:build

# Push and create PR
git push origin feature/my-feature
```

**Key Principles:**
- Write test → Make it pass → Refactor → Commit
- Each commit should be a working increment
- Run tests continuously during development
- Break large features into 5-10 small commits
- Never commit broken tests

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

**Complete implementation available - see below for full details.**

- **Location**: `tests/integration/` inside each project
- **Tool**: Jest with Docker containers
- **Purpose**: Test service interactions without mocking
- **Configuration**: Separate Jest config (`jest.config.integration.ts`)
- **Test Database**: Docker Compose test services (separate ports)

```typescript
// Example integration test
describe('API Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    await createTestServer();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create user and store in database', async () => {
    const response = await request(httpServer)
      .post('/api/users')
      .send({ name: 'Test User', email: 'test@test.com' })
      .expect(201);
    
    expect(response.body.id).toBeDefined();
    
    // Verify database persistence
    const user = await executeQuery(
      'SELECT * FROM users WHERE email = $1',
      ['test@test.com']
    );
    expect(user.rows).toHaveLength(1);
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

### Integration Test Implementation

ChatSuite has a complete integration testing infrastructure implemented for all services.

**Current Status: 24/24 tests passing** covering all major docker-compose services.

#### Directory Structure

```
apps/api-customer-service/
├── src/
│   └── app/
│       ├── app.controller.ts
│       ├── app.controller.spec.ts    # Unit test
│       └── app.service.ts
├── tests/
│   └── integration/
│       ├── api/
│       │   └── app.integration.spec.ts  # 24 integration tests
│       ├── helpers/
│       │   ├── test-db.ts           # PostgreSQL utilities
│       │   ├── test-mongodb.ts      # MongoDB utilities
│       │   ├── test-minio.ts        # MinIO S3 utilities
│       │   ├── test-n8n.ts          # n8n workflow utilities
│       │   ├── test-nocodb.ts       # NocoDB database UI utilities
│       │   ├── test-mindsdb.ts      # MindsDB AI database utilities
│       │   ├── test-mcphub.ts       # MCPHub protocol utilities
│       │   ├── test-mcp-email.ts    # MCP Email SSE utilities
│       │   ├── test-server.ts       # Server setup utilities
│       │   └── factories.ts         # Test data factories
│       ├── setup.ts                 # Global setup with auto env loading
│       ├── teardown.ts              # Global teardown
│       └── jest.setup.ts            # Jest configuration
├── jest.config.ts                    # Unit test config
└── jest.config.integration.ts        # Integration test config
```

#### Test Helpers

**PostgreSQL Helper** (`tests/integration/helpers/test-db.ts`):
- `setupTestDatabase()`: Initialize PostgreSQL connection
- `cleanupTestDatabase()`: Truncate all tables between tests
- `closeTestDatabase()`: Close connection
- `executeQuery()`: Execute raw SQL queries

**MongoDB Helper** (`tests/integration/helpers/test-mongodb.ts`):
- `setupTestMongoDB()`: Initialize MongoDB connection
- `cleanupTestMongoDB()`: Drop test collections
- `createTestCollection()`: Create test collection
- `verifyMongoConnection()`: Health check

**MinIO Helper** (`tests/integration/helpers/test-minio.ts`):
- `setupTestMinIO()`: Initialize S3 client
- `createTestBucket()`: Create test bucket
- `uploadTestFile()`: Upload file to bucket
- `downloadTestFile()`: Download file from bucket
- `cleanupTestMinIO()`: Delete test buckets/objects

**n8n Helper** (`tests/integration/helpers/test-n8n.ts`):
- `setupTestN8n()`: Initialize n8n API client (optional API key)
- `createTestWorkflow()`: Create workflow
- `getTestWorkflow()`: Retrieve workflow
- `cleanupTestN8n()`: Clean test workflows

**NocoDB Helper** (`tests/integration/helpers/test-nocodb.ts`):
- `setupTestNocodb()`: Initialize NocoDB client (optional auth token)
- `createTestBase()`: Create database base
- `getTestBase()`: Retrieve base
- `cleanupTestNocodb()`: Clean test bases

**MindsDB Helper** (`tests/integration/helpers/test-mindsdb.ts`):
- `setupTestMindsDB()`: Initialize MindsDB HTTP client
- `executeMindsDBQuery()`: Execute SQL queries
- `listMindsDBDatabases()`: List databases
- `cleanupTestMindsDB()`: Drop test databases

**MCPHub Helper** (`tests/integration/helpers/test-mcphub.ts`):
- `setupTestMCPHub()`: Initialize MCPHub client
- `verifyMCPHubConnection()`: Health check (accepts 200/503)
- `listMCPServers()`: List configured MCP servers
- `cleanupTestMCPHub()`: Minimal cleanup (protocol server)

**MCP Email Helper** (`tests/integration/helpers/test-mcp-email.ts`):
- `setupTestMCPEmail()`: Initialize SSE client with timeout
- `verifyMCPEmailConnection()`: Check SSE endpoint
- `checkMCPEmailSSEEndpoint()`: Validate SSE stream
- `cleanupTestMCPEmail()`: Minimal cleanup (protocol server)

**Test Server Helper** (`tests/integration/helpers/test-server.ts`):
- `createTestServer()`: Initialize NestJS test application
- `closeTestServer()`: Shutdown test server
- `getHttpServer()`: Get HTTP server for supertest
- `getService()`: Access service instances from DI container

**Test Data Factories** (`tests/integration/helpers/factories.ts`):
- `UserFactory`: Generate realistic user test data
- `ConversationFactory`: Generate conversation test data
- `MessageFactory`: Generate message test data
- `TestDataHelper`: Utility functions (unique emails, passwords, retry logic)

#### Running Integration Tests

```bash
# Run all integration tests (24 tests)
pnpm nx:integration

# Run integration tests for affected projects only
pnpm nx:integration:affected

# Run integration tests for specific project
pnpm nx integration api-customer-service

# Run with coverage
pnpm nx integration api-customer-service --coverage
```

#### Test Environment

**Automatic Environment Loading:**
- Tests automatically load from `config/env/.env.${NX_APP_ENV}`
- No manual environment variable passing required
- Automatic hostname mapping: Docker services → localhost ports

**Service Integration Coverage:**
- ✅ PostgreSQL (port 54320) - Database integration
- ✅ MongoDB (port 27018) - Document store integration
- ✅ MinIO (port 9000) - S3 storage integration
- ✅ n8n (port 5678) - Workflow automation (optional API key)
- ✅ NocoDB (port 8080) - Database UI (optional auth token)
- ✅ MindsDB (port 47334) - AI database integration
- ✅ MCPHub (port 3000) - MCP protocol orchestration
- ✅ MCP Email (port 9557) - Email SSE protocol

**Authentication Handling:**
- Optional services (n8n, NocoDB) skip tests gracefully when credentials not configured
- Clear setup instructions provided in console output
- No test failures from missing optional configuration

**Environment Configuration** (`config/env/.env.dev`):
```bash
# Automatically loaded by integration tests
NX_APP_ENV=dev
POSTGRES_HOST=localhost
POSTGRES_PORT=54320
MONGO_HOST=localhost
MONGO_PORT=27018
# ... other service configurations
```

#### Automated Quality Gates

**Pre-commit Hooks** (`.husky/pre-commit`):
- ✅ Run linters (ESLint, Prettier)
- ✅ Run unit tests on affected projects
- ℹ️ Run integration tests (advisory, not blocking)

**Pre-push Hooks** (`.husky/pre-push`):
- ✅ Run all unit tests
- ✅ Run integration tests on affected projects
- ✅ Verify security configuration

**CI/CD Pipeline** (`.github/workflows/`):
- `integration-tests.yaml`: Dedicated integration test workflow
- `ci.yaml`: Complete CI/CD pipeline with all checks
- Runs on every PR and push to main/develop
- Posts coverage reports to PRs
- Uploads results to Codecov

### Integration Test Requirements

Follow these rules for effective integration testing:

1. **Test Environment Setup**
   - Use `docker-compose.test.yaml` to start test services
   - Ensure databases are migrated and seeded before tests
   - Clean up state between test runs using `cleanupTestDatabase()`

2. **Test Location**
   - Place integration tests under `tests/integration/` inside each project
   - Keep tests close to the project they verify
   - Use descriptive test file names ending with `.integration.spec.ts`

3. **Execution**
   - Define `integration` target in `project.json`
   - Execute with: `pnpm nx integration <project-name>`
   - Run on every PR using Nx affected commands

4. **Cross-Service Scenarios**
   - Cover interactions between APIs, workers, and databases
   - Validate shared libraries integrate correctly
   - Test authentication flows end-to-end
   - Verify data consistency across services

5. **Continuous Integration**
   - Integration tests run automatically on every pull request
   - Pipeline fails when any integration test fails
   - Coverage reports generated and posted to PRs
   - Test execution time tracked and monitored

6. **Coverage Requirement**
   - Every service must have at least one integration test
   - Target >80% coverage for business logic
   - Document test scenarios in project README

### Test Best Practices

- **ALWAYS write tests first** (TDD is mandatory, not optional)
  - Start every feature with a failing test
  - Let tests guide your implementation
  - Tests document expected behavior
- **Test behavior, not implementation**
- **Use descriptive test names** that explain what should happen
- **Keep tests independent** with proper cleanup
- **Mock external dependencies** in unit tests
- **Use real services** in integration tests
- **Clean up resources** after tests using `afterEach` hooks
- **Document complex test scenarios** with comments
- **Use test data factories** for realistic, varied data
- **Handle async operations** properly with proper timeouts
- **Follow incremental test development**:
  1. Write simplest test case first
  2. Add edge cases incrementally
  3. Test error paths separately
  4. Build complexity gradually

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
