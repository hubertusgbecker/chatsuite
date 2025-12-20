docker-compose up client-app api-customer-service n8n -d
docker-compose up nginx -d
docker-compose up -d

# Nginx Reverse Proxy

This directory contains configuration and helper files for the Nginx reverse proxy used by ChatSuite.

This README is aligned with `repomix-output.xml` (repository manifest) and the current `docker-compose.yaml` in the repository. Use those files as the source of truth for runtime configuration.

## Overview

Nginx acts as the main reverse proxy and TLS termination point for ChatSuite. In development it exposes HTTPS on port `10443` and routes requests to backend services by URL path.

## How Nginx Is Defined (docker-compose)

Key runtime facts (from `docker-compose.yaml`):

- **Service name**: `nginx`
- **Container name**: `chatsuite_nginx`
- **Build**: `config/nginx/Dockerfile.dev`
- **Published port**: `10443` (HTTPS)
- **Networks**: `gateway`
- **Depends on**: `client-app`, `api-customer-service`, `n8n`, `pgadmin`
- **Healthcheck**: verifies HTTPS on `127.0.0.1:10443`

## Files

- `config/nginx/Dockerfile.dev` — build instructions for the development proxy image
- `config/nginx/default.dev.conf` — Nginx server configuration used in development
- `config/certificates/` — directory for TLS certificates used by Nginx

## SSL Certificates

Development uses self-signed certificates placed under `./config/certificates/`:

- `./config/certificates/localhost-crt.pem`
- `./config/certificates/localhost-key.pem`

For production (host) environment, replace these with CA-signed certificates and update `./config/env/.env.host` and the Nginx configuration as needed.

## Common Commands

Start the proxy (after starting backends):

```bash
# start dependent services first
docker-compose up -d client-app api-customer-service n8n pgadmin

# then start nginx
docker-compose up -d nginx

# or start everything
docker-compose up -d
```

Test connectivity:

```bash
curl -k https://localhost:10443/
curl -k https://localhost:10443/api/health
```

## Routing Overview

Examples of proxy routes (see `config/nginx/default.dev.conf` for exact mappings):

- `https://localhost:10443/` → `client-app:4200`
- `https://localhost:10443/api/` → `api-customer-service:3333`
- `https://localhost:10443/n8n/` → `n8n:5678`
- `https://localhost:10443/nocodb/` → `nocodb:8080`
- `https://localhost:10443/pgadmin/` → `pgadmin:80`

## Troubleshooting

- Check Nginx logs:

```bash
docker-compose logs nginx
```

- Validate configuration inside the running container:

```bash
docker exec chatsuite_nginx nginx -t
docker exec chatsuite_nginx nginx -s reload
```

If you see certificate warnings in your browser, this is expected with self-signed certs; replace with proper CA-signed certs in production.

## Production Notes

For production deployments update certificate paths, enable automated certificate renewal (Let's Encrypt or other), and tighten proxy/security settings (rate limiting, WAF, IP whitelisting).

## Troubleshooting

### Common Issues

1. **Certificate warnings in browser**

   - This is expected with self-signed certificates
   - Click "Advanced" → "Proceed to localhost"
   - For production, use proper SSL certificates

2. **Service not reachable**

   ```bash
   # Check Nginx status
   docker-compose logs nginx

   # Verify backend services are running
   docker-compose ps

   # Test specific service connectivity
   curl -k https://localhost:10443/api/health
   ```

3. **SSL/TLS errors**

   - Verify certificate files exist and are readable
   - Check certificate validity dates
   - Ensure proper file permissions

4. **Proxy errors (502/503/504)**
   - Check if backend services are healthy
   - Verify network connectivity between containers
   - Review Nginx error logs

### Debug Commands

```bash
# Check Nginx configuration
docker exec chatsuite_nginx nginx -t

# Reload Nginx configuration
docker exec chatsuite_nginx nginx -s reload

# View Nginx access logs
docker-compose logs nginx | grep "GET\|POST"

# Test backend connectivity from Nginx container
docker exec chatsuite_nginx curl http://client-app:4200
docker exec chatsuite_nginx curl http://api-customer-service:3333/health
```

## Service Status

### **Working Components:**

- HTTPS reverse proxy on port 10443
- SSL certificate handling
- Service routing and load balancing
- Security headers and CORS
- WebSocket proxy support

### **Integration Benefits:**

- Single HTTPS entry point for all services
- SSL termination and security
- Unified routing and service discovery
- Development-friendly configuration
- Production-ready security headers

## Production Considerations

### SSL Certificates

For production deployment (host environment):

1. Obtain proper SSL certificates from a Certificate Authority
2. Replace self-signed certificates in `./config/certificates/`
3. Update certificate paths in `./config/env/.env.host`
4. Update certificate paths in Nginx configuration
5. Set up automatic certificate renewal (Let's Encrypt)

### Security Enhancements

- Enable rate limiting for API endpoints
- Add IP whitelisting for admin interfaces
- Implement WAF (Web Application Firewall) rules
- Configure proper logging and monitoring

### Performance Optimization

- Enable gzip compression for static assets
- Configure proper caching headers
- Implement connection pooling
- Set up load balancing for multiple instances

## Configuration Files

### Nginx Configuration

Edit `./config/nginx/default.dev.conf` to:

- Add new service routes
- Modify security settings
- Configure caching policies
- Add custom headers

### Docker Configuration

Edit `./config/nginx/Dockerfile.dev` to:

- Update Nginx version
- Add additional modules
- Include custom configurations
- Set up monitoring tools

## Repository

- **Nginx Documentation**: https://nginx.org/en/docs/
- **Reverse Proxy Guide**: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/
- **SSL Configuration**: https://nginx.org/en/docs/http/configuring_https_servers.html
