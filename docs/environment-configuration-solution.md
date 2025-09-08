# Environment Configuration Solution

## Problem Description

The ChatSuite monorepo had issues with environment configuration where:

1. **Environment Variable Loading**: The `.env` file in the root was not automatically loaded by pnpm/node processes
2. **Inconsistent Command Behavior**: `pnpm start` was hardcoded to use `host` environment, ignoring `.env` file settings
3. **Cross-env Override**: Package.json scripts used `cross-env NX_APP_ENV=<value>` which overrode any existing environment variable or .env file setting
4. **Manual Environment Sourcing**: The `.env` file required manual sourcing to work in shell contexts

## Solution Overview

The solution implements a comprehensive environment configuration system that:

- **Respects `.env` file settings**: The root `.env` file now controls the default environment
- **Maintains explicit overrides**: Specific environment commands still work for override scenarios
- **Provides automatic loading**: Uses dotenv-cli for NX commands and a custom resolver for Docker commands
- **Offers environment management**: New commands for setting, showing, and testing environment configuration

## Implementation Details

### 1. Environment Resolution Script

**File**: `tools/dev-scripts/cmd-resolve-env.js`

This script provides centralized environment resolution with the following priority order:
1. Process environment variable (if explicitly set by cross-env or similar)
2. `.env` file in project root
3. Fallback value (default: 'dev')

### 2. Updated Package.json Scripts

**Key Changes**:

- **`start`**: Now maps to `docker:workspace:up` (respects .env) instead of `start:workspace:host`
- **`docker:workspace:up`**: New command that uses `$(node tools/dev-scripts/cmd-resolve-env.js)` to resolve environment
- **`nx:*` commands**: Now use `dotenv -e .env --` to load environment variables from .env file
- **Environment management commands**:
  - `env:show`: Display current environment setting
  - `env:set:dev|qa|host`: Set environment in .env file
  - `env:test`: Run comprehensive environment configuration test

### 3. Environment File Structure

```
chatsuite/
├── .env                          # Root environment selector (NX_APP_ENV=dev|qa|host)
└── config/env/
    ├── .env.dev                  # Development environment variables
    ├── .env.host                 # Host environment variables
    └── .env.qa                   # QA environment variables
```

### 4. Command Behavior Matrix

| Command | Behavior | Environment File Used |
|---------|----------|----------------------|
| `pnpm start` | Uses .env setting | `./config/env/.env.$(from .env)` |
| `pnpm start:workspace:dev` | Forces dev | `./config/env/.env.dev` |
| `pnpm start:workspace:qa` | Forces qa | `./config/env/.env.qa` |
| `pnpm start:workspace:host` | Forces host | `./config/env/.env.host` |
| `pnpm start:workspace` | Uses .env setting | `./config/env/.env.$(from .env)` |
| `pnpm nx:*` | Uses .env setting | Loads .env via dotenv-cli |

## Usage Examples

### Setting Environment

```bash
# Set environment to development
pnpm env:set:dev

# Set environment to QA
pnpm env:set:qa

# Set environment to host
pnpm env:set:host

# Check current environment
pnpm env:show
```

### Starting Services

```bash
# Start with environment from .env file
pnpm start

# Start with specific environment (override .env)
pnpm start:workspace:dev
pnpm start:workspace:qa
pnpm start:workspace:host
```

### NX Commands

```bash
# All NX commands now respect .env file
pnpm nx:build    # Uses environment from .env
pnpm nx:test     # Uses environment from .env
pnpm nx:start    # Uses environment from .env
```

## Testing

Run the comprehensive test suite:

```bash
pnpm env:test
```

This validates:
- Environment detection from .env file
- Command behavior with different environments
- Docker-compose environment file resolution
- Explicit override functionality
- Dotenv-cli integration for NX commands

## Migration Guide

### For Developers

1. **No action required** for existing workflows - all explicit environment commands work as before
2. **Optional**: Use `pnpm start` instead of `pnpm start:workspace:host` for environment-aware startup
3. **Optional**: Use `pnpm env:set:*` commands for easier environment switching

### For CI/CD

- Existing CI/CD scripts using explicit environment commands continue to work unchanged
- New CI/CD scripts can use `pnpm start` with appropriate `.env` file setup

## Benefits

1. **Intuitive Behavior**: `pnpm start` now respects developer preferences set in `.env`
2. **Backward Compatibility**: All existing explicit environment commands continue to work
3. **Improved Developer Experience**: Easy environment switching with visual feedback
4. **Centralized Configuration**: Single source of truth for environment selection
5. **Comprehensive Testing**: Built-in test suite validates all environment scenarios

## Files Modified

- **`package.json`**: Updated scripts for environment-aware commands
- **`.env`**: Reset to proper format with comments
- **`tools/dev-scripts/cmd-resolve-env.js`**: New environment resolution script
- **`tools/dev-scripts/cmd-test-env-config.sh`**: Comprehensive test suite

## Dependencies Added

- **`dotenv-cli`**: For loading .env files in NX commands

## Alignment with AGENTS.md

This solution follows the guidelines in AGENTS.md:

- **Tool placement**: All scripts placed in `tools/dev-scripts/` as required
- **Environment strategy**: Implements the documented environment configuration approach
- **Docker integration**: Maintains proper docker-compose environment file usage
- **Monorepo standards**: Follows NX workspace conventions and naming patterns
