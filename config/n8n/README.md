# n8n Integration in ChatSuite Monorepo

## Overview

n8n has been fully integrated into the ChatSuite monorepo following the established patterns and conventions.

## Directory Structure

```
config/n8n/
└── README.md                   # This documentation
```

## Configuration

### Environment Variables

The n8n service uses the following key environment variables:
- `N8N_DB_TYPE=postgresdb` - Database type
- `N8N_DB_POSTGRESDB_HOST=postgres` - Database host
- `N8N_DB_POSTGRESDB_SCHEMA=n8n` - Dedicated schema
- `N8N_SSL_KEY=/certs/localhost-key.pem` - SSL private key
- `N8N_SSL_CERT=/certs/localhost-crt.pem` - SSL certificate
- `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true` - Security setting

### Database Integration
n8n uses the shared PostgreSQL database with its own schema (`n8n`) for:
- Workflow storage and execution history
- User management and credentials
- Settings and configuration data

### SSL/TLS Configuration
n8n uses SSL certificates mounted from `config/certificates/` for secure HTTPS connections.

## Docker Integration

### Official Image
n8n uses the official Docker image (`n8nio/n8n:latest`) which provides:
- Pre-configured n8n installation with all dependencies
- Optimized Node.js runtime environment
- Built-in security and performance optimizations
- Automatic updates with latest n8n features

### Network Configuration
n8n is connected to both:
- `gateway` network - for communication with other services
- `database_pg` network - for PostgreSQL access

### Volume Mounts
- `./data/n8n:/data/n8n` - Persistent workflow and configuration data
- `./config/certificates:/certs:ro` - SSL certificates (read-only)

## Nginx Proxy

n8n is accessible through the nginx reverse proxy at:
- HTTPS: `https://localhost:10443/n8n`

The nginx configuration includes:
- WebSocket support for real-time updates
- Proper headers for reverse proxy operation
- SSL termination

## Scripts

The following Docker Compose commands are available for n8n management:

```bash
# Start n8n service
docker-compose up n8n -d

# View n8n container logs
docker-compose logs n8n -f

# Stop and restart the n8n container
docker-compose restart n8n

# Pull latest n8n image
docker-compose pull n8n
```

## Usage

1. Start the entire stack: `docker-compose up -d`
2. Start only n8n: `docker-compose up n8n -d`
3. Access n8n at: `https://localhost:5678`
4. The first time you access n8n, you'll need to set up an admin account

## Security Features

- Custom certificate support for enterprise environments
- Encrypted credential storage
- JWT-based authentication
- Secure cookie configuration
- Database connection encryption

## Monitoring and Logs

- Container logs: `pnpm docker:n8n:logs`
- Application logs are stored in the container and accessible via Docker logs
- Database queries are logged in PostgreSQL logs

## Development

The n8n configuration follows the monorepo patterns:
- Environment-specific configuration
- Shared database and networking
- Consistent logging and monitoring
- Integration with the existing CI/CD pipeline
