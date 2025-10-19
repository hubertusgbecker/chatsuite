# n8n Workflow Automation Integration

This directory contains the configuration for n8n, a powerful workflow automation platform, integrated into the ChatSuite monorepo.

## Overview

n8n is a free and open-source workflow automation tool that allows you to connect different services and automate repetitive tasks. It provides a visual interface for creating complex workflows without coding.

## Configuration

### Files Structure
- `./config/n8n/docker-entrypoint-n8n.sh` - Comprehensive startup script with SSL support, permission fixes, and command handling
- `./config/n8n/README.md` - This documentation
- `./data/n8n/` - Persistent workflow and configuration data

### Docker Service
The service is configured in `docker-compose.yaml` as:
- **Container**: `chatsuite_n8n`
- **Image**: `n8nio/n8n:latest`
- **Port**: 5678

### Permission Management
n8n requires proper file permissions to access its data directory. The simplified permission solution includes:

1. **Automatic Comprehensive Fixes**: The entrypoint script automatically handles all permission scenarios
2. **SSL Configuration**: Automatically detects and configures SSL certificates if available
3. **Command Handling**: Intelligent n8n binary detection and startup
4. **Self-Healing**: Container restart automatically fixes any permission issues
5. **Data Directory Structure**: Creates required subdirectories (workflows, credentials, logs, nodes)

**Simplified Architecture**: All permission handling is now integrated into the docker entrypoint - no external scripts needed.
- **Networks**: gateway, database_pg
- **Dependencies**: postgres

## Setup Guide

### 1. Start the Service
```bash
# Start PostgreSQL first (dependency)
docker-compose up postgres -d

# Start n8n
docker-compose up n8n -d

# Or start everything at once
docker-compose up -d
```

### 2. Access n8n
There are two ways to access n8n:

**Direct Access:**
- URL: `http://localhost:5678`

**Via Nginx Proxy (Recommended):**
- URL: `https://localhost:10443/n8n/`

### 3. First Time Setup
1. Open n8n in your browser
2. Create your admin account (first user becomes admin)
3. Set up your organization and workspace
4. Start creating workflows!

## Features

### Visual Workflow Builder
- **Drag & Drop Interface**: Create workflows visually
- **500+ Integrations**: Connect to popular services and APIs
- **Custom Code**: Add JavaScript/Python code when needed
- **Conditional Logic**: Create complex decision trees
- **Error Handling**: Built-in retry and error handling

### Database Integration
n8n uses the shared PostgreSQL database with its own schema:
- **Database**: `chatsuite`
- **Schema**: `n8n`
- **Tables**: Workflows, executions, credentials, settings

### Key Integrations Available
- **Email**: SMTP, IMAP, Gmail, Outlook
- **Databases**: PostgreSQL, MySQL, MongoDB
- **APIs**: HTTP requests, webhooks, REST APIs
- **File Systems**: Local files, FTP, cloud storage
- **Messaging**: Slack, Discord, Telegram
- **CRM**: Salesforce, HubSpot, Pipedrive
- **E-commerce**: Shopify, WooCommerce
- **Social Media**: Twitter, LinkedIn, Facebook

## Use Cases in ChatSuite

### 1. Customer Service Automation
```
New Support Ticket → Classify Priority → Assign Agent → Send Notification
```

### 2. Email Marketing
```
New Customer → Add to CRM → Send Welcome Email → Schedule Follow-ups
```

### 3. Data Synchronization
```
Database Changes → Transform Data → Update External Systems → Log Activity
```

### 4. AI Integration
```
User Message → Analyze Sentiment → Route to AI → Process Response → Store Results
```

### 5. Monitoring & Alerts
```
System Error → Check Severity → Send Alert → Create Ticket → Update Dashboard
```

## Configuration

### Environment Variables
n8n uses these key environment variables from the active environment file:

```bash
# Check which environment is active
cat ../../.env    # Shows NX_APP_ENV=dev (or qa/host)

# Variables loaded from ./config/env/.env.{NX_APP_ENV}
N8N_DB_TYPE=postgresdb
N8N_DB_POSTGRESDB_HOST=postgres
N8N_DB_POSTGRESDB_SCHEMA=n8n

# SSL Configuration
N8N_SSL_KEY=/certs/localhost-key.pem
N8N_SSL_CERT=/certs/localhost-crt.pem

# Security Settings
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
```

### SSL/TLS Configuration
n8n uses SSL certificates from `./config/certificates/` for secure HTTPS connections.

### Webhook Configuration
For webhooks and external integrations:
```bash
# Webhook URL format
WEBHOOK_URL=https://localhost:10443/n8n/webhook/your-webhook-id

# Test webhook URL format  
WEBHOOK_TEST_URL=https://localhost:10443/n8n/webhook-test/your-webhook-id
```

## Creating Your First Workflow

### Example: Email Notification Workflow
1. **Trigger**: Webhook (receives data from external system)
2. **Filter**: Check if urgent priority
3. **Email**: Send notification to admin
4. **Database**: Log the incident

### Step-by-Step:
1. Click "Add Workflow" in n8n interface
2. Add "Webhook" trigger node
3. Add "If" condition node
4. Add "Email" action node
5. Add "PostgreSQL" database node
6. Connect the nodes and configure each one
7. Test and activate the workflow

## Advanced Features

### Code Nodes
Add custom JavaScript or Python code:
```javascript
// Example: Transform data
return items.map(item => ({
  ...item.json,
  processed_at: new Date().toISOString(),
  status: 'processed'
}));
```

### Cron Scheduling
Schedule workflows to run automatically:
- **Every Hour**: `0 * * * *`
- **Daily at 9 AM**: `0 9 * * *`
- **Weekly on Monday**: `0 9 * * 1`

