# ChatSuite

**The Complete AI Collaboration Platform**

Connect LibreChat, n8n automations, MindsDB, NocoDB, and MCPHub in a single platform for efficient collaboration, seamless productivity, and dynamic MCP server orchestration.

Built on a modern full-stack monorepo with Nx, NestJS, and React for enterprise-grade development.

---

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Nx](https://img.shields.io/badge/Built%20with-Nx-lightgrey.svg)](https://nx.dev/)

## What is ChatSuite?

ChatSuite is a comprehensive AI collaboration platform that unifies multiple powerful tools into one cohesive workspace:

**Core AI Productivity Tools:**
- **LibreChat** - Advanced AI chat interface with multi-model support 
- **n8n** - Visual workflow automation and integration platform  
- **MindsDB** - AI-powered database with ML capabilities
- **NocoDB** - Smart spreadsheet interface for databases
- **MCPHub** - Model Context Protocol server orchestration
- **MCP Email** - Email integration via Model Context Protocol

**Development Foundation:**
- **React Frontend** - Starter client application demonstrating modern UI patterns
- **NestJS API** - Example backend service showcasing scalable architecture

## Key Features

### Seamless AI Tool Integration
- **Unified Workspace** - All AI productivity tools accessible from one platform
- **Centralized Configuration** - Single point of management for all services
- **Cross-Tool Data Flow** - Seamless information sharing between LibreChat, n8n, MindsDB, and NocoDB

### Intelligent Automation & Orchestration
- **Visual Workflows** - Connect AI models to real-world data with n8n automations
- **Smart Email Processing** - MCP Email integration for intelligent email handling
- **Dynamic MCP Orchestration** - MCPHub enables seamless service communication
- **AI-Powered Analytics** - MindsDB brings machine learning to your databases

### Maximum Productivity
- **One-Click Deployment** - Complete platform launches with single command
- **Real-time Collaboration** - Share insights across LibreChat, workflows, and databases
- **Automated Task Management** - Reduce manual work through intelligent automation

### Enterprise Ready
- **Docker-Based Architecture** - Consistent deployment across environments
- **Comprehensive Monitoring** - Built-in logging and health checks
- **Scalable Foundation** - Modern TypeScript/React/NestJS stack for custom development

## Quick Start

Get ChatSuite running in under 5 minutes:

```bash
# Clone the repository
git clone https://github.com/hubertusgbecker/chatsuite.git
cd chatsuite

# Install dependencies
pnpm install

# Setup environment configuration
cp .env.example .env

# Copy environment files from templates (all environments) and add OPENAI_API_KEY and/or other keys as needed
cp config/env/env.dev config/env/.env.dev
cp config/env/env.qa config/env/.env.qa
cp config/env/env.host config/env/.env.host

# Set your preferred environment (dev/qa/host)
# The .env file controls which environment is active
pnpm env:set:dev  # or pnpm env:set:qa or pnpm env:set:host

# Generate SSL certificates for HTTPS (requires mkcert)
mkcert -install
mkcert -key-file config/certificates/localhost-key.pem -cert-file config/certificates/localhost-crt.pem localhost 127.0.0.1 ::1

# Launch the entire platform
pnpm start
```

All services will start automatically with proper dependencies.

### Production Deployment

For production or fresh installations, use the two-step deployment process:

```bash
# Step 1: Rebuild the entire system
pnpm rebuild

# Step 2: Verify all services are working
pnpm test

# Or run both commands sequentially
pnpm rebuild && pnpm test
```

**What each command does:**

- **`pnpm rebuild`**: 
  - Stops and cleans existing containers
  - Pulls latest service images
  - Starts all services in correct order
  - Waits for core services initialization

- **`pnpm test`**: 
  - Tests all service endpoints
  - Verifies MCP server integration
  - Displays comprehensive system status
  - Confirms system is ready for use



## Access Your Platform

Once running, access these powerful productivity tools through your browser:

| Service | Purpose | Direct Access | Primary Focus |
|---------|---------|---------------|---------------|
| **LibreChat** | **Multi-Model AI Chat** | [localhost:3080](http://localhost:3080) | **Core AI Interface** |
| **n8n** | **Visual Workflow Automation** | [localhost:5678](http://localhost:5678) | **Productivity Automation** |
| **NocoDB** | **Smart Database Interface** | [localhost:8080](http://localhost:8080) | **Data Management** |
| **MindsDB** | **AI-Powered Database** | [localhost:47334](http://localhost:47334) | **ML Analytics** |
| **MCPHub** | **Protocol Orchestration** | [localhost:3000](http://localhost:3000) | **Service Integration** |
| **Email MCP** | **Email Intelligence** | [localhost:9557](http://localhost:9557) | **Smart Email Processing** |
| Client App | Development Starter | [localhost:4200](http://localhost:4200) | Custom Development |
| API Service | Example Backend | [localhost:3333](http://localhost:3333) | API Development |
| PgAdmin | Database Admin | [localhost:8081](http://localhost:8081) | Database Management |

### Nginx Reverse Proxy
- Port: 10443 (HTTPS ready when certificates configured)
- Purpose: Unified access point for all services
- Security: SSL termination and request routing

## Platform Commands

Master ChatSuite with these essential commands:

### Core Operations
```bash
pnpm start              # Launch all services  
pnpm stop               # Graceful shutdown
pnpm rebuild            # Complete system rebuild
pnpm test               # Comprehensive health checks
```

### Health & Monitoring
```bash
pnpm check              # Verify dependencies
pnpm env:show           # Display current environment
pnpm env:verify         # Security configuration check
```

### Environment Management
```bash
pnpm start:workspace:dev    # Development environment
pnpm start:workspace:qa     # QA environment  
pnpm start:workspace:host   # Production environment
```

## Architecture Overview

ChatSuite is built on modern, enterprise-grade architecture:

### Technology Stack
- Frontend: React 18 + TypeScript + Tailwind CSS
- Backend: NestJS + Node.js + TypeScript
- Database: PostgreSQL + MongoDB (LibreChat)
- Container: Docker + Docker Compose
- Build System: Nx Monorepo + pnpm
- Automation: n8n workflows + GitHub Actions

### Service Architecture
```
ChatSuite AI Productivity Platform
├── Nginx Proxy (SSL Termination & Routing)
├── LibreChat (Multi-Model AI Chat)
├── n8n (Visual Workflow Automation)
├── MindsDB (AI-Powered Database)
├── NocoDB (Smart Database Interface)
├── MCPHub (Protocol Orchestration Hub)
├── MCP Email (Intelligent Email Integration)
├── PostgreSQL (Primary Database)
├── React Client (Development Starter App)
└── NestJS API (Development Example Service)
```

### Security & Compliance
- MIT License for maximum flexibility
- Environment-based configuration
- Containerized isolation
- Centralized logging and monitoring

Developer Guide: All development standards and guidelines are defined in [`AGENTS.md`](./AGENTS.md)

## Platform Capabilities

### Integrated AI Productivity Suite
- [x] **Multi-Model AI Chat** - LibreChat with OpenAI, Claude, Gemini, and more
- [x] **Visual Workflow Automation** - n8n with 200+ integrations for seamless productivity
- [x] **AI-Powered Database Intelligence** - MindsDB with ML predictions and insights
- [x] **Smart Data Management** - NocoDB for intuitive database operations
- [x] **Dynamic Protocol Orchestration** - MCPHub for seamless service communication
- [x] **Intelligent Email Processing** - MCP Email server for smart email automation

### Seamless Integration & Collaboration
- [x] **Unified Data Flow** - Connect insights from LibreChat directly to n8n workflows
- [x] **Cross-Platform Analytics** - Share data between NocoDB, MindsDB, and automation tools
- [x] **Real-time Orchestration** - MCPHub enables dynamic service coordination
- [x] **Centralized Management** - Single platform for all AI productivity tools

### Development Foundation
- [x] **Nx Monorepo** - Scalable workspace with dependency graphs for custom development
- [x] **React Starter App** - Modern client application template with best practices
- [x] **NestJS Example API** - Backend service template demonstrating scalable architecture
- [x] **Docker Compose** - Complete containerized development environment
- [x] **TypeScript** - Type-safe development across the entire stack
- [x] **Hot Reload** - Instant feedback during development

### Production Ready
- [x] **Environment Management** - Dev, QA, and production configurations
- [x] **Health Monitoring** - Comprehensive service health checks
- [x] **Security Scanning** - Automated dependency vulnerability checks
- [x] **Performance Optimization** - Built-in caching and optimization
- [x] **Scalable Architecture** - Microservices with clear boundaries
- [ ] **Kubernetes Deployment** - Cloud-native orchestration (planned)

## Development Setup

### Prerequisites & Setup

Find the perfect place to start by following these steps:

1. **Install NVM (Node Version Manager):**
   - [NVM Installation Guide](https://github.com/nvm-sh/nvm#installing-and-updating)
   - In the project root, run:
     ```bash
     nvm use
     ```
     If this fails, check the required Node version in `.nvmrc` and run:
     ```bash
     nvm install $(cat .nvmrc)
     nvm use
     ```

2. **Install Docker:**
   - [Docker Installation Guide](https://docs.docker.com/engine/install/)
   - Verify installation:
     ```bash
     docker --version && docker-compose --version
     ```

3. **Install pnpm:**
   - This repo uses pnpm for efficient dependency management.
     ```bash
     npm install -g pnpm
     ```

4. **Generate .env files:**
   - Copy all files in `config/env/` and prefix each with a dot (`.`) to make them hidden and git-ignored:
     ```bash
     cp config/env/env.dev config/env/.env.dev
     cp config/env/env.host config/env/.env.host
     cp config/env/env.qa config/env/.env.qa
     ```

5. **SSL Setup (Recommended for HTTPS):**
   - Install [mkcert](https://github.com/FiloSottile/mkcert) (easiest via Homebrew):
     ```bash
     brew install mkcert
     mkcert -install
     cd config/certificates
     mkcert -key-file localhost-key.pem -cert-file localhost-crt.pem localhost host.minikube.internal 0.0.0.0 127.0.0.1 ::1
     ```

6. **Install dependencies:**
   ```bash
   pnpm install
   ```

7. **Start the platform:**
   ```bash
   pnpm start
   ```
   Wait for all Docker containers to be up, then navigate to [https://localhost:3080](https://localhost:3080) for LibreChat or [http://localhost:4200](http://localhost:4200) for the main dashboard.

You're ready to go! The platform will automatically start all services with proper dependencies.

## Development Workflow

### Core Applications

ChatSuite's main value comes from the seamless integration of AI productivity tools. The platform also includes starter applications for custom development:

**AI Productivity Suite:**
- LibreChat, n8n, MindsDB, NocoDB, MCPHub, and MCP Email work together to create a unified AI collaboration environment

**Development Starters:**
- `client-app` - React SPA template demonstrating modern UI patterns and integration approaches
- `api-customer-service` - NestJS REST API example showing scalable backend architecture

### Development Commands

```bash
# Start full platform (recommended)
pnpm start

# Development environments
pnpm start:workspace:dev    # Point to DEV backend services
pnpm start:workspace:qa     # Point to QA backend services  
pnpm start:workspace:host   # Point to production services

# Client-only development
pnpm start:client:dev       # Client app with DEV API
pnpm start:client:qa        # Client app with QA API

# Maintenance
pnpm stop                   # Graceful shutdown
pnpm stop:prune            # Complete cleanup (removes containers & images)
```

### Testing & Quality

```bash
# Run all tests
pnpm nx:test

# Run tests for changed code only  
pnpm nx:test:affected

# Build for production
pnpm nx:build

# Development without Docker (not recommended)
pnpm nx:start
```

### Code Generation

```bash
# Generate new library
nx g @nx/react:lib my-library

# Generate new component  
nx g @nx/react:component my-component --project=client-app

# View dependency graph
nx graph
```

Pro Tip: All libraries are importable as `@chatsuite/library-name` for clean imports.

## Contributing & Support

### Documentation
- [AGENTS.md](./AGENTS.md) - Complete development guidelines and architecture
- [Environment Docs](./docs/) - Configuration and deployment guides
- [Nx Documentation](https://nx.dev) - Monorepo tooling and best practices

### Issues & Support
- Report bugs and request features via GitHub Issues
- Follow coding standards defined in `AGENTS.md`
- All contributions welcome under MIT License

### License
This project is licensed under the [MIT License](./LICENSE) - use it freely for personal and commercial projects.

---

## Configuration Documentation

All configuration and environment documentation for ChatSuite—including setup, environment management, and service-specific configuration—is centrally maintained in [`/config/README.md`](./config/README.md). This file provides a comprehensive overview and links to detailed documentation for each integrated service and environment. For any configuration or environment-related questions, always refer to `/config/README.md` first.



Built with ChatSuite - The Complete AI Collaboration Platform

[Star on GitHub](https://github.com/hubertusgbecker/chatsuite) • [Documentation](./AGENTS.md) • [Report Issues](https://github.com/hubertusgbecker/chatsuite/issues)
