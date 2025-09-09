# Nginx Reverse Proxy Int### SSL Certificates
The system uses different certificates based on environment:

**Development (.env.dev):**
- Self-signed certificates for localhost
- `./config/certificates/localhost-crt.pem`
- `./config/certificates/localhost-key.pem`

**Production (.env.host):**
- Proper SSL certificates from Certificate Authority
- Configure paths in `./config/env/.env.host`
- Update certificate references in nginx configurationtion

This directory contains the configuration for Nginx reverse proxy server in the ChatSuite monorepo.

## Overview

Nginx serves as the main reverse proxy and SSL termination point for all ChatSuite services. It provides a unified HTTPS entry point and routes requests to the appropriate backend services.

## Configuration

### Files Structure
- `./config/nginx/Dockerfile.dev` - Development Docker image
- `./config/nginx/default.dev.conf` - Nginx server configuration
- `./config/certificates/` - SSL certificates directory

### Docker Service
The service is configured in `docker-compose.yaml` as:
- **Container**: `chatsuite_nginx`
- **Build**: Custom image with SSL support
- **Port**: 10443 (HTTPS)
- **Networks**: gateway
- **Dependencies**: client-app, api-customer-service, n8n

## Setup Guide

### 1. SSL Certificates
The system uses self-signed certificates for development. They should already be in place:
- `./config/certificates/localhost-crt.pem` - SSL certificate
- `./config/certificates/localhost-key.pem` - SSL private key

### 2. Start the Service
```bash
# Start all backend services first
docker-compose up client-app api-customer-service n8n -d

# Start Nginx
docker-compose up nginx -d

# Or start everything at once
docker-compose up -d
```

### 3. Access Services
Open your browser and go to: `https://localhost:10443`

**Note**: You'll see a security warning due to self-signed certificates. Click "Advanced" and "Proceed to localhost" to continue.

## Service Routing

Nginx routes requests to different services based on URL paths:

### Main Application
- **URL**: `https://localhost:10443/`
- **Backend**: React client app (port 4200)
- **Description**: Main ChatSuite web interface

### API Endpoints
- **URL**: `https://localhost:10443/api/`
- **Backend**: NestJS API service (port 3333)
- **Description**: Customer service API endpoints

### Workflow Automation
- **URL**: `https://localhost:10443/n8n/`
- **Backend**: n8n workflow engine (port 5678)
- **Description**: Workflow automation interface

### Database Management
- **URL**: `https://localhost:10443/nocodb/`
- **Backend**: NocoDB (port 8080)
- **Description**: Database GUI and API builder

### Admin Tools
- **URL**: `https://localhost:10443/pgadmin/`
- **Backend**: PgAdmin (port 80)
- **Description**: PostgreSQL administration

## Configuration Details

### SSL/TLS Settings
- **Protocol**: TLS 1.2 and 1.3
- **Ciphers**: Modern security standards
- **HSTS**: HTTP Strict Transport Security enabled
- **Certificate**: Self-signed for development

### Proxy Settings
- **Timeouts**: 60 seconds for backend connections
- **Buffer Size**: Optimized for API responses
- **Headers**: Proper forwarding of client information
- **WebSocket**: Support for real-time connections

### Security Headers
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin

## Development Features

### Hot Reload Support
Nginx is configured to support development hot reload:
- React app changes are reflected immediately
- API changes restart the backend service
- Nginx configuration can be updated without container rebuild

### CORS Handling
Cross-Origin Resource Sharing is properly configured:
- API endpoints accept requests from the frontend
- WebSocket connections are supported
- Development tools can access APIs

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
