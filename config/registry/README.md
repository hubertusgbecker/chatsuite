# Docker Registry Integration

This directory contains configuration for a private Docker registry in the ChatSuite monorepo.

## Overview

This directory is prepared for running a private Docker registry that can store custom Docker images for the ChatSuite project. This is useful for storing custom-built images, caching external images, or creating a local development registry.

## Directory Structure

```
config/registry/
├── README.md          # This documentation
├── .gitkeep          # Ensures directory exists in git
├── auth/             # Authentication configuration
├── data/             # Registry data storage
└── root/             # Root certificates and configuration
```

## Setup Guide

### 1. Basic Registry Configuration

To enable a Docker registry, add this service to your `docker-compose.yaml`:

```yaml
services:
  registry:
    image: registry:2
    container_name: chatsuite_registry
    restart: always
    ports:
      - '5000:5000'
    environment:
      REGISTRY_HTTP_TLS_CERTIFICATE: /certs/registry.crt
      REGISTRY_HTTP_TLS_KEY: /certs/registry.key
      REGISTRY_AUTH: htpasswd
      REGISTRY_AUTH_HTPASSWD_PATH: /auth/htpasswd
      REGISTRY_AUTH_HTPASSWD_REALM: Registry Realm
    volumes:
      - ./config/registry/data:/var/lib/registry
      - ./config/registry/auth:/auth:ro
      - ./config/certificates:/certs:ro
    networks:
      - gateway
```

### 2. Create Authentication

Set up basic authentication for the registry:

```bash
# Create auth directory if it doesn't exist
mkdir -p ./config/registry/auth

# Create a user (replace 'username' and 'password')
docker run --rm --entrypoint htpasswd \
  httpd:2 -Bbn username password > ./config/registry/auth/htpasswd
```

### 3. Generate SSL Certificates

For HTTPS access, generate SSL certificates:

```bash
# Generate self-signed certificate for registry
openssl req -newkey rsa:4096 -nodes -sha256 \
  -keyout ./config/registry/registry.key \
  -x509 -days 365 \
  -out ./config/registry/registry.crt \
  -subj "/CN=localhost"

# Move certificates to the certificates directory
mv ./config/registry/registry.* ./config/certificates/
```

### 4. Start the Registry

```bash
# Start the registry service
docker-compose up registry -d

# Verify it's running
curl -k https://localhost:5000/v2/
```

## Usage

### Pushing Images to Registry

```bash
# Login to your registry
docker login localhost:5000

# Tag an image for your registry
docker tag your-image:tag localhost:5000/your-image:tag

# Push the image
docker push localhost:5000/your-image:tag
```

### Pulling Images from Registry

```bash
# Pull an image from your registry
docker pull localhost:5000/your-image:tag

# Use in docker-compose.yaml
services:
  your-service:
    image: localhost:5000/your-image:tag
```

### Registry Web UI (Optional)

Add a web interface for the registry:

```yaml
services:
  registry-ui:
    image: joxit/docker-registry-ui:latest
    container_name: chatsuite_registry_ui
    restart: always
    ports:
      - '8081:80'
    environment:
      REGISTRY_TITLE: ChatSuite Registry
      REGISTRY_URL: https://registry:5000
      DELETE_IMAGES: true
      SHOW_CONTENT_DIGEST: true
    depends_on:
      - registry
    networks:
      - gateway
```

## Use Cases

### 1. Custom Application Images

Store custom-built images for ChatSuite components:

```bash
# Build and push custom API image
docker build -t localhost:5000/chatsuite/api:latest ./apps/api-customer-service/
docker push localhost:5000/chatsuite/api:latest
```

### 2. Image Caching

Cache external images locally to improve build times:

```bash
# Pull and re-tag external images
docker pull postgres:latest
docker tag postgres:latest localhost:5000/postgres:latest
docker push localhost:5000/postgres:latest
```

### 3. Development Snapshots

Store development snapshots and experimental builds:

