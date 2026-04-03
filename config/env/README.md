# Environment Configuration

Environment variable management for development, QA, and production deployments.

## Overview

ChatSuite uses three environments, each with a template (tracked in Git) and a runtime file (gitignored):

| Environment | Template     | Runtime        | Purpose               |
| ----------- | ------------ | -------------- | --------------------- |
| dev         | `env.dev`    | `.env.dev`     | Local development     |
| qa          | `env.qa`     | `.env.qa`      | Integration / testing |
| host        | `env.host`   | `.env.host`    | Production (Synology) |

The root `.env` file contains `NX_APP_ENV=dev|qa|host` which selects the active runtime file.

## Files

- `env.dev` — Development template (tracked in Git)
- `env.qa` — QA template (tracked in Git)
- `env.host` — Production template (tracked in Git)
- `.env.dev` — Development runtime with secrets (gitignored)
- `.env.qa` — QA runtime with secrets (gitignored)
- `.env.host` — Production runtime with secrets (gitignored)

## Setup

```bash
# Create runtime files from templates
cp config/env/env.dev config/env/.env.dev
cp config/env/env.qa config/env/.env.qa
cp config/env/env.host config/env/.env.host

# Edit with actual credentials
nano config/env/.env.dev
```

## Switching Environments

```bash
pnpm env:set:dev     # Set to development
pnpm env:set:qa      # Set to QA
pnpm env:set:host    # Set to production
pnpm env:show        # Show active environment
pnpm env:verify      # Verify security configuration
```

## How It Works

1. Root `.env` sets `NX_APP_ENV` (default: `dev`)
2. `docker-compose.yaml` loads `config/env/.env.${NX_APP_ENV:-dev}` via `env_file`
3. Nx commands load `.env` automatically via `dotenv-cli`
4. `tools/dev-scripts/cmd-resolve-env.js` resolves the active environment for shell scripts

## Key Variable Categories

### Database

```bash
POSTGRES_DB=chatsuite
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin          # Change for qa/host
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

### AI Service API Keys

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...               # Optional
```

### Service-Specific

```bash
# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=minioadmin123

# NocoDB
NOCODB_POSTGRES_PASSWORD=nocodb_password_123
NOCODB_DB_PASSWORD=nocodb_user_pass

# n8n
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123
```

## Security

- **Never** commit `.env.*` runtime files (enforced by `.gitignore`)
- Use strong, unique passwords for qa and host environments
- Rotate API keys periodically
- Run `pnpm env:verify` before deploying to production
