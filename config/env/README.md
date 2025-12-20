# Environment Configuration

This directory contains environment configuration files for different deployment environments in the ChatSuite monorepo.

## Overview

ChatSuite supports **three environments** with different purposes:

- **dev**: local development
- **qa**: integration and testing
- **host**: production-like, host deployment

## Configuration

Each environment has its own config file under `./config/env/`:

- `config/env/.env.dev` - Development environment configuration
- `config/env/.env.qa` - QA/Testing environment configuration
- `config/env/.env.host` - Host/Production environment configuration

The active environment is controlled by the root `.env` file in the ChatSuite folder:
`chatsuite/.env`

This value determines which config is used:

```bash
NX_APP_ENV=dev  # Uses config/env/.env.dev (default)
# NX_APP_ENV=qa    # Uses config/env/.env.qa
# NX_APP_ENV=host  # Uses config/env/.env.host
```

If `NX_APP_ENV` is not set, `dev` is the fallback.

## Usage

### Environment Switching

Change environment by editing `NX_APP_ENV` in the root `.env` file or using helper commands:

```bash
# Using helper commands (if available)
pnpm env:set:dev
pnpm env:set:qa
pnpm env:set:host
pnpm env:show

# Manual editing
echo "NX_APP_ENV=qa" > .env    # Switch to QA
echo "NX_APP_ENV=host" > .env  # Switch to Host
echo "NX_APP_ENV=dev" > .env   # Switch to Dev (default)
```

### Starting Services

```bash
# Uses environment from root .env file
docker-compose up -d
pnpm start

# Override environment for specific commands (if needed)
pnpm start:workspace:qa
```

### NX Commands

NX commands (pnpm nx:build, pnpm nx:test, etc.) automatically load the environment from the root .env file.

## Benefits

- One root .env as single source of truth
- Easy switching between dev, qa, and host
- Explicit overrides remain available
- Docker and NX both resolve environment consistently

## Configuration Categories

### Database Configuration

```bash
# PostgreSQL Settings
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=chatsuite
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin

# Database URLs for different services
DATABASE_URL=postgresql://admin:admin@postgres:5432/chatsuite
N8N_DB_POSTGRESDB_HOST=postgres
N8N_DB_POSTGRESDB_PORT=5432
N8N_DB_POSTGRESDB_DATABASE=chatsuite
N8N_DB_POSTGRESDB_USER=admin
N8N_DB_POSTGRESDB_PASSWORD=admin
N8N_DB_POSTGRESDB_SCHEMA=n8n
```

### AI Service API Keys

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ORGANIZATION=your_org_id_here

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google AI Configuration
GOOGLE_API_KEY=your_google_api_key_here

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
```

### LibreChat Configuration

```bash
# LibreChat Settings
APP_TITLE=ChatSuite LibreChat
HOST=0.0.0.0
PORT=3080
MONGO_URI=mongodb://mongodb:27017/LibreChat
DOMAIN_CLIENT=http://localhost:3080
DOMAIN_SERVER=http://localhost:3080

# Session and Security
SESSION_EXPIRY=1000 * 60 * 15  # 15 minutes
REFRESH_TOKEN_EXPIRY=1000 * 60 * 60 * 24 * 7  # 7 days
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# MCP Integration
MCP_DISABLE_OAUTH=true
MCP_ALLOW_ANONYMOUS_TOOLS=true
```

### n8n Configuration

```bash
# n8n Database
N8N_DB_TYPE=postgresdb

# n8n Security
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
WEBHOOK_URL=https://localhost:10443/n8n/
N8N_EDITOR_BASE_URL=https://localhost:10443/n8n/

# n8n SSL
N8N_SSL_KEY=/certs/localhost-key.pem
N8N_SSL_CERT=/certs/localhost-crt.pem
```

### NocoDB Configuration

```bash
# NocoDB Database Connection
NC_DB=pg://postgres:5432?u=admin&p=admin&d=chatsuite

