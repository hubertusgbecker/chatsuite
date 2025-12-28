# n8n API Key Setup for Integration Tests

## Overview

The n8n workflow automation integration tests require an API key for authentication. This guide shows you how to generate an API key from the n8n UI.

## Prerequisites

- n8n service running (`pnpm start`)
- Access to n8n UI at `https://localhost:10443/n8n/` or `http://localhost:5678`

## Steps to Generate API Key

### 1. Access n8n UI

Open your browser and navigate to:
- **Via nginx proxy**: `https://localhost:10443/n8n/`
- **Direct access**: `http://localhost:5678`

### 2. Login

Use the Basic Auth credentials from your environment configuration:
- **Username**: `admin` (default)
- **Password**: `admin123` (default)

These values are configured in `config/env/.env.dev`:
```bash
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123
```

### 3. Navigate to Settings

1. Click on your user profile icon in the bottom left corner
2. Select **"Settings"** from the menu
3. Navigate to the **"API"** tab

### 4. Create API Key

1. Click the **"Create API Key"** button
2. Give it a descriptive name: `Integration Tests` or `Local Development`
3. Click **"Create"**
4. **IMPORTANT**: Copy the API key immediately - you won't be able to see it again!

### 5. Configure Environment

Add the API key to your environment configuration:

**Option A: Per-session** (temporary, for testing)
```bash
export N8N_API_KEY=your_api_key_here
pnpm nx integration api-customer-service
```

**Option B: Persistent** (recommended)
Add to `config/env/.env.dev` (⚠️ NEVER commit this file):
```bash
# n8n API Configuration (for integration tests)
N8N_API_KEY=your_api_key_here
```

Then restart services:
```bash
pnpm rebuild
```

### 6. Verify Integration Tests

Run integration tests to verify n8n tests are now enabled:

```bash
pnpm nx integration api-customer-service
```

You should see:
```
✅ Test n8n connected
✓ should connect to n8n service (35 ms)
✓ should create and retrieve workflows in n8n (20 ms)
```

Instead of:
```
⚠️  N8N_API_KEY not configured - n8n tests will be skipped
ℹ️  Skipped: N8N_API_KEY not configured
```

## Security Best Practices

- ✅ **DO**: Store API keys in `.env.*` files (ignored by git)
- ✅ **DO**: Use different API keys for dev, QA, and production
- ✅ **DO**: Rotate API keys periodically
- ✅ **DO**: Delete unused API keys from n8n UI

- ❌ **DON'T**: Commit API keys to git
- ❌ **DON'T**: Share API keys via insecure channels
- ❌ **DON'T**: Use production API keys in development
- ❌ **DON'T**: Store API keys in code or configuration templates

## Troubleshooting

### "X-N8N-API-KEY header required" Error

**Cause**: API key not configured or invalid

**Solution**:
1. Verify `N8N_API_KEY` is set in environment
2. Check key is valid (hasn't been deleted from n8n)
3. Regenerate key if necessary

### Can't Access n8n UI

**Cause**: n8n service not running or misconfigured

**Solution**:
```bash
# Check n8n container status
docker ps | grep n8n

# Check n8n logs
docker logs chatsuite_n8n

# Restart n8n
docker restart chatsuite_n8n
```

### Tests Still Skipping

**Cause**: Environment variable not loaded

**Solution**:
```bash
# Verify environment variable
echo $N8N_API_KEY

# If empty, reload environment
source config/env/.env.dev  # OR
export N8N_API_KEY=your_key_here

# Run tests again
pnpm nx integration api-customer-service
```

## Alternative: Disable API Key Requirement (Not Recommended)

For local development only, you can disable API key requirement:

**⚠️ WARNING**: This reduces security and is not recommended for production.

Add to `config/env/.env.dev`:
```bash
N8N_PUBLIC_API_DISABLED=false
N8N_PUBLIC_API_SWAGGERUI_DISABLED=false
```

However, this still requires API keys for most endpoints, so generating an API key is the preferred approach.

## Reference

- [n8n API Documentation](https://docs.n8n.io/api/)
- [n8n Authentication](https://docs.n8n.io/api/authentication/)
- [ChatSuite Integration Testing Strategy](./integration-testing-strategy.md)
- [n8n Test Helper](../apps/api-customer-service/tests/integration/helpers/test-n8n.ts)

---

**Last Updated**: 2025-12-28  
**Related Commit**: feat: add n8n workflow automation integration tests
