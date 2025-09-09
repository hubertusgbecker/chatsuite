# MCPHub Integration

This directory contains the configuration for MCPHub, a unified hub for managing multiple Model Context Protocol (MCP) servers in the ChatSuite monorepo.

## Overview

MCPHub serves as a central management platform for MCP servers, providing a web interface to configure, monitor, and manage various MCP integrations. It acts as a bridge between AI applications like LibreChat and specialized MCP servers.

## Configuration

### Files Structure
- `./config/mcphub/mcp_settings.json` - MCP server configuration file
- `./data/mcphub/` - Data persistence directory

### Docker Service
The service is configured in `docker-compose.yaml` as:
- **Container**: `chatsuite_mcphub`
- **Image**: `samanhappy/mcphub:latest`
- **Port**: 3000
- **Networks**: gateway
- **Dependencies**: mcp-email-server

## Setup Guide

### 1. Start the Service
```bash
# Start MCP email server first (dependency)
docker-compose up mcp-email-server -d

# Start MCPHub
docker-compose up mcphub -d

# Or start both together
docker-compose up mcphub mcp-email-server -d
```

### 2. Access MCPHub
Open your browser and go to: `http://localhost:3000`

### 3. Configure MCP Servers
The MCP servers are pre-configured in `mcp_settings.json`. You can add more servers through the web interface or by editing the configuration file.

## Features

### Pre-configured MCP Servers
MCPHub comes with these MCP servers ready to use:

1. **Time Server**
   - Provides current time and date functions
   - Uses: `uvx mcp-server-time`

2. **Fetch Server**
   - Fetches content from web URLs and APIs
   - Uses: `uvx mcp-server-fetch`

3. **Email Server**
   - IMAP and SMTP email functionality
   - Connects to: `http://chatsuite_mcp-email-server:9557/sse`

### Web Management Interface
- **Server Status**: View running status of all MCP servers
- **Configuration**: Add, edit, and remove MCP servers
- **Logs**: Monitor server logs and performance
- **Testing**: Test MCP server functionality directly

## Configuration

### Adding New MCP Servers
Edit `./config/mcphub/mcp_settings.json`:

```json
{
  "mcpServers": {
    "time": {
      "command": "uvx",
      "args": ["mcp-server-time"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    },
    "zerolib-email": {
      "url": "http://chatsuite_mcp-email-server:9557/sse"
    },
    "your-new-server": {
      "command": "node",
      "args": ["/path/to/your/server.js"]
    }
  }
}
```

### Server Types
MCPHub supports different types of MCP servers:

1. **Command-based**: Servers run as subprocess commands
2. **URL-based**: Servers accessed via HTTP/SSE endpoints
3. **Docker-based**: Servers running in separate containers

## Usage in LibreChat

MCPHub integrates with LibreChat automatically. In your LibreChat configuration:

```yaml
endpoints:
  openAI:
    mcpServers: ["mcphub"]  # This enables all MCPHub servers
```

All MCP tools will then be available in your AI conversations.

## Available MCP Tools

### Time Tools
- **get_current_time**: Get current date and time
- **get_timezone**: Get timezone information
- **format_date**: Format dates in different formats

### Fetch Tools
- **fetch_url**: Download content from web URLs
- **fetch_api**: Make API requests to external services
- **parse_html**: Extract content from HTML pages

### Email Tools
- **send_email**: Send emails via SMTP
- **list_emails**: List emails from IMAP accounts
- **search_emails**: Search through email content

## Troubleshooting

### Common Issues

1. **MCPHub not starting**
   ```bash
   # Check container status
   docker-compose logs mcphub
   
   # Verify dependencies are running
   docker-compose ps mcp-email-server
   ```

2. **MCP servers not responding**
   - Check server status in MCPHub web interface
   - Verify network connectivity between containers
   - Review MCP server logs

3. **Configuration not loading**
   - Verify JSON syntax in `mcp_settings.json`
   - Restart MCPHub container after configuration changes
   - Check file permissions

4. **LibreChat integration issues**
   - Ensure MCPHub is running before starting LibreChat
   - Verify MCPHub reference in LibreChat configuration
   - Check network connectivity on gateway network

### Debug Commands
```bash
# Check MCPHub status and logs
docker-compose logs mcphub

# Test MCPHub web interface
curl -I http://localhost:3000

# Restart MCPHub after configuration changes
docker-compose restart mcphub

# Check MCP server processes inside container
docker exec chatsuite_mcphub ps aux
```

## Service Status

### **Working Components:**
- MCPHub web interface on port 3000
- Time server integration
- Fetch server integration
- Email server integration via SSE
- Docker socket access for container management

### **Integration Benefits:**
- Centralized MCP server management
- Web-based configuration interface
- Automatic server discovery and monitoring
- Easy integration with AI applications
- Extensible architecture for custom servers

## Advanced Configuration

### Custom MCP Servers
To add your own MCP server:

1. Create your MCP server following the protocol specification
2. Add it to `mcp_settings.json`
3. Restart MCPHub
4. Test the server in the web interface

### Environment Variables
You can customize MCPHub behavior with environment variables in the active environment file:
```bash
# Check current environment
cat ../../.env    # Shows NX_APP_ENV=dev (or qa/host)

# Edit environment file: ./config/env/.env.{NX_APP_ENV}
NODE_ENV=production         # Set production mode
MCP_LOG_LEVEL=debug        # Enable debug logging (dev environment)
MCP_SERVER_TIMEOUT=30000   # Set server timeout (ms)
```

### Volume Mounts
- `/app/mcp_settings.json` - Configuration file
- `/app/data` - Persistent data storage
- `/var/run/docker.sock` - Docker socket for container management

## Repository

- **Source**: https://github.com/samanbrohana/mcphub
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Documentation**: Available in the web interface

## Security Notes

1. **Docker Socket**: MCPHub has access to Docker socket - use carefully in production
2. **Network Access**: Servers can make external HTTP requests
3. **File Access**: MCP servers may have file system access
4. **Configuration**: Protect `mcp_settings.json` from unauthorized access
