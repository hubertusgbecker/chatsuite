# ChatSuite Configuration Directory

This directory contains all configuration files, scripts, and documentation for the various services and components in the ChatSuite monorepo.

## Overview

ChatSuite is a comprehensive platform that integrates multiple AI, database, and automation services. Each service has its own configuration directory with detailed setup instructions and documentation.

## Quick Start Guide

### 1. Prerequisites

- Docker and Docker Compose installed
- Git repository cloned
- Basic understanding of Docker containers

### 2. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd chatsuite

# Set your environment (dev is default)
echo "NX_APP_ENV=dev" > .env

# Edit the appropriate environment file with your API keys
nano ./config/env/.env.dev    # For development
# nano ./config/env/.env.qa   # For QA environment
# nano ./config/env/.env.host # For production environment
```

### 3. Essential API Keys

Add these API keys to the current environment file (check `.env` to see which one):

```bash
# Edit the active environment file (default: ./config/env/.env.dev)
# Required for AI features
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional for additional AI models
GOOGLE_API_KEY=your_google_key_here
```

### 4. Start All Services

```bash
# Start the entire ChatSuite platform
docker-compose up -d

# Check status of all services
docker-compose ps
```

### 5. Access Services

Once all services are running:

- **Main Interface**: https://localhost:10443 (accept certificate warning)
- **LibreChat (AI Chat)**: http://localhost:3080
- **n8n (Automation)**: http://localhost:5678
- **NocoDB (Database GUI)**: http://localhost:8080
- **MindsDB (AI Database)**: http://localhost:47334
- **MCPHub (MCP Management)**: http://localhost:3000

## Service Directory Structure

```
config/
├── certificates/           # SSL certificates for HTTPS
├── env/                   # Environment configuration files
├── librechat/             # AI chat platform configuration
├── mcp-email-server/      # Email server MCP integration
├── mcphub/                # MCP hub management
├── mindsdb/               # AI database configuration
├── n8n/                   # Workflow automation
├── nginx/                 # Reverse proxy configuration
├── nocodb/                # Database GUI configuration
├── pnpm/                  # Package manager optimization
├── postgres/              # PostgreSQL database setup
└── registry/              # Docker registry (optional)
```

## Core Services

### 🤖 AI & Chat Services

#### LibreChat

- **Purpose**: Web-based AI chat interface
- **Port**: 3080
- **Features**: Multiple AI models (GPT, Claude), MCP integration
- **Setup**: [📖 LibreChat README](./librechat/README.md)

#### MCPHub

- **Purpose**: Model Context Protocol server management
- **Port**: 3000
- **Features**: Unified MCP server hub, web interface
- **Setup**: [📖 MCPHub README](./mcphub/README.md)

#### MCP Email Server

- **Purpose**: Email functionality via MCP protocol
- **Port**: 9557
- **Features**: IMAP/SMTP integration, SSE endpoints
- **Setup**: [📖 MCP Email Server README](./mcp-email-server/README.md)

### 🗄️ Database Services

#### PostgreSQL

- **Purpose**: Primary database for all services
- **Port**: 5432 (internal)
- **Features**: Multi-schema support, automatic initialization
- **Setup**: [📖 PostgreSQL README](./postgres/README.md)

#### NocoDB

- **Purpose**: Database GUI and API generator
- **Port**: 8080
- **Features**: Spreadsheet interface, auto-generated APIs
- **Setup**: [📖 NocoDB README](./nocodb/README.md)

#### MindsDB

- **Purpose**: AI-powered database with ML capabilities
- **Port**: 47334
- **Features**: SQL-based machine learning, predictions
- **Setup**: [📖 MindsDB README](./mindsdb/README.md)

### ⚙️ Automation & Infrastructure

#### n8n

- **Purpose**: Visual workflow automation
- **Port**: 5678
- **Features**: 500+ integrations, visual workflow builder
- **Setup**: [📖 n8n README](./n8n/README.md)

#### Nginx

- **Purpose**: Reverse proxy and SSL termination
- **Port**: 10443 (HTTPS)
- **Features**: Unified HTTPS entry point, service routing
- **Setup**: [📖 Nginx README](./nginx/README.md)

## Configuration Categories

### 🔐 Security & SSL

- **Certificates**: SSL certificates for HTTPS connections
- **Authentication**: Service authentication and API keys
- **Environment**: Secure configuration management
- **Documentation**: [📖 Certificates README](./certificates/README.md)

### 🌍 Environment Management

- **Development**: Local development settings
- **QA**: Testing environment configuration
- **Production**: Production-ready settings
- **Documentation**: [📖 Environment README](./env/README.md)

### 🐳 Docker & Registry

- **Registry**: Private Docker image registry
- **PNPM Store**: Package management optimization
- **Documentation**: [📖 Registry README](./registry/README.md) | [📖 PNPM README](./pnpm/README.md)

## Common Setup Tasks

### Adding AI API Keys

1. Check which environment is active: `cat .env` (should show `NX_APP_ENV=dev`)
2. Edit the corresponding environment file: `nano ./config/env/.env.dev`
3. Add your API keys:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
4. Restart LibreChat: `docker-compose restart librechat`

### Switching Environments

```bash
# Switch to QA environment
echo "NX_APP_ENV=qa" > .env
# Edit QA-specific settings
nano ./config/env/.env.qa

