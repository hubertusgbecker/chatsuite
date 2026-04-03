# MinIO

S3-compatible high-performance object storage for files, images, backups, and unstructured data.

## Overview

| Property   | Value                     |
| ---------- | ------------------------- |
| Container  | `chatsuite_minio`         |
| Image      | `minio/minio:latest`      |
| Port(s)    | 9000 (API), 9001 (Console) |
| Network(s) | gateway                   |
| Data       | `./data/minio/`           |

## Usage

```bash
docker compose up minio -d
open http://localhost:9001                   # Console UI
open https://localhost:10443/minio/          # Via Nginx proxy
```

### Default Credentials

Set via environment variables in `config/env/.env.${NX_APP_ENV}`:

- `MINIO_ROOT_USER` (default: `admin`)
- `MINIO_ROOT_PASSWORD` (default: `minioadmin123`)

**Change these for production.**

## Integration Examples

### Python (boto3)

```python
import boto3
from botocore.client import Config

s3 = boto3.client('s3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='admin',
    aws_secret_access_key='minioadmin123',
    config=Config(signature_version='s3v4'),
)
s3.upload_file('local.txt', 'my-bucket', 'remote.txt')
```

### Node.js (AWS SDK)

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  credentials: { accessKeyId: 'admin', secretAccessKey: 'minioadmin123' },
  forcePathStyle: true,
});
```

### MinIO Client (mc)

```bash
mc alias set myminio http://localhost:9000 admin minioadmin123
mc mb myminio/my-bucket
mc cp local-file.txt myminio/my-bucket/
mc ls myminio/my-bucket/
```

## Health Check

```bash
curl -f http://localhost:9000/minio/health/live
```

## Monitoring

MinIO exposes Prometheus metrics at `http://localhost:9000/minio/v2/metrics/cluster`.

## Troubleshooting

```bash
docker compose logs minio                        # Container logs
docker exec chatsuite_minio mc admin info local  # Server info
```
