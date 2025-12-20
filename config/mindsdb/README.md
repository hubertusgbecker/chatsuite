# MindsDB Integration

This directory contains the configuration for MindsDB, an AI-powered database that brings machine learning to your data, integrated into the ChatSuite monorepo.

## Overview

MindsDB is an AI database that allows you to use machine learning models as virtual tables in your database. It can connect to various data sources, train models, and make predictions using SQL commands.

## Configuration

### Files Structure

- `./config/mindsdb/mindsdb_config.json` - MindsDB configuration file
- `./config/mindsdb/docker-entrypoint-mindsdb.sh` - Custom startup script
- `./config/mindsdb/fix-mindsdb-permissions.sh` - Permission fixing script
- `./data/mindsdb/` - Data persistence directory

### Docker Service

The service is configured in `docker-compose.yaml` as:

- **Container**: `chatsuite_mindsdb`
- **Image**: `mindsdb/mindsdb:latest`
- **Ports**: 47334 (HTTP), 47335 (MySQL), 47337 (MCP), 47338 (A2A)
- **Networks**: gateway
- **Volume**: `./data/mindsdb` for data persistence

## Setup Guide

### 1. Start the Service

```bash
# Start MindsDB
docker-compose up mindsdb -d

# Check if it's running
docker-compose ps mindsdb
```

### 2. Access MindsDB

Open your browser and go to: `http://localhost:47334`

### 3. First Time Setup

1. Create an account on the MindsDB web interface
2. Connect your data sources (PostgreSQL, MySQL, APIs, etc.)
3. Start creating and training ML models

## Features

### AI Database Capabilities

- **Predictive Models**: Train models to predict future outcomes
- **Natural Language Processing**: Analyze text data
- **Time Series Forecasting**: Predict trends and patterns
- **Classification**: Categorize data automatically
- **Regression**: Predict numerical values

### Data Source Integration

MindsDB can connect to:

- **PostgreSQL**: Your ChatSuite database
- **MySQL**: External MySQL databases
- **APIs**: REST APIs and web services
- **Files**: CSV, JSON, Excel files
- **Cloud Services**: AWS S3, Google Cloud, Azure

### SQL Interface

Use standard SQL commands to:

```sql
-- Connect to data source
CREATE DATABASE my_postgres
WITH ENGINE = "postgres",
PARAMETERS = {
    "user": "admin",
    "password": "admin",
    "host": "postgres",
    "port": "5432",
    "database": "chatsuite"
};

-- Create a machine learning model
CREATE MODEL customer_churn_predictor
FROM my_postgres (SELECT * FROM customers)
PREDICT churn_risk;

-- Make predictions
SELECT customer_id, churn_risk
FROM my_postgres.customers
JOIN mindsdb.customer_churn_predictor;
```

## Use Cases in ChatSuite

### 1. Customer Analytics

- Predict customer churn probability
- Analyze customer behavior patterns
- Segment customers automatically
- Forecast customer lifetime value

### 2. Business Intelligence

- Analyze conversation patterns in LibreChat
- Predict workflow automation success rates
- Optimize email marketing campaigns
- Forecast system resource usage

### 3. AI-Powered Automation

- Integrate with n8n workflows for automated predictions
- Create smart alerts based on ML predictions
- Automate customer support responses
- Generate business insights automatically

## API Access

### HTTP API (Port 47334)

```bash
# Health check
curl http://localhost:47334/api/status

# Execute SQL queries
curl -X POST http://localhost:47334/api/sql/query \
  -H "Content-Type: application/json" \
  -d '{"query": "SHOW DATABASES;"}'
```

### MySQL Interface (Port 47335)

```bash
# Connect using MySQL client
mysql -h localhost -P 47335 -u mindsdb -p

# Use in applications
DATABASE_URL="mysql://mindsdb:password@localhost:47335/mindsdb"
```

### MCP Integration (Port 47337)

MindsDB provides MCP (Model Context Protocol) endpoints for AI integration:

- Connect to LibreChat for AI-powered database queries
- Use with MCPHub for unified AI tool access
- Integrate with custom AI applications

