# NocoDB Configuration Documentation

## Overview

NocoDB has been configured with its own dedicated PostgreSQL database, completely separated from the main ChatSuite database. This ensures data isolation and follows the ChatSuite development standards.

## Architecture

- **Separate PostgreSQL Container**: `chatsuite_nocodb_postgres`
- **Dedicated Network**: `nocodb_network`
- **Data Persistence**: Docker volume `chatsuite_nocodb_postgres_data`
- **Database**: `nocodb` owned by `nocodb_user`

## Environment Configuration

According to AGENTS.md standards, configuration is managed through:

### Template Files (version-controlled)
- `config/env/env.dev` - Development template
- `config/env/env.host` - Production template  
- `config/env/env.qa` - QA template

### Runtime Files (not version-controlled, with dot prefix)
- `config/env/.env.dev` - Development runtime configuration
- `config/env/.env.host` - Production runtime configuration
- `config/env/.env.qa` - QA runtime configuration

## Environment Variables

### Development Environment (.env.dev)
```bash
NOCODB_POSTGRES_PASSWORD=nocodb_password_123
NOCODB_DB_PASSWORD=nocodb_user_pass
```

### Production Environment (.env.host)
```bash
NOCODB_POSTGRES_PASSWORD=nc_P9duCt10n_Adm1n_S3cur3_P4ssw0rd
NOCODB_DB_PASSWORD=nc_P9duCt10n_Us3r_S3cur3_P4ssw0rd
```

### QA Environment (.env.qa)
```bash
NOCODB_POSTGRES_PASSWORD=nc_QA_Adm1n_T3st_P4ssw0rd
NOCODB_DB_PASSWORD=nc_QA_Us3r_T3st_P4ssw0rd
```

## Database Initialization

The `docker-entrypoint-nocodb-postgres.sh` script handles:
- Creating the `nocodb_user` with appropriate permissions
- Setting up the `nocodb` database
- Granting necessary privileges

## Docker Compose Configuration

The `docker-compose.yaml` includes:
- `nocodb_postgres` service with health checks
- `nocodb` service depending on PostgreSQL health
- Proper network isolation with `nocodb_network`
- Volume mapping for data persistence

## Usage

### Switching Environments

According to AGENTS.md, use the NX_APP_ENV variable:

```bash
# Set development environment
export NX_APP_ENV=dev

# Set production environment  
export NX_APP_ENV=host

# Set QA environment
export NX_APP_ENV=qa
```

Or use the helper commands:
```bash
pnpm env:set:dev
pnpm env:set:host
pnpm env:set:qa
```

### Starting Services

```bash
# Start NocoDB with its database
docker-compose up -d nocodb_postgres nocodb

# Or start all services
docker-compose up -d
```

### Accessing NocoDB

- **Direct Access**: http://localhost:8080
- **Via Nginx Proxy**: https://localhost:10443/nocodb/

## Data Storage

- **PostgreSQL Data**: Docker volume `chatsuite_nocodb_postgres_data`
- **NocoDB App Data**: `./data/nocodb/` directory
- **Complete Separation**: No shared data with main ChatSuite database

## Security Notes

- Production environment uses strong, unique passwords
- Database user has minimal required permissions
- Network isolation through dedicated Docker network
- Data is persisted in separate volumes

## Troubleshooting

### Check Database Connection
```bash
docker exec chatsuite_nocodb_postgres psql -U nocodb_user -d nocodb -c "\dt"
```

### View Logs
```bash
docker logs chatsuite_nocodb_postgres
docker logs chatsuite_nocodb
```

### Verify Environment Loading
```bash
docker-compose config | grep NC_DB
```

## Maintenance

- **Backup**: Use standard PostgreSQL backup procedures on the `chatsuite_nocodb_postgres` container
- **Updates**: Update the NocoDB image version in docker-compose.yaml
- **Password Changes**: Update both template and runtime environment files

NocoDB transforms any database into a smart spreadsheet interface. It provides a no-code platform for building database applications, APIs, and collaborative workspaces. Think of it as Airtable but for your own database.

## Configuration

### Files Structure
- `./config/nocodb/README.md` - This documentation
- `./data/nocodb/` - Data persistence directory

