# PostgreSQL Database Integration

This directory contains the configuration for PostgreSQL database server in the ChatSuite monorepo.

## Overview

PostgreSQL serves as the primary database for multiple services in ChatSuite. It provides a centralized, reliable data storage solution with support for multiple schemas and databases for different applications.

## Configuration

### Files Structure
- `./config/postgres/docker-entrypoint-postgres.sh` - Custom startup script
- `./config/postgres/init-databases.sh` - Database initialization script
- `./data/postgres/` - Database data persistence directory

### Docker Service
The service is configured in `docker-compose.yaml` as:
- **Container**: `chatsuite_postgres`
- **Image**: `postgres:latest`
- **Internal Port**: 5432 (not exposed externally)
- **Networks**: gateway, database_pg
- **Volume**: `postgres_data` for data persistence

## Setup Guide

### 1. Environment Configuration
Database credentials are configured in the active environment file:

```bash
# Check which environment is active
cat ../../.env    # Shows NX_APP_ENV=dev (or qa/host)

# Edit the active environment file
nano ../../config/env/.env.dev    # For development (default)
# nano ../../config/env/.env.qa   # For QA environment
# nano ../../config/env/.env.host # For production environment

# PostgreSQL Configuration variables:
POSTGRES_DB=chatsuite
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin    # Change for qa/host environments
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

### 2. Start the Service
```bash
# Start PostgreSQL
docker-compose up postgres -d

# Verify it's running
docker-compose ps postgres
```

### 3. Access via PgAdmin
PostgreSQL includes PgAdmin web interface:
```bash
# Start PgAdmin
docker-compose up pgadmin -d

# Access at: https://localhost:10443/pgadmin/
```

## Database Structure

### Automatic Database Creation
The initialization script creates separate databases and schemas for each service:

1. **chatsuite** - Main application database
   - Customer service data
   - User management
   - Application settings

2. **n8n** - Workflow automation
   - Workflow definitions
   - Execution history
   - User credentials

3. **nocodb** - Database GUI
   - Project configurations
   - API definitions
   - User interface settings

4. **Additional schemas** - Created as needed by services

### Initialization Process
During first startup, PostgreSQL runs:
1. `docker-entrypoint-postgres.sh` - Custom startup logic
2. `init-databases.sh` - Creates databases and schemas
3. Service-specific migrations - Each app creates its tables

## Service Integration

### Connected Services
Multiple services connect to PostgreSQL:

- **Customer Service API** (port 3333)
  - Connection: `postgresql://admin:admin@postgres:5432/chatsuite`
  - Purpose: Application data storage

- **n8n Workflow Engine** (port 5678)
  - Connection: `postgresql://admin:admin@postgres:5432/chatsuite?schema=n8n`
  - Purpose: Workflow and execution data

- **NocoDB** (port 8080)
  - Connection: `postgresql://admin:admin@postgres:5432/chatsuite?schema=nocodb`
  - Purpose: Database GUI and API generation

### Network Configuration
PostgreSQL is accessible on two networks:
- **gateway**: For service discovery and general access
- **database_pg**: Dedicated database network for security

## Management and Monitoring

### PgAdmin Web Interface
Access PostgreSQL administration at: `https://localhost:10443/pgadmin/`

**Login Credentials:**
- Email: admin@chatsuite.com
- Password: admin

### Direct Database Access
Connect directly from within containers:
```bash
# Access PostgreSQL CLI
docker exec -it chatsuite_postgres psql -U admin -d chatsuite

# Run SQL commands
\l  # List databases
\c chatsuite  # Connect to database
\dt  # List tables
\q  # Quit
```

### Backup and Restore
```bash
# Create backup
docker exec chatsuite_postgres pg_dump -U admin chatsuite > backup.sql

# Restore from backup
docker exec -i chatsuite_postgres psql -U admin chatsuite < backup.sql

# Backup all databases
docker exec chatsuite_postgres pg_dumpall -U admin > full_backup.sql
```

## Performance and Optimization

### Configuration
PostgreSQL is configured with sensible defaults for development:
- **Shared Buffers**: Optimized for available memory
- **Work Memory**: Balanced for concurrent connections
- **Checkpoint Settings**: Configured for data safety
- **Connection Limits**: Set for multi-service usage

### Monitoring
Monitor database performance:
```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check database sizes
SELECT datname, pg_size_pretty(pg_database_size(datname)) 
FROM pg_database;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname NOT IN ('information_schema','pg_catalog');
```

## Troubleshooting

### Common Issues

1. **Connection refused errors**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Verify network connectivity
   docker exec chatsuite_api-customer-service nc -z postgres 5432
   ```

2. **Database does not exist**
   ```bash
   # Check if databases were created
   docker exec chatsuite_postgres psql -U admin -l
   
   # Recreate databases if needed
   docker-compose restart postgres
   ```

3. **Permission denied errors**
   - Verify credentials in environment files
   - Check database user permissions
   - Ensure proper schema access rights

4. **Disk space issues**
   ```bash
   # Check PostgreSQL data volume usage
   docker system df
   
   # Clean up old data if needed
   docker volume prune
   ```

### Debug Commands
```bash
# Check PostgreSQL version and status
docker exec chatsuite_postgres psql -U admin -c "SELECT version();"

# Test connection from another container
docker exec chatsuite_api-customer-service pg_isready -h postgres -p 5432

# Check PostgreSQL configuration
docker exec chatsuite_postgres psql -U admin -c "SHOW all;"

# Monitor real-time activity
docker exec chatsuite_postgres psql -U admin -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

## Service Status

### **Working Components:**
- PostgreSQL server running on port 5432
- Multiple database support
- PgAdmin web interface
- Automatic schema creation
- Data persistence through Docker volumes

### **Integration Benefits:**
- Centralized database for all services
- Automatic backup through volume mounts
- Network isolation for security
- Multi-tenant schema support
- Web-based administration interface

## Security Considerations

### Development Security
- Database is not exposed externally (no port mapping)
- Access only through Docker networks
- Default credentials for development environment
- PgAdmin protected by Nginx reverse proxy

### Production Security
For production deployment (host environment):
1. **Change default credentials** in `./config/env/.env.host`
2. **Enable SSL/TLS** for database connections
3. **Configure firewall rules** for database access
4. **Set up regular backups** with encryption
5. **Enable audit logging** for security monitoring
6. **Use connection pooling** (PgBouncer) for performance
7. **Environment separation**: Different credentials for dev/qa/host

## Advanced Configuration

### Custom PostgreSQL Settings
Create `postgresql.conf` customizations:
```bash
# Add custom configuration
echo "shared_preload_libraries = 'pg_stat_statements'" >> custom.conf

# Mount in docker-compose.yaml
volumes:
  - ./config/postgres/custom.conf:/etc/postgresql/postgresql.conf
```

### Extensions
Install additional PostgreSQL extensions:
```sql
-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Replication Setup
For high availability, configure streaming replication:
1. Set up primary-replica configuration
2. Configure WAL archiving
3. Set up automatic failover
4. Monitor replication lag

## Repository

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Docker Image**: https://hub.docker.com/_/postgres
- **PgAdmin**: https://www.pgadmin.org/docs/
