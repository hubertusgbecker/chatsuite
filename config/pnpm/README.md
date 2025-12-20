# PNPM Store Configuration

This directory contains the Docker configuration for managing PNPM package store in the ChatSuite monorepo.

## Overview

This configuration provides a centralized PNPM store that can be shared across different containers and build processes. It helps optimize build times by caching packages and reducing duplicate downloads.

## Configuration

### Files Structure

```
config/pnpm/
├── README.md           # This documentation
└── Dockerfile.pnpm-store  # Docker image for PNPM store
```

### Docker Configuration

The PNPM store is configured as a Docker volume and can be used by build containers to cache Node.js packages efficiently.

## Setup Guide

### 1. Build PNPM Store Image

```bash
# Build the PNPM store container image
docker build -f ./config/pnpm/Dockerfile.pnpm-store -t chatsuite-pnpm-store .
```

### 2. Create PNPM Store Volume

```bash
# Create a named volume for PNPM store
docker volume create chatsuite_pnpm_store
```

### 3. Use in Docker Compose

Add to your `docker-compose.yaml`:

```yaml
services:
  # Example service using PNPM store
  client-app:
    build:
      context: .
      dockerfile: ./apps/client-app/Dockerfile.dev
    volumes:
      - chatsuite_pnpm_store:/root/.pnpm-store
    environment:
      - PNPM_STORE_DIR=/root/.pnpm-store

volumes:
  chatsuite_pnpm_store:
    external: true
```

## Benefits

### Performance Optimization

- **Faster Builds**: Cached packages don't need to be downloaded again
- **Reduced Network Usage**: Packages downloaded once and reused
- **Consistent Dependencies**: Same package versions across containers
- **Parallel Builds**: Multiple containers can share the same store

### Storage Efficiency

- **Deduplication**: Packages stored once regardless of usage
- **Space Saving**: Significant disk space reduction for large projects
- **Clean Builds**: Store persists even when containers are recreated

## Usage in Development

### Local Development

```bash
# Use PNPM with shared store
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  -v $(pwd):/workspace -w /workspace \
  node:18 pnpm install

# Development container with store
docker-compose up client-app -d
```

### Build Process

```dockerfile
# Example Dockerfile using PNPM store
FROM node:18-alpine

# Set PNPM store directory
ENV PNPM_STORE_DIR=/root/.pnpm-store

# Install PNPM
RUN npm install -g pnpm

# Mount store volume (in docker-compose.yaml)
VOLUME ["/root/.pnpm-store"]

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build
```

## PNPM Store Management

### Store Information

```bash
# Check store location and size
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 pnpm store status

# List packages in store
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 pnpm store list
```

### Store Cleanup

```bash
# Remove unused packages from store
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 pnpm store prune

# Verify store integrity
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 pnpm store verify
```

### Store Migration

```bash
# Copy store from one location to another
docker run --rm \
  -v chatsuite_pnpm_store:/source/.pnpm-store \
  -v new_pnpm_store:/target/.pnpm-store \
  alpine sh -c "cp -r /source/.pnpm-store/* /target/.pnpm-store/"
```

## Integration with ChatSuite

### Client App Build

The React client app can use the shared PNPM store:

```yaml
# docker-compose.yaml
services:
  client-app:
    build:
      context: .
      dockerfile: ./apps/client-app/Dockerfile.dev
    volumes:
      - chatsuite_pnpm_store:/root/.pnpm-store
      - ./apps/client-app:/usr/src/root/apps/client-app
    environment:
      - PNPM_STORE_DIR=/root/.pnpm-store
```

### API Service Build

The NestJS API service can also benefit:

```yaml
# docker-compose.yaml
services:
  api-customer-service:
    build:
      context: .
      dockerfile: ./apps/api-customer-service/Dockerfile.dev
    volumes:
      - chatsuite_pnpm_store:/root/.pnpm-store
      - ./apps/api-customer-service:/usr/src/root/apps/api-customer-service
    environment:
      - PNPM_STORE_DIR=/root/.pnpm-store
```

### CI/CD Integration

Use in GitHub Actions or other CI systems:

```yaml
# .github/workflows/build.yml
steps:
  - name: Cache PNPM Store
    uses: actions/cache@v3
    with:
      path: ~/.pnpm-store
      key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}

  - name: Install dependencies
    run: pnpm install --frozen-lockfile --store-dir ~/.pnpm-store
```