### Docker Service
The service is configured in `docker-compose.yaml` as:
- **Container**: `chatsuite_nocodb`
- **Image**: `nocodb/nocodb:latest`
- **Port**: 8080
- **Networks**: gateway, database_pg
- **Dependencies**: postgres

## Setup Guide

### 1. Start the Service
```bash
# Start PostgreSQL first (dependency)
docker-compose up postgres -d

# Start NocoDB
docker-compose up nocodb -d

# Or start everything at once
docker-compose up -d
```

### 2. Access NocoDB
There are two ways to access NocoDB:

**Direct Access:**
- URL: `http://localhost:8080`

**Via Nginx Proxy (Recommended):**
- URL: `https://localhost:10443/nocodb/`

### 3. First Time Setup
1. Open NocoDB in your browser
2. Create your admin account (first user becomes super admin)
3. Create your first workspace
4. Connect to the ChatSuite database or create new projects

## Features

### Database Interface
- **Spreadsheet View**: View and edit data like Excel/Google Sheets
- **Grid View**: Traditional table view with sorting and filtering
- **Form View**: Create forms for data entry
- **Gallery View**: Visual card layout for records
- **Kanban View**: Project management board style

### API Generation
NocoDB automatically generates:
- **REST APIs**: Full CRUD operations for all tables
- **GraphQL APIs**: Query language for flexible data fetching
- **Swagger Documentation**: Interactive API documentation
- **Webhooks**: Real-time notifications for data changes

### Collaboration Features
- **User Management**: Role-based access control
- **Sharing**: Share views and forms with external users
- **Comments**: Add comments to records
- **Activity Logs**: Track all changes and user actions

## Database Integration

### Connection to ChatSuite PostgreSQL
NocoDB connects to the shared PostgreSQL database:
- **Host**: `postgres`
- **Database**: `chatsuite`
- **Schema**: `nocodb` (for NocoDB metadata)
- **Access**: Full access to all schemas and tables

### Database Discovery
NocoDB automatically discovers:
- All existing tables and relationships
- Foreign key constraints
- Data types and validation rules
- Indexes and performance optimizations

## Use Cases in ChatSuite

### 1. Customer Data Management
- View and edit customer records in spreadsheet format
- Create customer onboarding forms
- Generate customer reports and analytics
- Export customer data for marketing campaigns

### 2. Content Management
- Manage LibreChat conversation data
- Track n8n workflow execution history
- Monitor email campaign performance
- Organize file uploads and media assets

### 3. API Development
```bash
# Auto-generated REST API endpoints
GET /api/v1/db/data/v1/chatsuite/customers
POST /api/v1/db/data/v1/chatsuite/customers
PUT /api/v1/db/data/v1/chatsuite/customers/:id
DELETE /api/v1/db/data/v1/chatsuite/customers/:id
```

### 4. Business Intelligence
- Create custom views and filters
- Build dashboards with charts and metrics
- Set up automated reports
- Share insights with team members

### 5. Form Builder
Create forms for:
- Customer feedback collection
- Support ticket submission
- User registration
- Data entry workflows

## Creating Your First Project

### Step-by-Step Guide:
1. **Login** to NocoDB interface
2. **Create Project** - Connect to existing database or create new
3. **Import Data** - NocoDB will discover your tables automatically
4. **Customize Views** - Set up different views for different use cases
5. **Configure APIs** - Enable API access and set permissions
6. **Share Access** - Invite team members and set roles

### Database Connection
To connect to ChatSuite PostgreSQL:
```bash
# Check current environment for credentials
cat ../../.env    # Shows which environment is active

# Use credentials from active environment file:
# ./config/env/.env.dev (default)
# ./config/env/.env.qa  
# ./config/env/.env.host

Host: postgres
Port: 5432
Username: admin          # From environment file
Password: admin          # From environment file (change for qa/host)
Database: chatsuite
SSL: Disable (for development)
```

## Advanced Features

### Custom Views
Create specialized views:
- **Filter by Status**: Show only active customers
- **Sort by Date**: Recent orders first
- **Group by Category**: Organize products by type
- **Aggregate Data**: Sum, count, average calculations