```bash
# Create development snapshot
docker build -t localhost:5000/chatsuite/client-app:dev-$(date +%Y%m%d) ./apps/client-app/
docker push localhost:5000/chatsuite/client-app:dev-$(date +%Y%m%d)
```

## Configuration Options

### Environment Configuration

Configure different storage backends using environment variables:

```bash
# Check current environment
cat ../../.env    # Shows NX_APP_ENV=dev (or qa/host)

# Edit the active environment file
# ./config/env/.env.dev (development)
# ./config/env/.env.qa (testing)
# ./config/env/.env.host (production)
```

```yaml
environment:
  # Local filesystem (default for dev)
  REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY: /var/lib/registry

  # S3 storage (production/host environment)
  REGISTRY_STORAGE: s3
  REGISTRY_STORAGE_S3_BUCKET: my-registry-bucket
  REGISTRY_STORAGE_S3_REGION: us-east-1
```

### Access Control

Configure advanced access control:

```yaml
environment:
  # Token-based authentication
  REGISTRY_AUTH: token
  REGISTRY_AUTH_TOKEN_REALM: https://auth.example.com/token
  REGISTRY_AUTH_TOKEN_SERVICE: registry.example.com
```

### Registry Mirrors

Configure as a mirror for Docker Hub:

```yaml
environment:
  REGISTRY_PROXY_REMOTEURL: https://registry-1.docker.io
```

## Maintenance

### Cleanup Old Images

```bash
# Run garbage collection to free space
docker exec chatsuite_registry registry garbage-collect /etc/docker/registry/config.yml

# Delete specific image
curl -X DELETE https://localhost:5000/v2/your-image/manifests/sha256:digest
```

### Backup Registry Data

```bash
# Create backup of registry data
tar -czf registry-backup-$(date +%Y%m%d).tar.gz ./config/registry/data/

# Restore from backup
tar -xzf registry-backup-YYYYMMDD.tar.gz -C ./config/registry/
```

### Monitor Registry

```bash
# Check registry logs
docker-compose logs registry

# Check registry storage usage
du -sh ./config/registry/data/

# List all repositories
curl -k https://localhost:5000/v2/_catalog
```

## Troubleshooting

### Common Issues

1. **Certificate errors**

   ```bash
   # Add registry to Docker daemon insecure registries
   # Edit /etc/docker/daemon.json:
   {
     "insecure-registries": ["localhost:5000"]
   }

   # Restart Docker daemon
   sudo systemctl restart docker
   ```

2. **Authentication failures**

   ```bash
   # Verify htpasswd file
   cat ./config/registry/auth/htpasswd

   # Test authentication
   curl -u username:password https://localhost:5000/v2/
   ```

3. **Storage space issues**

   ```bash
   # Check disk usage
   df -h ./config/registry/data/

   # Run garbage collection
   docker exec chatsuite_registry registry garbage-collect --dry-run /etc/docker/registry/config.yml
   ```

## Security Considerations

### Production Security

1. **Use proper SSL certificates** from a trusted CA
2. **Implement proper authentication** with token-based auth
3. **Set up network isolation** with firewall rules
4. **Enable audit logging** for all registry operations
5. **Regular security updates** for registry image
6. **Backup encryption** for stored images

### Access Control

- Limit registry access to authorized users only
- Use separate credentials for different environments
- Implement role-based access control for teams
- Monitor registry access logs regularly

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Login to Registry
  run: echo ${{ secrets.REGISTRY_PASSWORD }} | docker login localhost:5000 -u ${{ secrets.REGISTRY_USERNAME }} --password-stdin

- name: Build and Push
  run: |
    docker build -t localhost:5000/chatsuite/app:${{ github.sha }} .
    docker push localhost:5000/chatsuite/app:${{ github.sha }}
```

### Development Workflow

1. Build images locally
2. Push to private registry
3. Test with registry images
4. Deploy to staging/production

## Repository

- **Docker Registry Documentation**: https://docs.docker.com/registry/
- **Registry Configuration**: https://docs.docker.com/registry/configuration/
- **Registry API**: https://docs.docker.com/registry/spec/api/