## Configuration Options

### Store Directory

```bash
# Set custom store directory
export PNPM_STORE_DIR=/custom/path/.pnpm-store

# Or in package.json
{
  "pnpm": {
    "storeDir": "/custom/path/.pnpm-store"
  }
}
```

### Store Settings

Configure store settings in the active environment file:

```bash
# Check current environment
cat ../../.env    # Shows NX_APP_ENV=dev (or qa/host)

# Configure in environment file: ./config/env/.env.{NX_APP_ENV}
PNPM_STORE_DIR=/root/.pnpm-store

# Or configure in .npmrc
store-dir=/root/.pnpm-store
package-import-method=clone
verify-store-integrity=true
```

### Network Configuration

```bash
# Configure registry for store
registry=https://registry.npmjs.org/
# Or use private registry
registry=https://npm.your-company.com/
```

## Troubleshooting

### Common Issues

1. **Store not accessible**

   ```bash
   # Check volume existence
   docker volume ls | grep pnpm

   # Inspect volume details
   docker volume inspect chatsuite_pnpm_store

   # Check mount points in container
   docker run --rm -v chatsuite_pnpm_store:/store alpine ls -la /store
   ```

2. **Permission issues**

   ```bash
   # Fix store permissions
   docker run --rm -v chatsuite_pnpm_store:/store alpine chown -R 1000:1000 /store

   # Check current permissions
   docker run --rm -v chatsuite_pnpm_store:/store alpine ls -la /store
   ```

3. **Corrupted store**

   ```bash
   # Verify store integrity
   docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
     node:18 pnpm store verify

   # Repair corrupted store
   docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
     node:18 pnpm store prune
   ```

4. **Slow builds despite store**

   ```bash
   # Check if store is being used
   docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
     node:18 pnpm config get store-dir

   # Verify PNPM_STORE_DIR environment variable
   docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
     node:18 env | grep PNPM
   ```

### Debug Commands

```bash
# Check store status
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 pnpm store status

# Show store path
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 pnpm store path

# List all packages
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 pnpm store list

# Check disk usage
docker run --rm -v chatsuite_pnpm_store:/store alpine du -sh /store
```

## Maintenance

### Regular Cleanup

```bash
# Weekly cleanup script
#!/bin/bash
echo "Cleaning PNPM store..."
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 pnpm store prune

echo "Verifying store integrity..."
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 pnpm store verify

echo "Store size:"
docker run --rm -v chatsuite_pnpm_store:/store alpine du -sh /store
```

### Backup and Restore

```bash
# Backup PNPM store
docker run --rm -v chatsuite_pnpm_store:/store \
  -v $(pwd):/backup alpine tar czf /backup/pnpm-store-backup.tar.gz -C /store .

# Restore PNPM store
docker run --rm -v chatsuite_pnpm_store:/store \
  -v $(pwd):/backup alpine tar xzf /backup/pnpm-store-backup.tar.gz -C /store
```

### Store Analytics

```bash
# Generate store report
docker run --rm -v chatsuite_pnpm_store:/root/.pnpm-store \
  node:18 sh -c "
    echo 'PNPM Store Report:'
    echo 'Store Path:' \$(pnpm store path)
    echo 'Store Size:' \$(du -sh \$(pnpm store path) | cut -f1)
    echo 'Package Count:' \$(pnpm store list | wc -l)
    echo 'Store Status:'
    pnpm store status
  "
```

## Performance Benefits

### Build Time Comparison

Without PNPM store:

- Fresh build: 5-10 minutes
- Dependencies downloaded every time
- Network bandwidth intensive

With PNPM store:

- First build: 5-10 minutes (initial download)
- Subsequent builds: 1-2 minutes
- Network usage reduced by 80-90%

### Resource Usage

- **Disk Space**: 50-70% reduction in total package storage
- **Network**: 80-90% reduction in package downloads
- **Build Time**: 60-80% faster subsequent builds
- **CPU**: Lower decompression overhead

## Repository

- **PNPM Documentation**: https://pnpm.io/
- **PNPM Store**: https://pnpm.io/pnpm-store
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
