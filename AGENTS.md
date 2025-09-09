
# ChatSuite - Developer & Agent Guidelines

**The Complete AI Collaboration Platform - Technical Documentation**

This document serves as the authoritative reference for all development, service architecture, and automation standards within the ChatSuite ecosystem. Whether you're a developer, DevOps engineer, or AI agent, this guide ensures consistent, high-quality implementations across the platform.

## Platform Overview

ChatSuite integrates multiple AI and productivity tools into a unified collaboration platform:

- **LibreChat** - Multi-model AI chat interface
- **n8n** - Visual workflow automation  
- **MindsDB** - AI-powered database platform
- **NocoDB** - Intuitive database interface
- **MCPHub** - Model Context Protocol orchestration
- **MCP Email** - Intelligent email processing
- **React Client** - Modern web interface
- **NestJS API** - Scalable backend services

> **Mission**: Enable seamless collaboration between AI systems, automation workflows, and human users through intelligent service orchestration and unified data access.


## Platform Architecture & Structure

This comprehensive guide covers every component of the ChatSuite platform. Use this as your navigation map for development, deployment, and troubleshooting.

### **Repository Structure**

| Directory | Purpose & Contents |
|-----------|-------------------|
| **apps/** | All deployable applications and services |
| `api-customer-service/` | **NestJS** backend API with business logic, controllers, services, and configuration |
| `client-app/` | **React** frontend application with components, routing, and user interface |
| **config/** | Centralized configuration for all platform services |
| `env/` | Environment templates (`env.dev`, `env.host`, `env.qa`) and runtime configuration |
| `librechat/` | LibreChat configuration including MongoDB and vector database setup |
| `mcp-email-server/` | MCP Email Server configuration for intelligent email processing |
| `mcphub/` | MCPHub configuration for protocol orchestration |
| `mindsdb/` | MindsDB configuration, Docker setup, and AI database scripts |
| `n8n/` | n8n workflow automation configuration and entrypoints |
| `nginx/` | Nginx reverse proxy configuration for SSL and routing |
| `nocodb/` | NocoDB database interface configuration |
| `pnpm/` | Package manager configuration for dependency caching |
| `postgres/` | PostgreSQL database initialization and setup scripts |
| **data/** | Persistent data volumes for all containerized services |
| `librechat/` | LibreChat data (images, logs, search index, MongoDB, uploads) |
| `mcp-email-server/` | Email server data and configuration |
| `mcphub/` | MCPHub data and server configurations |
| `mindsdb/` | MindsDB data (models, cache, logs, storage) |
| `nocodb/` | NocoDB data and user configurations |
| `nocodb/pgadmin/` | PgAdmin data and user settings |
| `nocodb/postgres/` | PostgreSQL database files |
| **docs/** | Platform documentation, guides, and reference materials |
| ** libs/** | Shared libraries and reusable modules (future expansion) |
| **schema/** | Database schemas and migration management |
| schema/consumer/, schema/customer/ | Prisma ORM schemas and database migrations |
| schema/orchestrator/ | Master database schema and environment templates |
| **tools/** | Development tools, automation scripts, and CI/CD utilities |
| tools/dev-scripts/ | All development scripts (prefixed with `cmd-`) |
| tools/tsconfig.tools.json | TypeScript configuration for tooling |
| **tmp/** | Temporary workspace for build artifacts and generated files |

### **Development Standards**

- All new applications must be created in `apps/` using Nx generators
- All persistent data must be mapped to appropriate `data/` subdirectories  
- All configuration and Docker assets must be placed in `config/`
- All documentation must be stored in the `docs/` directory
- All reusable code must be extracted to `libs/` as the codebase grows
- All database changes must be reflected in `schema/` with proper migrations
- All development scripts must be placed in `tools/dev-scripts/` with `cmd-` prefix
- Never place production code in `tmp/` or create `external/` unless specifically required
- **CRITICAL**: Always verify environment configuration using `docs/environment-configuration-solution.md`

> **This document is the single source of truth for all development standards within the ChatSuite platform.**


## Quick Reference & Essential Commands

### **Critical Files & Locations**
- **`.github/copilot-instructions.md`** - Coding standards and communication guidelines for AI agents
- **`repomix-output.xml`** - Machine-readable codebase summary for automated analysis
- **`tools/dev-scripts/`** - All development automation (never place scripts elsewhere)
- **`config/nginx/default.dev.conf`** - Central nginx proxy configuration
- **`config/env/`** - Environment templates and runtime configuration
- **`docs/environment-configuration-solution.md`** - Environment setup and security guide
- **`docs/environment-quick-reference.md`** - Quick environment reference

### **Security & Environment Commands**
```bash
pnpm env:verify     # Verify security configuration
pnpm env:show       # Display current environment  
pnpm env:set:host   # Set production environment (required before deployment)
pnpm env:set:dev    # Set development environment
pnpm env:set:qa     # Set QA environment
```

### **Core Platform Operations**
```bash
pnpm start          # Launch all services
pnpm stop           # Graceful shutdown
pnpm rebuild        # Complete system rebuild (stops, pulls, starts)
pnpm test           # Comprehensive health checks and verification
pnpm rebuild && pnpm test  # Full deployment workflow
```

## Services Architecture

The ChatSuite platform runs as a comprehensive microservices architecture with the following components:

### Core Application Services

| Service | Container | Port(s) | Purpose |
|---------|-----------|---------|---------|
| **nginx** | chatsuite_nginx | 10443 | Reverse proxy, SSL termination, and unified routing for all services |
| **api-customer-service** | chatsuite_api-customer-service | 3333 | NestJS backend API for customer-related operations |
| **client-app** | chatsuite_client-app | 4200 | React frontend application |

### Database Services

| Service | Container | Port(s) | Purpose |
|---------|-----------|---------|---------|
| **postgres** | chatsuite_postgres | 5432 | Primary PostgreSQL database for all services |
| **pgadmin** | chatsuite_pgadmin | 8080 | Web-based PostgreSQL administration interface |
| **mongodb** | chatsuite_mongodb | 27017 | MongoDB database for LibreChat |
| **vectordb** | chatsuite_vectordb | - | PostgreSQL with pgvector extension for vector storage |
| **meilisearch** | chatsuite_meilisearch | 7700 | Search engine for LibreChat |

### AI & Chat Services

| Service | Container | Port(s) | Purpose |
|---------|-----------|---------|---------|
| **librechat** | chatsuite_librechat | 3080 | AI chat interface and conversation management |
| **mindsdb** | chatsuite_mindsdb | 47334, 47335, 47337, 47338 | AI/ML database with HTTP, MySQL, MCP, and A2A APIs |

### Workflow & Integration Services

| Service | Container | Port(s) | Purpose |
|---------|-----------|---------|---------|
| **n8n** | chatsuite_n8n | 5678 | Workflow automation and integration platform |
| **nocodb** | chatsuite_nocodb | 8080 | Database GUI and low-code platform |

### Model Context Protocol (MCP) Services

| Service | Container | Port(s) | Purpose |
|---------|-----------|---------|---------|
| **mcphub** | chatsuite_mcphub | 3000 | Unified hub for multiple MCP servers and protocol management |
| **mcp-email-server** | chatsuite_mcp-email-server | 9557 | MCP server for IMAP/SMTP email operations |

### Service Dependencies

- **Core Apps**: client-app → api-customer-service → postgres
- **LibreChat**: librechat → mongodb, meilisearch, vectordb, mcphub
- **Database Tools**: pgadmin, nocodb → postgres
- **Workflows**: n8n → postgres
- **MCP**: mcphub → mcp-email-server
- **All Services**: → nginx (reverse proxy)

### Port Mapping Strategy

- **Direct Ports**: Each service exposes its native port for direct access
- **Nginx Proxy**: All services accessible via port 10443 with path-based routing
- **HTTPS**: All external communication secured via nginx SSL termination
- **Internal**: Services communicate via Docker networks (gateway, database_pg)


# Agent and Service Development Guidelines



## Service Development Principles

- Use NX generators for new services and libraries.
- Place all service code in the correct app or library directory.
- Use TypeScript strict mode for all code.
- Use shared libraries (`libs/core`, `libs/features`, etc.) for business logic and data models.
- Log all actions using the core logging library.
- Handle errors gracefully and provide actionable error messages.
- Never duplicate code—extract reusable logic into libraries.
- Document all public APIs and endpoints in the service's README.
- Always use named exports for TypeScript modules.

## Security

- Store secrets in environment variables or a secure vault; never commit secrets to the repository.
- Never log sensitive data (e.g., passwords, tokens).
- Validate all inputs and outputs for type and content.
- Use HTTPS endpoints exclusively for all communication (see [Service Access & HTTPS Architecture](#service-access--https-architecture)).
- Implement role-based access control and principle of least privilege.

## Communication Patterns

- Use recommended HTTP clients (e.g., Axios, fetch) with HTTPS URLs from the nginx proxy.
- Implement error handling, retries, and timeouts for all outbound calls.
- Prefer unified proxy routes (port 10443) for maximum compatibility and security.
- Document all endpoints and expected request/response formats.

## Testing Requirements

- Implement unit tests for all business logic (minimum 80% coverage recommended).
- Add integration tests for all endpoints and workflows.
- Place integration tests under `tests/integration/` in the service's project.
- Run all tests locally and in CI using the prescribed commands.

## Service Access & Architecture

### Overview

All ChatSuite services and applications are accessible both on their original ports and via a unified nginx reverse proxy. This ensures consistent access patterns for all internal and external service interactions, including agent-to-service calls, API requests, and web UI access.

### Nginx Reverse Proxy & Port Mapping

- **nginx** acts as a central routing point, proxying traffic to all services.
- Each service is exposed on:
  - Its original port (for direct access)
  - Unified proxy routes on port `10443` (e.g., `/api/customer/`, `/pgadmin/`, `/n8n/`, etc.)
- All nginx configuration is in `config/nginx/default.dev.conf`.

#### Port Mapping

| Service                  | Direct Port | Unified Proxy Route (10443) | Status |
|--------------------------|-------------|-----------------------------|---------| 
| Client App               | 4200        | /app/                       | HTTP + HTTPS |
| API Customer Service     | 3333        | /api/customer/              | HTTP + HTTPS |
| LibreChat                | 3080        | /librechat/                 | HTTP + HTTPS |
| PgAdmin                  | (internal)  | /pgadmin/                   | HTTPS Only |
| N8N                      | 5678        | /n8n/                       | HTTP + HTTPS |
| NocoDB                   | 8080        | /nocodb/                    | HTTP + HTTPS |
| MCPHub                   | 3000        | /mcphub/                    | HTTP + HTTPS |
| MCP Email Server         | 9557        | /mcp-email/                 | HTTP + HTTPS |
| MindsDB HTTP API         | 47334       | /mindsdb/                   | HTTP + HTTPS |
| MindsDB MySQL API        | 47335       | (MySQL protocol)            | MySQL Only |
| MindsDB MCP API          | 47337       | (MCP protocol)              | MCP Only |
| MindsDB A2A API          | 47338       | (A2A protocol)              | A2A Only |
| Nginx Proxy              | 10443       | (All services)              | HTTPS Only |

> **Note:** Services with "HTTP + HTTPS" can be accessed directly on their port or via the nginx proxy. PgAdmin is only accessible through the proxy for security. All services are accessible via the unified nginx proxy on port 10443 with HTTPS.

### Best Practices for Service Development

- **Always use HTTPS endpoints** for all inter-service and agent-to-service communication when possible.
- Prefer the nginx proxy routes (port 10443) for maximum compatibility and security.
- Update all health checks, integration tests, and service discovery logic to use appropriate URLs.
- When developing new services, document both the direct and proxy endpoints in your README.

### Testing & Debugging Access

- Use `curl http://localhost:<port>` to test direct access to any service.
- Use `curl https://localhost:10443/<route>` to test access via the nginx proxy.
- Check nginx logs (`docker logs chatsuite_nginx`) for proxy errors.
- If a service is not reachable, verify:
  - The service is healthy and running
  - The correct port is mapped in `docker-compose.yaml`
  - The nginx config includes a server block for the service
- For services that call other services, always use the HTTPS URL (proxy or unified route) in configuration and code.

### Service Communication

- The nginx proxy provides unified access to all services through port 10443.
- Services can communicate directly via their exposed ports or through the proxy.
- The nginx proxy can be configured for rate limiting, authentication, and advanced routing as needed.

## Example: Creating a New Service (NestJS/TypeScript)

```bash
pnpm nx g @nx/nest:app api-example-service --directory=apps --importPath=@chatsuite/api-example-service
```

## Example: Minimal Service Controller

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('example-service')
@Controller('example-service')
export class ExampleServiceController {
  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }
}
```

## Example: Service Communication

```typescript
import axios from 'axios';

// Direct service communication
const response = await axios.get('http://localhost:3333/api');

// Via nginx proxy
const response = await axios.get('https://localhost:10443/api/customer/');
```

## Code Sharing Strategy

The ChatSuite monorepo implements a structured code sharing strategy through categorized libraries in the `libs/` directory. This strategy enforces architectural boundaries, prevents code duplication, and ensures proper dependency flow.

### Library Categories

1. **UI Components** (`libs/ui/*`):
   - Reusable UI components implementing the design system
   - Purely presentational components with no business logic dependencies
   - Zero state management beyond component-level useState
   - Implements atomic design principles for consistent composition
   - Examples: Buttons, Forms, Cards, Tables, Layout components, UI utility hooks

2. **Features** (`libs/features/*`):
   - Complete reusable features spanning multiple components
   - Includes UI, business logic, and encapsulated state management
   - Self-contained modules with clear external APIs
   - Examples: Authentication flows, Data grids, File uploads, Search interfaces

3. **Core Libraries** (`libs/core/*`):
   - Fundamental business logic and domain models
   - Pure TypeScript with no framework dependencies
   - Highly stable APIs with semantic versioning
   - Examples: Business rules, Domain entities, Core algorithms, Validation logic

4. **Data Libraries** (`libs/data/*`):
   - Data access patterns and API clients
   - Database schemas and migration utilities
   - Caching strategies and data transformation
   - Examples: API clients, Database connectors, Data mappers, Cache utilities

5. **Utility Libraries** (`libs/utils/*`):
   - Pure functions and helper utilities
   - Framework-agnostic code with zero external dependencies
   - Highly reusable across different contexts
   - Examples: Date utilities, String formatters, Math helpers, Type guards

### Library Design Principles

1. **Single Responsibility**: Each library should have a clear, focused purpose
2. **Dependency Direction**: Libraries can only depend on other libraries, never on apps
3. **Minimal API Surface**: Expose only what consumers actually need
4. **Framework Agnostic**: Core business logic should not depend on UI frameworks
5. **Comprehensive Testing**: All libraries must have extensive unit and integration tests
6. **Documentation**: Include README, API docs, and usage examples
7. **Semantic Versioning**: Use proper versioning for breaking changes
8. **Security First**: 
   - Validate all inputs and sanitize outputs
   - Follow secure coding practices (e.g., no eval, no innerHTML)
   - Address common vulnerabilities (XSS, CSRF) in relevant libraries
   - Document security assumptions for library consumers


### Development Tools and Scripts

All development tools, scripts, and utilities must be placed in the `tools/` directory, following these guidelines:

1. **Script Location**:
   - All scripts must be located in the `tools/dev-scripts/` directory
   - Never place scripts in root, `.github/`, or other non-standard locations
   - Configuration files for tools should go in designated configuration directories

2. **Naming Convention**:
   - CLI scripts should use the prefix `cmd-` (e.g., `cmd-generate-calver.js`)
   - Scripts primarily used in CI/CD pipelines must use the prefix `cmd-ci-` (e.g., `cmd-ci-update-semantic-release.sh`)
   - Use kebab-case for script names
   - Use appropriate file extensions (.sh for shell scripts, .js for JavaScript, etc.)

3. **Script Standards**:
   - Make scripts executable (`chmod +x`)
   - Include proper shebang line (`#!/bin/bash`, `#!/usr/bin/env node`, etc.)
   - Add comprehensive header documentation
   - Include help/usage instructions for all scripts
   - Use relative paths, never hard-coded absolute paths
   - Always implement proper error handling

4. **Script Architecture**:
   - Scripts should be able to run from any directory (use project root detection)
   - Follow the principle of doing one thing well
   - Break complex scripts into modular components
   - Provide clear logging and status output

### General Principles

1. **Follow NX Workspace Conventions**:
   - Use NX commands for generating, building, and testing components
   - Leverage NX dependency graph for efficient builds
   - Utilize NX affected commands for CI optimization

2. **Respect Architectural Boundaries**:
   - Maintain clear separation between apps and libs
   - Enforce one-way dependency flow (apps → libs, never libs → apps)
   - Never create circular dependencies between libraries

3. **Share Code Through Libraries**:
   - Don't duplicate functionality across apps
   - Extract reusable code into appropriate library categories
   - Follow the code sharing strategy for all shared functionality

4. **Design for Performance**:
   - Optimize bundle sizes through code splitting and lazy loading
   - Implement proper memoization for expensive operations
   - Design components with rendering performance in mind

5. **Security by Design**:
   - Implement authorization checks at appropriate levels
   - Follow OWASP guidelines for secure coding
   - Validate all user inputs and sanitize outputs

6. **Code Quality Standards**:
   - Write clear, maintainable code with minimal comments
   - Use TypeScript with strict mode enabled
   - Follow ESLint and Prettier configurations

7. **Comprehensive Testing**:
   - Implement unit tests for all business logic
   - Add integration tests for API endpoints and features
   - Maintain high test coverage for libraries

8. **Careful Library Design**:
   - Design libraries with clear responsibilities
   - Minimize API surface to reduce breaking changes
   - Provide comprehensive type definitions

## Environment Setup

1. **Docker-based Development**:
   - Use `docker-compose` for local development
   - All required services are defined in docker-compose files
   - Configuration is managed via files in `config/env/`

2. **Environment Configuration Strategy**:
   - **Version-controlled templates** (`env.*`):
    - `env.dev`: Template for local development (localhost)
    - `env.host`: Template for production hosting machine
    - `env.qa`: Template for QA environment (reserved for future use)
   - **Local configuration files** (`.env.*`, not version-controlled, always with a dot prefix):
    - `.env.dev`: Your actual development configuration
    - `.env.host`: Your actual production configuration
    - `.env.qa`: Your actual QA configuration (when needed)
   - **Always use the dot-prefixed `.env.*` files for all runtime and script loading.**
   - Configuration files are referenced in docker-compose files and all scripts must reflect this naming convention.

3. **Environment Setup Process**:
   - Create local configuration files from templates:
     ```bash
    cp config/env/env.dev config/env/.env.dev
    cp config/env/env.host config/env/.env.host
    cp config/env/env.qa config/env/.env.qa
     ```
   - Update local files with actual credentials and settings
   - Keep template files updated with structure changes only
   - Never commit sensitive information to template files

4. **Environment Purpose**:
   - `.env.dev`: Always configured for localhost development
   - `.env.host`: Always configured for production hosting machine
   - `.env.qa`: Reserved for future QA environment

5. **Package Management**:
   - Always use `pnpm` for package management
   - Never use npm or yarn
   - Run `pnpm install` after pulling changes that modify dependencies

## Integration Test Strategy

Follow these rules to maintain effective integration testing across services, databases, applications and libraries:

1. **Test Environment Setup**:
   - Use `docker-compose` to start all dependent services for the tests.
   - Ensure databases are migrated and seeded before running any suite.

2. **Test Location**:
   - Place integration tests under `tests/integration/` inside each project.
   - Keep tests close to the project they verify (apps or libs).

3. **Execution**:
   - Define an `integration` target in `project.json` to run these tests with Jest.
   - Execute all suites with `pnpm nx run-many --target=integration --all`.

4. **Cross-Service Scenarios**:
   - Cover interactions between APIs, workers and databases without mocking.
   - Validate that shared libraries integrate correctly when consumed by apps.

5. **Continuous Integration**:
   - Run integration tests on every pull request using Nx affected commands.
   - Fail the pipeline when any integration test does not pass.

6. **Coverage Requirement**:
   - Every service, application, database and library must contain at least one integration test.

## Python Development Rules

- Use `uv` for all Python dependency management, installation, execution, and script running—no exceptions unless explicitly documented in this repository.
- Do NOT use `pip`, `poetry`, `conda`, or any other Python package manager or runner. Any PR introducing non-`uv` Python commands will be rejected.
- All documentation, scripts, and developer instructions MUST use `uv` commands (e.g., `uv pip install -e .`, `uv run ...`).
- If you add a new Python service or script, ensure the README and all developer instructions use `uv` exclusively.

## Integration Test Strategy

Follow these rules to maintain effective integration testing across services,
databases, applications and libraries:

1. **Test Environment Setup**:
   - Use `docker-compose` to start all dependent services for the tests.
   - Ensure databases are migrated and seeded before running any suite.

2. **Test Location**:
   - Place integration tests under `tests/integration/` inside each project.
   - Keep tests close to the project they verify (apps or libs).

3. **Execution**:
   - Define an `integration` target in `project.json` to run these tests with Jest.
   - Execute all suites with `pnpm nx run-many --target=integration --all`.

4. **Cross-Service Scenarios**:
   - Cover interactions between APIs, workers and databases without mocking.
   - Validate that shared libraries integrate correctly when consumed by apps.

5. **Continuous Integration**:
   - Run integration tests on every pull request using Nx affected commands.
   - Fail the pipeline when any integration test does not pass.
6. **Coverage Requirement**:
   - Every service, application, database and library must contain at least one integration test.

### Security and Compliance

Implement these security and compliance measures across all components:

1. **Authentication and Authorization**:
   - JWT-based authentication with short-lived access tokens
   - Secure refresh token implementation with rotation
   - Role-based access control with principle of least privilege
   - Permission verification at API and service boundaries
   - Proper token storage in HttpOnly cookies, never in localStorage

2. **Data Protection**:
   - Implement field-level encryption for sensitive data
   - Apply proper data sanitization for all user inputs
   - Validate request parameters with strong typing
   - Store passwords using strong cryptographic hashing (Argon2)
   - Implement proper data retention and deletion policies

3. **GDPR Compliance**:
   - Design schemas with data minimization principles
   - Implement user consent tracking and management
   - Provide data export functionality for subject access requests
   - Support right-to-be-forgotten with complete data removal
   - Maintain audit logs for all data access and modification

4. **SOC2 Controls**:
   - Implement comprehensive logging for all security events
   - Enforce strict access control to production systems
   - Maintain separation of duties through role limitations
   - Conduct regular security testing and vulnerability scanning
   - Document and enforce change management procedures

5. **API Security**:
   - Implement rate limiting to prevent abuse
   - Use TLS 1.2+ for all communications
   - Apply proper CORS configuration
   - Implement CSRF protection for browser-based clients
   - Use parameterized queries to prevent injection attacks

### Performance Optimization

Follow these principles to ensure optimal performance across the platform:

1. **Frontend Performance**:
   - Implement code splitting at route level using React.lazy and Suspense
   - Use React.memo for expensive render operations
   - Apply virtualization for long lists (react-window or react-virtualized)
   - Optimize bundle size through proper tree-shaking configuration
   - Use service worker for caching static assets in production

2. **Backend Performance**:
   - Implement appropriate database indexing based on query patterns
   - Use query optimization techniques for complex database operations
   - Apply in-memory caching for frequently accessed data
   - Implement connection pooling for database connections
   - Use proper pagination for list endpoints (cursor-based where appropriate)

3. **API Communication**:
   - Implement data compression for API responses (gzip/brotli)
   - Use HTTP/2 for multiplexed connections
   - Apply proper cache headers for cacheable resources
   - Implement batching for related API calls
   - Use GraphQL for flexible data requirements when appropriate

4. **Docker Optimization**:
   - Use multi-stage builds to reduce image size
   - Implement layer caching strategy for faster builds
   - Set appropriate container resource limits
   - Order Dockerfile commands by change frequency
   - Use production-optimized base images

5. **Monitoring and Profiling**:
   - Implement performance metrics collection
   - Use profiling tools to identify bottlenecks
   - Set up performance alerting for degradation detection
   - Benchmark critical operations and track over time
   - Document performance expectations for key user flows


## Technical Architecture Overview

ChatSuite follows a domain-driven microservices architecture using a structured monorepo approach:

- **Modular Architecture**: Service boundaries follow domain contexts, with clear separation between APIs and clients
- **Library-First Development**: Common functionality is extracted into specialized, shareable libraries
- **Dependency Flow Control**: One-way dependencies from apps to libs with no circular references
- **Type-Safe Contracts**: TypeScript interfaces define all API boundaries and data models
- **Containerization**: All services run in Docker containers for consistent development and deployment
- **Secure by Default**: Authentication, authorization, and data protection built into core architecture

## Repository Structure

The ChatSuite monorepo follows a standardized structure with clear separation of concerns:

```
chatsuite/
├── apps/                    # Application implementations
│   ├── api-customer-service/   # NestJS API service
│   ├── client-app/             # React client application
├── libs/                    # Shared libraries and modules
│   ├── core/                 # Core business logic and services
│   ├── data/                 # Data access and models
│   ├── features/             # Complete shareable features
│   ├── ui/                   # Reusable UI components
│   └── utils/                # Utility functions and helpers
├── tools/                   # Build and development tools
│   └── dev-scripts/         # Development utility scripts
├── config/                  # Environment and configuration files
│   ├── env/                 # Environment-specific templates
│   ├── librechat/           # LibreChat configuration
│   ├── mindsdb/             # MindsDB configuration
│   ├── nginx/               # Nginx configurations
│   ├── mcp-email-server/    # MCP Email Server configuration
│   ├── mcphub/              # MCPHub configuration
│   ├── nocodb/              # NocoDB configuration
│   ├── pnpm/                # pnpm settings
│   └── postgres/            # PostgreSQL configuration
├── schema/                  # Database schemas and migrations
└── data/                    # Local volumes for Docker services
```

## Change Management Process

1. Propose changes to AGENTS.md via pull request.
2. All changes must be reviewed by at least one maintainer or lead developer.
3. Document all breaking changes and update service READMEs as needed.
4. Keep this file up to date with all architectural, security, and process changes.
5. For any new service, update this file to reflect new best practices or requirements.

## Glossary

- **Service**: API or backend component, typically exposed via HTTP/HTTPS.
- **Feature**: Reusable business logic, often spanning multiple components.
- **Library**: Shared code, categorized as core, features, ui, utils, or data.
- **Unified Route**: Endpoint exposed via nginx proxy on port 10443.
- **repomix-output.xml**: Machine-readable, up-to-date summary of the codebase for automation and analysis.

# Final Notes

- This document is the authoritative reference for all service development in ChatSuite. If you find any gaps, propose an update via pull request.
- Always follow the copilot-instructions.md for communication, reasoning, and code style.
- For automation and code navigation, use repomix-output.xml as the codebase map.