# NocoDB Settings
NC_PUBLIC_URL=https://localhost:10443/nocodb
NC_DISABLE_TELE=true
NC_ADMIN_EMAIL=admin@chatsuite.com
NC_ADMIN_PASSWORD=admin
```

### Email Configuration

```bash
# SMTP Settings for email sending
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
SMTP_FROM=noreply@chatsuite.com

# Email Security
SMTP_SECURE=false  # true for 465, false for other ports
SMTP_TLS=true      # enable TLS
```

### MindsDB Configuration

```bash
# MindsDB Settings
MINDSDB_STORAGE_PATH=/root/mdb_storage
MINDSDB_CONFIG_PATH=/root/mindsdb_config.json
```

### Search and Vector Database

```bash
# Meilisearch Configuration
MEILI_HOST=http://meilisearch:7700
MEILI_MASTER_KEY=your_meilisearch_master_key
MEILI_NO_ANALYTICS=true

# Vector Database
VECTOR_DB_HOST=vectordb
VECTOR_DB_PORT=5432
VECTOR_DB_USER=admin
VECTOR_DB_PASSWORD=admin
VECTOR_DB_NAME=chatsuite
```

## Environment-Specific Settings

### Development (.env.dev)

- **Purpose**: Local development and testing
- **Security**: Relaxed settings for ease of development
- **Databases**: Local Docker containers
- **APIs**: Test/development API keys
- **Logging**: Verbose logging enabled

```bash
# Development-specific settings
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:4200
```

### Quality Assurance (.env.qa)

- **Purpose**: Testing and quality assurance
- **Security**: Moderate security settings
- **Databases**: Dedicated QA databases
- **APIs**: Testing API keys
- **Logging**: Structured logging

```bash
# QA-specific settings
NODE_ENV=testing
DEBUG=false
LOG_LEVEL=info
CORS_ORIGIN=https://qa.chatsuite.com
```

### Production (.env.host)

- **Purpose**: Production deployment
- **Security**: Maximum security settings
- **Databases**: Production databases with backups
- **APIs**: Production API keys
- **Logging**: Error and audit logging only

```bash
# Production-specific settings
NODE_ENV=production
DEBUG=false
LOG_LEVEL=error
CORS_ORIGIN=https://chatsuite.com
RATE_LIMIT_ENABLED=true
```

## Setup Guide

### 1. Copy Environment Template

If environment files don't exist, create them from templates:

```bash
# Copy development template
cp ./config/env/.env.dev.example ./config/env/.env.dev

# Copy QA template
cp ./config/env/.env.qa.example ./config/env/.env.qa

# Copy production template
cp ./config/env/.env.host.example ./config/env/.env.host
```

### 2. Configure API Keys

Edit the appropriate environment file and add your API keys:

```bash
# Edit development environment
nano ./config/env/.env.dev

# Add your API keys
OPENAI_API_KEY=sk-your-actual-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key-here
```

### 3. Generate Secrets

Generate secure secrets for production:

```bash
# Generate JWT secrets
openssl rand -hex 32  # Use for JWT_SECRET
openssl rand -hex 32  # Use for JWT_REFRESH_SECRET

# Generate database passwords
openssl rand -base64 32  # Use for POSTGRES_PASSWORD

# Generate encryption keys
openssl rand -hex 16   # Use for ENCRYPTION_KEY
```

### 4. Validate Configuration

Test your configuration:

```bash
# Start services with specific environment
NX_APP_ENV=dev docker-compose up -d

# Check if services can access configuration
docker-compose logs | grep -i "error\|failed"
```

## Security Best Practices

### API Key Management

1. **Never commit real API keys** to version control
2. **Use different keys** for different environments
3. **Rotate keys regularly** especially for production
4. **Monitor API usage** to detect unauthorized access
5. **Use minimum required permissions** for each key

### Password Security

1. **Use strong passwords** (32+ characters)
2. **Different passwords** for each environment
3. **Regular password rotation** in production
4. **Password managers** for team access
5. **Never use default passwords** in production

### Environment Isolation

1. **Separate credentials** for each environment
2. **Network isolation** between environments
3. **Access control** based on roles
4. **Regular security audits**
5. **Principle of least privilege**

## Common Configuration Issues

### Database Connection Errors

```bash
# Check database connectivity
docker exec chatsuite_api-customer-service nc -z postgres 5432