### Automation
Set up automated actions:
- **Webhooks**: Trigger n8n workflows on data changes
- **Email Notifications**: Send alerts when conditions are met
- **Data Validation**: Enforce business rules automatically
- **Audit Logging**: Track all changes for compliance

### API Integration
```javascript
// Example: Fetch customer data
const response = await fetch('http://localhost:8080/api/v1/db/data/v1/chatsuite/customers', {
  headers: {
    'xc-token': 'your-api-token'
  }
});
const customers = await response.json();
```

## Integration with Other Services

### n8n Workflows
Use NocoDB in n8n workflows:
- **Trigger**: When new record is created in NocoDB
- **Action**: Update NocoDB record from external data
- **Query**: Fetch data from NocoDB for processing

### LibreChat Integration
- Store conversation metadata in NocoDB
- Create user management interfaces
- Build admin dashboards for chat analytics
- Manage AI model configurations

### MindsDB Integration
- Use NocoDB as a data source for ML models
- Display ML predictions in spreadsheet format
- Create forms for model training data
- Monitor model performance metrics

## Security and Permissions

### User Roles
- **Super Admin**: Full system access
- **Creator**: Can create and manage projects
- **Editor**: Can edit data and views
- **Commenter**: Can add comments only
- **Viewer**: Read-only access

### API Security
- **API Tokens**: Secure API access
- **Role-based Access**: Different permissions per role
- **IP Whitelisting**: Restrict access by IP address
- **Rate Limiting**: Prevent API abuse

## Troubleshooting

### Common Issues

1. **NocoDB not starting**
   ```bash
   # Check container logs
   docker-compose logs nocodb
   
   # Verify PostgreSQL connection
   docker exec chatsuite_nocodb nc -z postgres 5432
   ```

2. **Cannot connect to database**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure network connectivity between containers

3. **API not working**
   - Check API token configuration
   - Verify project and table permissions
   - Review API documentation in NocoDB interface

4. **Performance issues**
   - Optimize database indexes
   - Limit query results with pagination
   - Use appropriate filters and sorting

### Debug Commands
```bash
# Check NocoDB logs
docker-compose logs nocodb --tail=100

# Test database connection
docker exec chatsuite_nocodb nc -z postgres 5432

# Check NocoDB version
docker exec chatsuite_nocodb node --version

# Access container shell
docker exec -it chatsuite_nocodb sh
```

## Service Status

✅ **Working Components:**
- NocoDB web interface on port 8080
- PostgreSQL database integration
- Auto-generated REST APIs
- Spreadsheet-style data views
- Form builder functionality
- User authentication and authorization

✅ **Integration Benefits:**
- No-code database interface
- Automatic API generation
- Real-time collaboration
- Multiple data view types
- Integration with ChatSuite services
- Role-based access control

## Performance Optimization

### Database Optimization
- Create indexes for frequently queried columns
- Use pagination for large datasets
- Optimize complex queries
- Regular database maintenance

### UI Performance
- Use filters to limit displayed data
- Enable lazy loading for large tables
- Cache frequently accessed views
- Optimize image and file uploads

## Backup and Restore

### Project Backup
```bash
# Export project configuration
# Use NocoDB interface: Project Settings → Backup

# Backup NocoDB metadata schema
docker exec chatsuite_postgres pg_dump -U admin -d chatsuite --schema=nocodb > nocodb_backup.sql
```

### Data Backup
```bash
# Backup entire database (includes all data)
docker exec chatsuite_postgres pg_dump -U admin chatsuite > full_backup.sql
```

## Auto-Install Alternative

For a production-ready setup, NocoDB provides an **Auto-upstall** script:

```bash
# Automated installation with SSL
bash <(curl -sSL http://install.nocodb.com/noco.sh) <(mktemp)
```

This script:
- Installs all prerequisites automatically
- Sets up SSL certificates
- Configures production-ready compose setup
- Handles automatic upgrades when re-run

## Repository

- **NocoDB Documentation**: https://docs.nocodb.com/
- **GitHub**: https://github.com/nocodb/nocodb
- **API Documentation**: Available in NocoDB interface
- **Community**: https://discord.gg/5RgZmkW
