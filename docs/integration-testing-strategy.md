# ChatSuite Integration Testing Strategy

**Version**: 1.0  
**Last Updated**: 2025-12-28  
**Owner**: Dr. Hubertus Becker

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Architecture](#architecture)
4. [Test Categories](#test-categories)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Environment Setup](#environment-setup)
7. [Continuous Integration](#continuous-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose

This document defines the comprehensive integration testing strategy for ChatSuite, covering all microservices, databases, and inter-service communication patterns. Integration tests validate that components work correctly together in real-world scenarios.

### Goals

- **Reliability**: Catch integration issues before production
- **Confidence**: Deploy with certainty that services work together
- **Documentation**: Tests serve as living documentation of system behavior
- **Speed**: Fast feedback loop for developers
- **Coverage**: >80% coverage for all business logic

### Scope

Integration tests cover:

- API endpoints with real database interactions
- Inter-service communication (API → Database → External Services)
- Authentication and authorization flows
- Data persistence and retrieval
- Error handling and edge cases
- WebSocket connections (LibreChat, n8n)
- File upload/download (MinIO)
- Email processing (MCP Email)

---

## Testing Philosophy

### Test-Driven Development (TDD) Approach

ChatSuite follows strict Test-Driven Development for all new features and bug fixes:

**The TDD Cycle (Red-Green-Refactor):**

1. **RED**: Write a failing test

   - Define expected behavior before writing code
   - Test should fail for the right reason
   - Clarifies requirements and interface design

2. **GREEN**: Make the test pass

   - Write minimal code to pass the test
   - Don't optimize prematurely
   - Focus on making it work first

3. **REFACTOR**: Improve the code
   - Clean up implementation
   - Remove duplication
   - Keep all tests passing

**Benefits:**

- ✅ Tests serve as living documentation
- ✅ Prevents regression bugs
- ✅ Encourages better design
- ✅ Increases confidence in changes
- ✅ Reduces debugging time

**Example TDD Workflow:**

```typescript
// STEP 1 (RED): Write failing test
describe('UserService', () => {
  it('should create user with hashed password', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      password: 'plain-password',
    });

    expect(user.password).not.toBe('plain-password');
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt format
  });
});
// Test fails - service doesn't exist yet

// STEP 2 (GREEN): Implement minimal code
class UserService {
  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.repository.save({
      ...data,
      password: hashedPassword,
    });
  }
}
// Test passes

// STEP 3 (REFACTOR): Improve if needed
class UserService {
  private readonly SALT_ROUNDS = 10;

  async create(data: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(data.password);
    return this.repository.save({
      ...data,
      password: hashedPassword,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
}
// Test still passes, code is cleaner
```

### Incremental Development

**Break Work into Small Steps:**

Every feature should be implemented in small, testable increments:

- ✅ Each increment takes 15-30 minutes
- ✅ Each increment includes tests
- ✅ Each increment is committable
- ✅ Each increment moves toward the goal

**Example: "Add User Authentication"**

❌ **BAD** (monolithic approach):

- Implement entire auth system in one go (4+ hours)
- Write all tests at the end
- One massive commit
- High risk of bugs

✅ **GOOD** (incremental approach):

1. **Step 1** (20 min): User model + tests

   ```
   test: add user model validation tests
   feat: create user model with email/password
   ```

2. **Step 2** (15 min): Password hashing + tests

   ```
   test: add password hashing tests
   feat: implement bcrypt password hashing
   ```

3. **Step 3** (25 min): Login endpoint + tests

   ```
   test: add login endpoint integration tests
   feat: implement POST /auth/login endpoint
   ```

4. **Step 4** (20 min): JWT generation + tests

   ```
   test: add JWT token generation tests
   feat: implement JWT signing and validation
   ```

5. **Step 5** (15 min): Auth middleware + tests
   ```
   test: add auth middleware tests
   feat: implement JWT auth guard middleware
   ```

Total: 5 commits, 95 minutes, fully tested at each step

**Benefits of Incremental Development:**

- Easy to review (small PRs)
- Easy to test (one thing at a time)
- Easy to debug (small change surface)
- Easy to revert (granular commits)
- Continuous progress visibility

### What Makes a Good Integration Test

✅ **DO:**

- Test real service interactions without mocks
- Use Docker containers for dependencies (databases, Redis, etc.)
- Validate end-to-end workflows
- Clean up data after each test
- Use realistic test data
- Test error conditions
- Verify side effects (database changes, API calls)

❌ **DON'T:**

- Mock database calls (that's a unit test)
- Skip cleanup (causes test pollution)
- Use production credentials
- Test implementation details
- Create flaky tests
- Ignore error paths

### Test Pyramid for ChatSuite

```
        /\
       /  \        E2E Tests (10%)
      /----\       - Cypress/Playwright
     /      \      - Full user workflows
    /--------\     - Cross-service scenarios
   /          \
  /------------\   Integration Tests (30%)
 /              \  - Service + Database
/----------------\ - API endpoints
                   - Service communication

Unit Tests (60%)
- Pure functions
- Business logic
- Component isolation
```

---

## Architecture

### Test Infrastructure

```
ChatSuite Test Environment
├── Docker Compose Test Profile
│   ├── PostgreSQL (Test DB)
│   ├── MongoDB (Test DB)
│   ├── Redis (Test Cache)
│   └── MinIO (Test Storage)
├── Test Utilities Library
│   ├── Database Helpers
│   ├── Authentication Helpers
│   ├── Data Factories
│   └── Assertion Helpers
└── CI/CD Pipeline
    ├── GitHub Actions
    ├── Nx Affected Commands
    └── Coverage Reporting
```

### Service Dependency Map

```
┌─────────────────────────────────────────────────┐
│ External Services (Mocked in Integration Tests)│
│ - OpenAI API                                     │
│ - Anthropic API                                  │
└─────────────────────────────────────────────────┘
                      ▲
                      │
┌─────────────────────────────────────────────────┐
│ ChatSuite Services (Real Containers)            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Client App   │  │ API Customer │            │
│  │ (React)      │─▶│ Service      │            │
│  │ Port: 4200   │  │ (NestJS)     │            │
│  └──────────────┘  │ Port: 3333   │            │
│                     └──────┬───────┘            │
│                            │                     │
│  ┌──────────────┐  ┌──────▼───────┐            │
│  │ LibreChat    │  │ PostgreSQL   │            │
│  │ Port: 3080   │  │ Port: 5432   │            │
│  └──────┬───────┘  └──────────────┘            │
│         │                                        │
│  ┌──────▼───────┐  ┌──────────────┐            │
│  │ MongoDB      │  │ n8n          │            │
│  │ Port: 27017  │  │ Port: 5678   │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ MCPHub       │  │ MCP Email    │            │
│  │ Port: 3000   │  │ Port: 9557   │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ MinIO        │  │ MindsDB      │            │
│  │ Port: 9000   │  │ Port: 47334  │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

---

## Test Categories

### 1. API Integration Tests

**Location**: `apps/api-customer-service/tests/integration/`

**Covers**:

- HTTP endpoint behavior with real database
- Request/response validation
- Authentication middleware
- Error handling
- CRUD operations with data persistence

**Example**:

```typescript
describe('User API Integration', () => {
  let app: INestApplication;
  let db: DataSource;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    db = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    // Clean up test data
    await db.query("DELETE FROM users WHERE email LIKE '%@test.com'");
  });

  it('should create user and persist to database', async () => {
    const response = await request(app.getHttpServer()).post('/api/users').send({ name: 'Test User', email: 'test@test.com' }).expect(201);

    expect(response.body).toMatchObject({
      name: 'Test User',
      email: 'test@test.com',
    });

    // Verify database persistence
    const user = await db.query('SELECT * FROM users WHERE email = $1', ['test@test.com']);
    expect(user.rows).toHaveLength(1);
  });
});
```

### 2. Database Integration Tests

**Location**: `apps/*/tests/integration/database/`

**Covers**:

- Connection pooling
- Transaction handling
- Schema migrations
- Data consistency
- Foreign key constraints

**Example**:

```typescript
describe('Database Transactions', () => {
  it('should rollback on error', async () => {
    const queryRunner = db.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query('INSERT INTO users (name, email) VALUES ($1, $2)', ['User 1', 'user1@test.com']);

      // This should fail due to duplicate email
      await queryRunner.query('INSERT INTO users (name, email) VALUES ($1, $2)', ['User 2', 'user1@test.com']);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    // Verify no data was persisted
    const users = await db.query('SELECT * FROM users WHERE email = $1', ['user1@test.com']);
    expect(users.rows).toHaveLength(0);
  });
});
```

### 3. Service Communication Tests

**Location**: `apps/*/tests/integration/services/`

**Covers**:

- API-to-API calls
- Service discovery
- Error propagation
- Timeout handling
- Retry logic

**Example**:

```typescript
describe('LibreChat to MindsDB Integration', () => {
  it('should query MindsDB for predictions', async () => {
    // Create a test model in MindsDB
    await mindsdbClient.query(`
      CREATE MODEL test_predictor
      FROM test_data
      PREDICT outcome
    `);

    // Trigger from LibreChat
    const response = await request(librechatUrl)
      .post('/api/chat')
      .send({
        message: 'Predict sales for next quarter',
        model: 'mindsdb:test_predictor',
      })
      .expect(200);

    expect(response.body.prediction).toBeDefined();
    expect(response.body.confidence).toBeGreaterThan(0.5);
  });
});
```

### 4. Authentication & Authorization Tests

**Location**: `apps/*/tests/integration/auth/`

**Covers**:

- JWT token generation/validation
- Session management
- Role-based access control
- API key validation
- OAuth flows

**Example**:

```typescript
describe('Authentication Flow', () => {
  it('should authenticate user and return JWT', async () => {
    // Create test user
    await db.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', ['user@test.com', await hashPassword('password123')]);

    // Login
    const loginResponse = await request(app.getHttpServer()).post('/api/auth/login').send({ email: 'user@test.com', password: 'password123' }).expect(200);

    const { accessToken, refreshToken } = loginResponse.body;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    // Use token to access protected route
    const protectedResponse = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`).expect(200);

    expect(protectedResponse.body.email).toBe('user@test.com');
  });
});
```

### 5. File Upload/Download Tests

**Location**: `apps/*/tests/integration/storage/`

**Covers**:

- MinIO S3 operations
- File validation
- Streaming uploads
- Presigned URLs
- File metadata

**Example**:

```typescript
describe('MinIO File Operations', () => {
  it('should upload file and generate download URL', async () => {
    const testFile = Buffer.from('test content');

    // Upload to MinIO via API
    const uploadResponse = await request(app.getHttpServer()).post('/api/files/upload').attach('file', testFile, 'test.txt').expect(201);

    const { fileId, url } = uploadResponse.body;

    // Verify file exists in MinIO
    const fileExists = await minioClient.statObject('chatsuite', fileId);
    expect(fileExists.size).toBe(testFile.length);

    // Download file
    const downloadResponse = await request(url).get('').expect(200);
    expect(downloadResponse.body.toString()).toBe('test content');
  });
});
```

### 6. WebSocket Integration Tests

**Location**: `apps/*/tests/integration/websockets/`

**Covers**:

- Connection establishment
- Message broadcasting
- Room management
- Reconnection logic
- Error handling

**Example**:

```typescript
describe('LibreChat WebSocket', () => {
  it('should stream chat responses', (done) => {
    const socket = io('http://localhost:3080', {
      auth: { token: validJWT },
    });

    const messages: string[] = [];

    socket.on('connect', () => {
      socket.emit('chat:message', {
        message: 'Hello AI',
        conversationId: 'test-conv-1',
      });
    });

    socket.on('chat:response', (data) => {
      messages.push(data.content);
    });

    socket.on('chat:complete', () => {
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.join('')).toContain('response');
      socket.disconnect();
      done();
    });
  });
});
```

### 7. Workflow Integration Tests (n8n)

**Location**: `apps/*/tests/integration/workflows/`

**Covers**:

- Workflow execution
- Webhook triggers
- Data transformation
- Error handling
- External API calls

**Example**:

```typescript
describe('n8n Workflow Integration', () => {
  it('should execute email processing workflow', async () => {
    // Create test workflow
    const workflow = await n8nClient.createWorkflow({
      name: 'Test Email Processing',
      nodes: [{ type: 'webhook', parameters: { path: 'test-webhook' } }, { type: 'email-parser' }, { type: 'database-insert' }],
    });

    // Activate workflow
    await n8nClient.activateWorkflow(workflow.id);

    // Trigger webhook
    const response = await request('http://localhost:5678')
      .post(`/webhook/test-webhook`)
      .send({
        from: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email',
      })
      .expect(200);

    // Verify data was inserted
    const result = await db.query('SELECT * FROM emails WHERE subject = $1', ['Test Email']);
    expect(result.rows).toHaveLength(1);
  });
});
```

---

## Implementation Guidelines

### Directory Structure

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
│       │   ├── user.integration.spec.ts
│       │   └── auth.integration.spec.ts
│       ├── database/
│       │   └── transactions.integration.spec.ts
│       ├── services/
│       │   └── external-api.integration.spec.ts
│       └── helpers/
│           ├── test-db.ts
│           ├── test-server.ts
│           └── factories.ts
├── jest.config.ts                     # Unit test config
└── jest.config.integration.ts         # Integration test config
```

### Test Configuration

**jest.config.integration.ts**:

```typescript
export default {
  displayName: 'api-customer-service-integration',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.spec.ts'],
  globalSetup: '<rootDir>/tests/integration/setup.ts',
  globalTeardown: '<rootDir>/tests/integration/teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/tests/integration/jest.setup.ts'],
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-customer-service-integration',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  testTimeout: 30000, // 30 seconds for integration tests
};
```

### Test Helpers

**tests/integration/helpers/test-db.ts**:

```typescript
import { DataSource } from 'typeorm';

let dataSource: DataSource | null = null;

export async function setupTestDatabase(): Promise<DataSource> {
  if (dataSource) return dataSource;

  dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'admin',
    database: process.env.POSTGRES_DB || 'chatsuite_test',
    entities: ['src/**/*.entity.ts'],
    synchronize: true, // Only for tests
    dropSchema: false,
  });

  await dataSource.initialize();
  return dataSource;
}

export async function cleanupTestDatabase(): Promise<void> {
  if (!dataSource) return;

  const entities = dataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
  }
}

export async function closeTestDatabase(): Promise<void> {
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
  }
}
```

**tests/integration/helpers/test-server.ts**:

```typescript
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app/app.module';

let app: INestApplication | null = null;

export async function createTestServer(): Promise<INestApplication> {
  if (app) return app;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

export async function closeTestServer(): Promise<void> {
  if (app) {
    await app.close();
    app = null;
  }
}

export function getTestServer(): INestApplication {
  if (!app) {
    throw new Error('Test server not initialized. Call createTestServer() first.');
  }
  return app;
}
```

**tests/integration/helpers/factories.ts**:

```typescript
import { faker } from '@faker-js/faker';

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

export class ConversationFactory {
  static create(overrides: Partial<Conversation> = {}): Conversation {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      userId: faker.string.uuid(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
```

### Setup and Teardown

**tests/integration/setup.ts**:

```typescript
import { setupTestDatabase } from './helpers/test-db';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalSetup() {
  console.log('\n🔧 Setting up integration test environment...\n');

  // Start test containers
  try {
    await execAsync('docker-compose -f docker-compose.test.yaml up -d postgres redis');
    console.log('✅ Test containers started');

    // Wait for services to be ready
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Initialize database
    const db = await setupTestDatabase();
    await db.synchronize(true);
    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    throw error;
  }
}
```

**tests/integration/teardown.ts**:

```typescript
import { closeTestDatabase } from './helpers/test-db';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalTeardown() {
  console.log('\n🧹 Tearing down integration test environment...\n');

  try {
    await closeTestDatabase();
    console.log('✅ Database connections closed');

    // Stop test containers
    await execAsync('docker-compose -f docker-compose.test.yaml down');
    console.log('✅ Test containers stopped');
  } catch (error) {
    console.error('❌ Failed to teardown test environment:', error);
  }
}
```

---

## Environment Setup

### Automatic Environment Configuration

Integration tests automatically load configuration from `config/env/.env.${NX_APP_ENV}` using the setup.ts global setup file.

**Key Features:**

- ✅ Automatic dotenv loading from config/env directory
- ✅ Hostname mapping (Docker services → localhost ports)
- ✅ No manual environment variable passing needed
- ✅ Uses existing docker-compose.yaml services
- ✅ Graceful authentication handling (optional API keys/tokens)

**Environment File** (`config/env/.env.dev`):

```bash
# Active environment
NX_APP_ENV=dev

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=54320
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=chatsuite

# MongoDB
MONGO_HOST=localhost
MONGO_PORT=27018
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin123

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# n8n (optional API key)
N8N_HOST=localhost
N8N_PORT=5678
N8N_API_KEY=  # Optional, tests skip gracefully if not set

# NocoDB (optional auth token)
NOCODB_HOST=localhost
NOCODB_PORT=8080
NOCODB_AUTH_TOKEN=  # Optional, tests skip gracefully if not set

# MindsDB
MINDSDB_HOST=localhost
MINDSDB_PORT=47334

# MCPHub
MCPHUB_HOST=localhost
MCPHUB_PORT=3000

# MCP Email
MCP_EMAIL_HOST=localhost
MCP_EMAIL_PORT=9557

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
```

### Hostname Mapping (setup.ts)

The global setup file automatically maps Docker hostnames to localhost:

```typescript
// tests/integration/setup.ts
export default async function globalSetup() {
  // Load environment from config/env/.env.${NX_APP_ENV}
  const envFile = path.resolve(__dirname, `../../../config/env/.env.${process.env.NX_APP_ENV || 'dev'}`);
  dotenv.config({ path: envFile });

  // Map Docker service hostnames to localhost ports
  process.env.POSTGRES_HOST = 'localhost';
  process.env.POSTGRES_PORT = '54320';
  process.env.MONGO_HOST = 'localhost';
  process.env.MONGO_PORT = '27018';
  process.env.MINIO_ENDPOINT = 'localhost';
  process.env.MINIO_PORT = '9000';
  process.env.N8N_HOST = 'localhost';
  process.env.N8N_PORT = '5678';
  process.env.NOCODB_HOST = 'localhost';
  process.env.NOCODB_PORT = '8080';
  process.env.MINDSDB_HOST = 'localhost';
  process.env.MINDSDB_PORT = '47334';
  process.env.MCPHUB_HOST = 'localhost';
  process.env.MCPHUB_PORT = '3000';
  process.env.MCP_EMAIL_HOST = 'localhost';
  process.env.MCP_EMAIL_PORT = '9557';
}
```

### Using Existing Docker Services

Integration tests connect to the **existing docker-compose.yaml services** that are already running:

```bash
# Ensure all services are running
pnpm start

# Verify services are healthy
pnpm test

# Run integration tests (connects to existing services)
pnpm nx:integration
```

**No separate test infrastructure needed!** Tests use the same services as development with automatic environment configuration.

---

## Continuous Integration

### GitHub Actions Workflow

**.github/workflows/integration-tests.yaml**:

```yaml
name: Integration Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    services:
      postgres:
        image: postgres:latest
        env:
          POSTGRES_USER: test_admin
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: chatsuite_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017

      redis:
        image: redis:latest
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run affected integration tests
        run: pnpm nx affected --target=integration --base=origin/main --parallel=1
        env:
          POSTGRES_HOST: localhost
          POSTGRES_PORT: 5432
          POSTGRES_USER: test_admin
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: chatsuite_test
          MONGODB_URI: mongodb://localhost:27017/chatsuite_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      - name: Generate coverage report
        run: pnpm nx affected --target=integration --base=origin/main --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/**/coverage-final.json
          flags: integration
          name: integration-tests

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const coverage = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json'));
            const comment = `
            ## Integration Test Results

            - **Lines**: ${coverage.total.lines.pct}%
            - **Statements**: ${coverage.total.statements.pct}%
            - **Functions**: ${coverage.total.functions.pct}%
            - **Branches**: ${coverage.total.branches.pct}%
            `;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Nx Integration Target

Add to each `project.json`:

```json
{
  "targets": {
    "integration": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/apps/{projectName}-integration"],
      "options": {
        "jestConfig": "apps/{projectName}/jest.config.integration.ts",
        "passWithNoTests": false,
        "runInBand": true,
        "coverage": true,
        "coverageReporters": ["html", "json", "lcov", "text"]
      }
    }
  }
}
```

---

## Best Practices

### 0. Test-Driven Development (Mandatory)

✅ **Write Tests First**:

```typescript
// ALWAYS start with the test
describe('Payment Processing', () => {
  it('should process valid payment', async () => {
    // Arrange: Set up test data
    const payment = PaymentFactory.create({
      amount: 100.0,
      currency: 'USD',
    });

    // Act: Execute the operation
    const result = await paymentService.process(payment);

    // Assert: Verify expected behavior
    expect(result.status).toBe('success');
    expect(result.transactionId).toBeDefined();
  });
});
// Now implement paymentService.process() to make this pass
```

❌ **Don't Write Code First**:

```typescript
// BAD: Implementing without tests
class PaymentService {
  async process(payment: Payment) {
    // Code without tests leads to:
    // - Unclear requirements
    // - Untested edge cases
    // - Regression bugs
    // - Poor design
  }
}
```

### 0.1. Incremental Test Development

✅ **Build Tests Incrementally**:

```typescript
// Start with happy path
it('should create user with valid data', async () => {
  const user = await userService.create(validUserData);
  expect(user.id).toBeDefined();
});

// Add edge cases one at a time
it('should reject duplicate email', async () => {
  await userService.create(validUserData);
  await expect(userService.create(validUserData)).rejects.toThrow('Email already exists');
});

// Add error cases incrementally
it('should reject invalid email format', async () => {
  await expect(userService.create({ email: 'invalid' })).rejects.toThrow('Invalid email');
});

// Build complexity gradually
it('should hash password before storage', async () => {
  const user = await userService.create(validUserData);
  const dbUser = await repository.findOne(user.id);
  expect(dbUser.password).not.toBe(validUserData.password);
});
```

### 1. Test Isolation

✅ **Good**:

```typescript
describe('User Service', () => {
  beforeEach(async () => {
    // Clean database before each test
    await cleanupTestDatabase();
  });

  it('should create user', async () => {
    const user = await userService.create({
      name: 'Test User',
      email: 'unique@test.com',
    });
    expect(user.id).toBeDefined();
  });
});
```

❌ **Bad**:

```typescript
describe('User Service', () => {
  let userId: string;

  it('should create user', async () => {
    const user = await userService.create({ name: 'Test User' });
    userId = user.id; // State leaking between tests
  });

  it('should update user', async () => {
    // Depends on previous test
    await userService.update(userId, { name: 'Updated' });
  });
});
```

### 2. Realistic Test Data

✅ **Good**:

```typescript
const testUser = UserFactory.create({
  email: `test-${Date.now()}@example.com`, // Unique email
  name: 'John Doe',
  role: 'customer',
});
```

❌ **Bad**:

```typescript
const testUser = {
  email: 'test@test.com', // Same email causes conflicts
  name: 'test',
};
```

### 3. Test Error Paths

✅ **Good**:

```typescript
it('should handle database connection failure', async () => {
  // Simulate database down
  await db.close();

  await expect(userService.findAll()).rejects.toThrow('Database connection failed');
});
```

### 4. Avoid Test Timeouts

✅ **Good**:

```typescript
it('should process large file', async () => {
  const largeFile = generateLargeFile(100 * 1024 * 1024); // 100MB
  await fileService.upload(largeFile);
}, 60000); // 60 second timeout for this specific test
```

### 5. Use Transactions for Speed

✅ **Good**:

```typescript
describe('Database Operations', () => {
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    queryRunner = db.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('should insert data', async () => {
    await queryRunner.query('INSERT INTO users ...');
    // Data automatically rolled back after test
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Port Conflicts

**Problem**: Test containers fail to start due to port conflicts.

**Solution**:

```bash
# Check what's using the port
lsof -i :5432

# Use different ports in docker-compose.test.yaml
ports:
  - '5433:5432'  # Map to 5433 on host
```

#### 2. Database Connection Timeout

**Problem**: Tests fail with "Connection timeout" errors.

**Solution**:

```typescript
// Increase timeout in jest.config.integration.ts
export default {
  testTimeout: 60000, // 60 seconds
};

// Or for specific tests
it('slow test', async () => {
  // test code
}, 120000); // 2 minutes
```

#### 3. Test Data Pollution

**Problem**: Tests pass individually but fail when run together.

**Solution**:

```typescript
// Always clean up in afterEach
afterEach(async () => {
  await cleanupTestDatabase();
});

// Use unique identifiers
const uniqueEmail = `test-${Date.now()}@example.com`;
```

#### 4. Flaky WebSocket Tests

**Problem**: WebSocket tests fail intermittently.

**Solution**:

```typescript
it('should handle websocket', (done) => {
  const socket = io('http://localhost:3080');

  // Add timeout safety
  const timeout = setTimeout(() => {
    socket.disconnect();
    done(new Error('Test timeout'));
  }, 5000);

  socket.on('message', (data) => {
    clearTimeout(timeout);
    expect(data).toBeDefined();
    socket.disconnect();
    done();
  });
});
```

#### 5. Slow Test Execution

**Problem**: Integration tests take too long to run.

**Solutions**:

- Run tests in parallel where possible
- Use database transactions for faster cleanup
- Cache Docker images
- Use `nx affected` to only run changed tests
- Optimize Docker Compose startup

```bash
# Run only affected tests
pnpm nx affected --target=integration --base=origin/main

# Run specific project tests
pnpm nx integration api-customer-service

# Run with coverage only in CI
pnpm nx integration api-customer-service --coverage
```

---

## Summary

This integration testing strategy ensures ChatSuite maintains high reliability through comprehensive testing of real service interactions. By following these guidelines, we achieve:

- ✅ **Confidence** in deployments
- ✅ **Fast feedback** for developers
- ✅ **Living documentation** of system behavior
- ✅ **Automated quality** gates in CI/CD
- ✅ **Reduced bugs** in production

**Remember**: Integration tests complement, not replace, unit tests. Use the right tool for the job.

---

## Development Methodology

### Always Follow TDD

Every integration test and feature must follow the Red-Green-Refactor cycle:

1. **🔴 RED**: Write failing integration test

   ```typescript
   // Test what you want to build
   it('should process payment successfully', async () => {
     const result = await paymentService.process(validPayment);
     expect(result.status).toBe('success');
   });
   // Test fails - feature doesn't exist yet
   ```

2. **🟢 GREEN**: Make the test pass

   ```typescript
   // Implement minimal code to pass
   async process(payment: Payment) {
     return { status: 'success' };
   }
   ```

3. **🔵 REFACTOR**: Improve implementation
   ```typescript
   // Clean up while keeping tests green
   async process(payment: Payment): Promise<PaymentResult> {
     this.validate(payment);
     const transaction = await this.gateway.charge(payment);
     return this.formatResult(transaction);
   }
   ```

### Break Work into Small Steps

**Example: Adding Email Notification Integration**

✅ **GOOD** (Incremental approach):

1. Step 1 (15 min): Test email connection

   - Write test for SMTP connection
   - Implement connection logic
   - Commit: `test: add email connection test` + `feat: connect to SMTP server`

2. Step 2 (20 min): Test email sending

   - Write test for sending email
   - Implement send logic
   - Commit: `test: add email sending test` + `feat: implement email sending`

3. Step 3 (15 min): Test template rendering

   - Write test for email templates
   - Implement template system
   - Commit: `test: add template tests` + `feat: add email templates`

4. Step 4 (25 min): Integration test complete workflow
   - Write end-to-end integration test
   - Wire everything together
   - Commit: `test: add e2e email test` + `feat: complete email integration`

❌ **BAD** (Monolithic approach):

- Implement entire email system in one go (2+ hours)
- Write tests afterward
- One giant commit
- Hard to review, debug, and test

### Benefits of This Approach

- **Small PRs**: Each step is 15-30 minutes, easy to review
- **Always working**: Every commit has passing tests
- **Easy debugging**: Small change surface when issues arise
- **Clear progress**: Visibility into what's done and what remains
- **Low risk**: Can deploy any increment safely

---

**Next Steps**:

1. ✅ Integration test infrastructure implemented
2. ✅ Test utilities library created
3. ✅ Pre-commit hooks configured
4. ✅ GitHub Actions workflow setup
5. 🎯 Continue expanding test coverage following TDD + incremental approach

**Questions?** Open an issue or PR with suggestions for improvement.

**Remember**: Tests first, small steps, continuous progress.