### Sub-workflows
Break complex workflows into reusable components:
1. Create a sub-workflow
2. Call it from main workflows
3. Pass parameters between workflows

## Integration with Other ChatSuite Services

### LibreChat Integration
Create workflows that:
- Monitor chat conversations
- Analyze user sentiment
- Route complex queries to human agents
- Generate conversation summaries

### MindsDB Integration
Use n8n to:
- Trigger ML model training
- Process prediction results
- Automate data preparation
- Send prediction alerts

### Email Server Integration
Connect with MCP Email Server:
- Process incoming emails
- Send automated responses
- Manage email campaigns
- Create email-based workflows

## Troubleshooting

### Common Issues

1. **n8n not starting**
   ```bash
   # Check container logs
   docker-compose logs n8n
   
   # Verify PostgreSQL connection
   docker exec chatsuite_n8n nc -z postgres 5432
   ```

2. **Workflows not executing**
   - Check workflow activation status
   - Verify trigger configuration
   - Review execution logs in n8n interface

3. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check database credentials
   - Verify n8n schema exists

4. **SSL/Certificate issues**
   - Verify certificate files exist
   - Check file permissions
   - Test HTTPS access

### Debug Commands
```bash
# Check n8n logs
docker-compose logs n8n --tail=100

# Access n8n CLI
docker exec -it chatsuite_n8n n8n --help

# Test database connection
docker exec chatsuite_n8n nc -z postgres 5432

# Check n8n version
docker exec chatsuite_n8n n8n --version
```

## Service Status

✅ **Working Components:**
- n8n web interface on port 5678
- PostgreSQL database integration
- SSL certificate support
- Nginx reverse proxy integration
- Webhook endpoints
- Cron job scheduling

✅ **Integration Benefits:**
- Visual workflow automation
- 500+ service integrations
- Database persistence
- Secure HTTPS access
- Integration with ChatSuite services
- Custom code execution

## Security Considerations

### Development Security
- SSL certificates for encrypted communication
- Database credentials in environment files (per environment)
- Network isolation through Docker networks
- Nginx reverse proxy protection

### Production Security
1. **Change default credentials** in `./config/env/.env.host`
2. **Enable proper authentication** (LDAP, SAML, OAuth)
3. **Set up webhook security** with authentication
4. **Configure firewall rules**
5. **Enable audit logging**
6. **Regular backups** of workflow data
7. **Environment separation**: Use separate credentials for dev/qa/host

## Performance Optimization

### Workflow Best Practices
- Use efficient nodes and avoid unnecessary loops
- Implement proper error handling
- Set appropriate timeouts
- Use sub-workflows for reusable logic

### Database Optimization
- Regular cleanup of old executions
- Index optimization for large datasets
- Connection pooling configuration

## Backup and Restore

### Workflow Backup
```bash
# Export all workflows
docker exec chatsuite_n8n n8n export:workflow --all --output=/tmp/workflows.json

# Copy from container
docker cp chatsuite_n8n:/tmp/workflows.json ./backup/
```

### Database Backup
```bash
# Backup n8n schema
docker exec chatsuite_postgres pg_dump -U admin -d chatsuite --schema=n8n > n8n_backup.sql
```

## Repository

- **n8n Documentation**: https://docs.n8n.io/
- **GitHub**: https://github.com/n8n-io/n8n
- **Community**: https://community.n8n.io/
- **Workflow Templates**: https://n8n.io/workflows/
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

## Troubleshooting

### Permission Issues

**Problem**: n8n fails to start with permission errors like "EACCES: permission denied" or "cannot create directory"

**Solutions**:
1. **Self-Healing**: Simply restart the container - the entrypoint automatically fixes permissions:
   ```bash
   docker-compose restart n8n
   ```

2. **Complete Reset**: Stop and start fresh to ensure clean permission setup:
   ```bash
   docker-compose stop n8n && docker-compose up n8n -d
   ```

3. **Manual Host Fix** (if needed): Set liberal permissions on host directory:
   ```bash
   chmod -R 777 ./data/n8n/
   docker-compose restart n8n
   ```

### Container Startup Issues

**Problem**: n8n container exits immediately or fails to start

**Debugging Steps**:
1. Check container logs:
   ```bash
   pnpm docker:n8n:logs
   ```

2. Verify data directory exists and is accessible:
   ```bash
   ls -la ./data/n8n/
   ```

3. Test entrypoint script manually:
   ```bash
   docker-compose exec n8n /bin/sh
   ```

### Data Access Issues

**Problem**: n8n loses workflows or credentials

**Verification**:
1. Check if data directory is properly mounted:
   ```bash
   docker-compose exec n8n ls -la /home/node/.n8n/
   ```

2. Verify subdirectories exist:
   ```bash
   ls -la ./data/n8n/
   # Should show: credentials, logs, nodes, workflows
   ```

3. Re-run permission fix if needed:
   ```bash
   pnpm fix:n8n-permissions
   docker-compose restart n8n
   ```

### Database Connection Issues

**Problem**: n8n cannot connect to PostgreSQL

**Check**:
1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check environment variables in `.env.{dev|qa|host}`
3. Test database connection from n8n container:
   ```bash
   docker-compose exec n8n nc -zv postgres 5432
   ```

### Performance Issues

**Solutions**:
- Increase container memory limits in docker-compose.yaml
- Monitor disk usage in `./data/n8n/`
- Check PostgreSQL performance and indexes
- Review workflow complexity and execution frequency

## Development

The n8n configuration follows the monorepo patterns:
- Environment-specific configuration
- Shared database and networking
- Consistent logging and monitoring
- Integration with the existing CI/CD pipeline