# Switch to production environment
echo "NX_APP_ENV=host" > .env
# Edit production-specific settings
nano ./config/env/.env.host

# Switch back to development
echo "NX_APP_ENV=dev" > .env
```

### Configuring Email Integration

1. Edit `./config/mcp-email-server/config.toml`
2. Add your email accounts
3. Restart email server: `docker-compose restart mcp-email-server`

### Setting Up Workflows

1. Access n8n at http://localhost:5678
2. Create your admin account
3. Build automated workflows
4. Integrate with other ChatSuite services

### Database Management

1. Access NocoDB at http://localhost:8080
2. Connect to the PostgreSQL database
3. Create views, forms, and APIs
4. Use MindsDB for AI-powered analytics

## Service Dependencies

### Startup Order

The services have dependencies that Docker Compose handles automatically:

```
1. postgres          # Database (required by most services)
2. mongodb           # Required by LibreChat
3. mcp-email-server  # Required by MCPHub
4. mcphub           # Required by LibreChat for MCP
5. vectordb         # Required by LibreChat for embeddings
6. meilisearch      # Required by LibreChat for search
7. librechat        # AI chat interface
8. n8n              # Workflow automation
9. nocodb           # Database GUI
10. mindsdb         # AI database
11. nginx           # Reverse proxy (last)
```

### Network Architecture

Services communicate through Docker networks:

- **gateway**: Main network for service communication
- **database_pg**: Dedicated network for PostgreSQL access

## Troubleshooting

### Services Not Starting

```bash
# Check all service status
docker-compose ps

# View logs for specific service
docker-compose logs <service-name>

# Restart specific service
docker-compose restart <service-name>
```

### Common Issues

1. **Port conflicts**

   - Check if ports are already in use: `netstat -tulpn | grep <port>`
   - Stop conflicting services or change ports in docker-compose.yaml

2. **SSL certificate warnings**

   - Expected with self-signed certificates
   - Click "Advanced" → "Proceed to localhost" in browser

3. **Database connection errors**

   - Ensure PostgreSQL is running: `docker-compose ps postgres`
   - Check database logs: `docker-compose logs postgres`

4. **API key errors**
   - Verify keys are correctly set in environment files
   - Restart services after adding keys

### Getting Help

- Check individual service README files in each directory
- Review Docker logs for specific error messages
- Ensure all required environment variables are set
- Verify network connectivity between services

## Development vs Production

### Development Setup (Default)

- Self-signed SSL certificates
- Default passwords and secrets
- Verbose logging enabled
- All ports exposed for debugging
- Hot reload and development features

### Production Considerations

1. **Security**: Replace all default passwords and secrets
2. **SSL**: Use proper SSL certificates from a trusted CA
3. **Monitoring**: Set up proper logging and monitoring
4. **Backup**: Implement regular backup strategies
5. **Updates**: Plan for regular security updates
6. **Scaling**: Consider load balancing and high availability

## Performance Optimization

### Resource Usage

- **Memory**: 8GB+ recommended for full stack
- **Storage**: 20GB+ for data persistence
- **CPU**: 4+ cores for optimal performance

### Optimization Tips

1. **PNPM Store**: Use shared package cache for faster builds
2. **Database**: Regular maintenance and optimization
3. **Docker**: Prune unused images and volumes regularly
4. **Monitoring**: Use resource monitoring tools

## Backup Strategy

### Important Data

- Database: `./data/postgres/`
- LibreChat: `./data/librechat/`
- n8n workflows: `./data/n8n/`
- NocoDB projects: `./data/nocodb/`
- Configuration: `./config/`

### Backup Commands

```bash
# Backup all configuration
tar -czf config-backup-$(date +%Y%m%d).tar.gz ./config/

# Backup all data
tar -czf data-backup-$(date +%Y%m%d).tar.gz ./data/

# Database backup
docker exec chatsuite_postgres pg_dumpall -U admin > full-db-backup.sql
```

## Contributing

### Adding New Services

1. Create configuration directory under `./config/`
2. Add service to `docker-compose.yaml`
3. Create comprehensive README.md following the template
4. Update this main README with service information
5. Test integration with existing services

### Documentation Standards

- Use the MCP Email Server README as a template
- Include overview, setup guide, features, and troubleshooting
- Provide clear examples and commands
- Write in simple English for novice users

## Repository Information

- **Architecture**: Microservices with Docker Compose
- **Database**: PostgreSQL with multi-schema support
- **Security**: SSL/TLS encryption, role-based access
- **Monitoring**: Container logs and health checks
- **Backup**: Volume-based persistence with backup strategies