# Verify database credentials
docker exec chatsuite_postgres psql -U admin -d chatsuite -c "SELECT version();"
```

### API Key Issues

```bash
# Test OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Test Anthropic API key
curl -H "x-api-key: $ANTHROPIC_API_KEY" https://api.anthropic.com/v1/messages
```

### Service Discovery Problems

```bash
# Check if services can resolve each other
docker exec chatsuite_api-customer-service nslookup postgres
docker exec chatsuite_librechat nslookup mongodb
```

## Environment Variables Reference

### Core Application

| Variable   | Description             | Example                     |
| ---------- | ----------------------- | --------------------------- |
| `NODE_ENV` | Application environment | `development`, `production` |
| `PORT`     | Application port        | `3000`, `3333`              |
| `HOST`     | Application host        | `0.0.0.0`, `localhost`      |
| `DEBUG`    | Enable debug logging    | `true`, `false`             |

### Database

| Variable        | Description                  | Example                               |
| --------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL`  | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `POSTGRES_HOST` | PostgreSQL hostname          | `postgres`, `localhost`               |
| `POSTGRES_PORT` | PostgreSQL port              | `5432`                                |
| `POSTGRES_DB`   | Database name                | `chatsuite`                           |

### Security

| Variable         | Description         | Example                       |
| ---------------- | ------------------- | ----------------------------- |
| `JWT_SECRET`     | JWT signing secret  | Random 32-byte hex string     |
| `ENCRYPTION_KEY` | Data encryption key | Random 16-byte hex string     |
| `SESSION_EXPIRY` | Session timeout     | `1000 * 60 * 15` (15 minutes) |

## Troubleshooting

### Common Issues

1. **Environment file not found**

   ```bash
   # Check file existence
   ls -la ./config/env/

   # Verify environment selection
   echo $NX_APP_ENV
   ```

2. **Invalid environment variables**

   ```bash
   # Check environment loading
   docker-compose config

   # Validate specific service environment
   docker-compose exec service-name env | grep VAR_NAME
   ```

3. **Permission denied**

   ```bash
   # Fix file permissions
   chmod 600 ./config/env/.env.*

   # Check file ownership
   ls -la ./config/env/
   ```

### Debug Commands

```bash
# Show all environment variables for a service
docker-compose exec api-customer-service env

# Test environment file loading
docker-compose config --resolve-image-digests

# Check specific variable
docker-compose exec librechat echo $OPENAI_API_KEY
```

## Backup and Restore

### Backup Environment Configuration

```bash
# Create backup of all environment files
tar -czf env-backup-$(date +%Y%m%d).tar.gz ./config/env/

# Secure backup (encrypted)
gpg --cipher-algo AES256 --compress-algo 1 --s2k-cipher-algo AES256 \
    --s2k-digest-algo SHA512 --s2k-mode 3 --s2k-count 65536 \
    --force-mdc --output env-backup-$(date +%Y%m%d).tar.gz.gpg \
    --symmetric ./config/env/
```

### Restore Configuration

```bash
# Restore from backup
tar -xzf env-backup-YYYYMMDD.tar.gz

# Restore from encrypted backup
gpg --output env-backup-YYYYMMDD.tar.gz --decrypt env-backup-YYYYMMDD.tar.gz.gpg
tar -xzf env-backup-YYYYMMDD.tar.gz
```

## Repository

- **Docker Compose Environment**: https://docs.docker.com/compose/environment-variables/
- **Environment Security**: https://12factor.net/config
- **Secrets Management**: https://docs.docker.com/engine/swarm/secrets/
