# MinIO Integration

This directory contains the configuration for MinIO, a high-performance object storage system integrated into the ChatSuite monorepo.

## Overview

MinIO is an S3-compatible object storage solution that provides enterprise-grade storage capabilities. It's ideal for storing and serving files, images, videos, backups, and any unstructured data with high availability and performance.

## Configuration

### Files Structure

- `./config/minio/` - MinIO configuration directory
- `./data/minio/` - Data persistence directory (physical folder)

### Docker Service

The service is configured in `docker-compose.yaml` as:

- **Container**: `chatsuite_minio`
- **Image**: `minio/minio:latest`
- **Ports**:
  - 9000 (API)
  - 9001 (Console UI)
- **Networks**: gateway
- **Volume**: `./data/minio` for data persistence

## Setup Guide

### 1. Start the Service

```bash
# Start MinIO
docker-compose up minio -d

# Check if it's running
docker-compose ps minio
```

### 2. Access MinIO Console

Open your browser and go to:

- **Console UI**: `http://localhost:9001`
- **API Endpoint**: `http://localhost:9000`
- **Via Nginx Proxy**: `https://localhost:10443/minio/` (Console)

### 3. Default Credentials

The default credentials are set via environment variables:

- **Username**: Value from `MINIO_ROOT_USER` in `.env.${NX_APP_ENV}`
- **Password**: Value from `MINIO_ROOT_PASSWORD` in `.env.${NX_APP_ENV}`

**IMPORTANT**: Change these credentials in production!

### 4. First Time Setup

1. Log in to the MinIO console at `http://localhost:9001`
2. Create buckets for your applications
3. Set up access policies and users
4. Configure bucket versioning and lifecycle rules as needed

## Features

### Object Storage Capabilities

- **S3-Compatible API**: Drop-in replacement for Amazon S3
- **High Performance**: Fast read/write operations
- **Bucket Management**: Organize data into logical buckets
- **Access Control**: Fine-grained IAM policies and bucket policies
- **Versioning**: Keep multiple versions of objects
- **Lifecycle Management**: Automate data retention and expiration
- **Event Notifications**: Trigger workflows on object events
- **Encryption**: Server-side and client-side encryption support

## Integration Examples

### Python (boto3)

```python
import boto3
from botocore.client import Config

s3 = boto3.client('s3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='admin',
    aws_secret_access_key='minioadmin123',
    config=Config(signature_version='s3v4')
)

# Upload a file
s3.upload_file('local-file.txt', 'my-bucket', 'remote-file.txt')

# Download a file
s3.download_file('my-bucket', 'remote-file.txt', 'downloaded-file.txt')
```

### Node.js (AWS SDK)

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localhost:9000',
  accessKeyId: 'admin',
  secretAccessKey: 'minioadmin123',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

// Upload a file
const params = {
  Bucket: 'my-bucket',
  Key: 'remote-file.txt',
  Body: fileContent,
};
s3.upload(params, (err, data) => {
  if (err) console.error(err);
  else console.log('Upload success:', data);
});
```

### cURL

```bash
# Create a bucket
mc alias set myminio http://localhost:9000 admin minioadmin123
mc mb myminio/my-bucket

# Upload a file
mc cp local-file.txt myminio/my-bucket/

# List objects
mc ls myminio/my-bucket/
```

## Common Use Cases

1. **Media Storage**: Store images, videos, and documents for web applications
2. **Backup Storage**: Store database backups, log archives, and snapshots
3. **Data Lake**: Build a data lake for analytics and machine learning
4. **Static Website Hosting**: Serve static websites directly from buckets
5. **CI/CD Artifacts**: Store build artifacts and deployment packages
6. **LibreChat Integration**: Store chat attachments, images, and files

## Security Best Practices

1. **Change Default Credentials**: Always change `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`
2. **Use IAM Policies**: Create specific users with minimal required permissions
3. **Enable HTTPS**: Use the nginx proxy for encrypted connections in production
4. **Bucket Policies**: Set restrictive bucket policies for sensitive data
5. **Enable Encryption**: Use server-side encryption for sensitive buckets
6. **Audit Logs**: Enable audit logging for compliance and monitoring
7. **Network Isolation**: Keep MinIO on internal networks when possible

## Health Check

MinIO includes a built-in health check endpoint:

```bash
curl -f http://localhost:9000/minio/health/live
```

The docker-compose configuration includes automatic health checks.

## Environment Variables

Configure MinIO behavior via environment variables in `.env.${NX_APP_ENV}`:

- `MINIO_ROOT_USER`: Root username (default: admin)
- `MINIO_ROOT_PASSWORD`: Root password (default: minioadmin123)
- `MINIO_BROWSER`: Enable/disable web console (default: on)
- `MINIO_DOMAIN`: Domain name for virtual-host-style requests
- `MINIO_SERVER_URL`: Public URL for the MinIO server

## Monitoring

### Check Service Status

```bash
# View container logs
docker logs chatsuite_minio

# Check health
docker exec chatsuite_minio mc admin info local

# View server info
docker exec chatsuite_minio mc admin info local --json
```

### Prometheus Metrics

MinIO exposes Prometheus metrics at:

```
http://localhost:9000/minio/v2/metrics/cluster
```

## Data Persistence

All MinIO data is stored in `./data/minio/` which is mounted to `/data` inside the container. This directory contains:

- Object data
- Bucket metadata
- Configuration files
- Access logs

**IMPORTANT**: Back up this directory regularly for disaster recovery.

## Troubleshooting

### MinIO Won't Start

1. Check if port 9000 or 9001 is already in use
2. Verify directory permissions for `./data/minio`
3. Check Docker logs: `docker logs chatsuite_minio`

### Cannot Access Console

1. Verify the service is running: `docker ps | grep minio`
2. Check if port 9001 is accessible
3. Try accessing via nginx proxy: `https://localhost:10443/minio/`

### Permission Denied Errors

```bash
# Fix permissions
sudo chown -R $(id -u):$(id -g) ./data/minio
```

### Reset MinIO

```bash
# Stop and remove container
docker-compose down minio

# Clear data (WARNING: This deletes all data!)
rm -rf ./data/minio/*

# Restart
docker-compose up minio -d
```

## References

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [MinIO Console Guide](https://min.io/docs/minio/linux/administration/minio-console.html)
- [S3 API Compatibility](https://min.io/docs/minio/linux/developers/python/API.html)
- [MinIO Admin Guide](https://min.io/docs/minio/linux/administration/minio-admin.html)

## Integration with ChatSuite Services

MinIO can be integrated with other ChatSuite services:

- **LibreChat**: Store chat attachments and user uploads
- **n8n**: Use as storage backend for workflow artifacts
- **NocoDB**: Store file attachments from database records
- **API Services**: Store user-generated content and files
- **Client App**: Upload and download files via S3-compatible API

## Next Steps

1. Create buckets for your applications
2. Set up appropriate IAM users and policies
3. Configure lifecycle rules for data retention
4. Enable versioning for critical buckets
5. Set up bucket replication for high availability (enterprise feature)
6. Configure event notifications to trigger workflows