## Configuration

### Custom Settings

Edit `./config/mindsdb/mindsdb_config.json`:

```json
{
  "storage_dir": "/root/mdb_storage",
  "log": {
    "level": "INFO"
  },
  "api": {
    "http": {
      "host": "0.0.0.0",
      "port": "47334"
    },
    "mysql": {
      "host": "0.0.0.0",
      "port": "47335"
    }
  }
}
```

### Environment Variables

Configure MindsDB behavior using the active environment file:

```bash
# Check current environment
cat ../../.env    # Shows NX_APP_ENV=dev (or qa/host)

# Edit the active environment file
# Variables loaded from ./config/env/.env.{NX_APP_ENV}
MINDSDB_STORAGE_PATH=/root/mdb_storage
MINDSDB_CONFIG_PATH=/root/mindsdb_config.json

# Database connection (from environment file)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=chatsuite
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin    # Change for qa/host environments
```

## Troubleshooting

### Common Issues

1. **MindsDB not starting**

   ```bash
   # Check container logs
   docker-compose logs mindsdb

   # Verify file permissions
   docker exec chatsuite_mindsdb ls -la /root/mdb_storage
   ```

2. **Cannot connect to data sources**

   - Verify database connectivity from MindsDB container
   - Check firewall and network settings
   - Ensure correct credentials and connection strings

3. **Model training fails**

   - Check data quality and format
   - Verify sufficient disk space
   - Review MindsDB logs for specific errors

4. **Web interface not loading**

   ```bash
   # Test HTTP API directly
   curl http://localhost:47334/api/status

   # Check port availability
   netstat -tulpn | grep 47334
   ```

### Debug Commands

```bash
# Access MindsDB CLI
docker exec -it chatsuite_mindsdb mindsdb

# Check MindsDB version
docker exec chatsuite_mindsdb mindsdb --version

# View MindsDB logs
docker-compose logs mindsdb --tail=100

# Test database connection
docker exec chatsuite_mindsdb nc -z postgres 5432
```

## Service Status

✅ **Working Components:**

- MindsDB web interface on port 47334
- MySQL-compatible API on port 47335
- MCP integration on port 47337
- Data persistence through Docker volumes
- Connection to ChatSuite PostgreSQL database

✅ **Integration Benefits:**

- AI-powered database analytics
- SQL-based machine learning
- Multiple API interfaces (HTTP, MySQL, MCP)
- Integration with existing ChatSuite data
- No-code ML model creation

## Advanced Usage

### Integration with n8n

Create automated workflows that use MindsDB predictions:

1. **n8n Workflow**: Trigger on new customer data
2. **MindsDB Query**: Predict customer churn risk
3. **Action**: Send alert if high risk detected

### Custom ML Models

```sql
-- Create sentiment analysis model
CREATE MODEL sentiment_analyzer
FROM text_data (SELECT text, sentiment FROM training_data)
PREDICT sentiment;

-- Create time series forecasting
CREATE MODEL sales_forecast
FROM sales_data (SELECT date, sales FROM monthly_sales)
PREDICT sales
ORDER BY date
WINDOW 12;
```

### API Integration

```python
import requests

# Query MindsDB via HTTP API
response = requests.post('http://localhost:47334/api/sql/query',
    json={'query': 'SELECT * FROM mindsdb.models;'})
print(response.json())
```

## Security Considerations

### Development Security

- MindsDB exposed only on localhost
- Default credentials for development
- Network isolation through Docker

### Production Security

For production deployment (host environment):

1. **Change default credentials** in `./config/env/.env.host`
2. **Enable SSL/TLS** for all APIs
3. **Set up proper authentication**
4. **Configure firewall rules**
5. **Enable audit logging**
6. **Regular security updates**
7. **Environment separation**: Different credentials for dev/qa/host

## Repository

- **MindsDB Documentation**: https://docs.mindsdb.com/
- **Docker Image**: https://hub.docker.com/r/mindsdb/mindsdb
- **GitHub**: https://github.com/mindsdb/mindsdb
- **SQL Reference**: https://docs.mindsdb.com/sql/
