# MCPHub Integration - WORKING WITH CUSTOM BUILD

**STATUS: FULLY OPERATIONAL**

This directory contains the configuration for MCPHub, a unified hub for managing multiple Model Context Protocol (MCP) servers. The official Docker image had critical bugs, so we use a custom-built image.

## Preparation - Required Before First Start

**IMPORTANT**: Before starting MCPHub for the first time, you must create your configuration file:

```bash
# Copy the example configuration to create your settings file
cp config/mcphub/mcp_settings.json.example config/mcphub/mcp_settings.json
```

**Why is this required?**
- `mcp_settings.json` contains your personal MCP server configuration
- This file is **not** tracked in version control (similar to `.env` files)
- Each installation needs its own configuration based on available MCP servers
- The `.example` file provides a template with recommended defaults

**What's included in the example?**
- Pre-configured MCP servers: time, fetch, zerolib-email, mcp-browser-use-server
- Proper URLs for both internal (Docker) and external (host machine) MCP servers
- User authentication configuration with example credentials

After copying, you can customize `mcp_settings.json` to:
- Add or remove MCP servers based on your needs
- Update URLs if you change server ports
- Configure user authentication
- Adjust keep-alive intervals

## Current Status

MCPHub integration is available in ChatSuite. By default the Compose configuration uses the upstream image `samanhappy/mcphub:latest` defined in `docker-compose.yaml`. A custom Dockerfile is included in this repository as an optional alternative if you need to build a local image (see "Optional Custom Docker Image" below).

The MCPHub service in this repository is configured to run and connect to available MCP servers (for example `zerolib-email`). If you run into issues with the upstream image you can build and use the provided custom image instead.

## Architecture

### Optional Custom Docker Image
This repository includes `config/mcphub/Dockerfile.custom` as an optional, local Dockerfile you can use if you encounter problems with the upstream image. The default `docker-compose.yaml` uses the remote image `samanhappy/mcphub:latest`; you do not need to build the custom image to run ChatSuite.

Why include a custom Dockerfile?
- It provides a reproducible build that you can tweak locally (for example to pin versions or install extra debugging tools).
- If you encounter runtime issues with the upstream image, the custom image gives an alternative path for operators to test and deploy.

Key details of the optional custom image:
- Location: `config/mcphub/Dockerfile.custom`
- Base: Python slim image with Node.js installed
- Installs `@samanhappy/mcphub` and exposes port `3000`

See the "Maintenance" section below for build and usage instructions.

## Configuration

### Files Structure
- `./config/mcphub/mcp_settings.json.example` - Template configuration file (tracked in git)
- `./config/mcphub/mcp_settings.json` - Your active configuration (not tracked in git)
- `./config/mcphub/Dockerfile.custom` - Custom Docker image build
- `./data/mcphub/` - Data persistence directory

**Note**: Always edit `mcp_settings.json` for your configuration. The `.example` file is only a template and should not be modified directly.

### Docker Service (CUSTOM BUILD)
The service is configured in `docker-compose.yaml` as:
- **Container**: `chatsuite_mcphub`
- **Build**: Custom from `config/mcphub/Dockerfile.custom`
- **Port**: 3000
- **Networks**: gateway
- **Health**: HTTP check on `/health` endpoint

## MCP Server Configuration

Currently configured MCP servers in `mcp_settings.json`:
```json
{
  "mcpServers": {
    "zerolib-email": {
      "url": "http://chatsuite_mcp-email-server:9557/sse"
    }
  }
}
```

### Why Only Email Server?
The `uvx`-based servers (time, fetch) caused the original fork bomb issue. We use only HTTP/SSE-based servers which don't require runtime installation.

## Integration

### LibreChat Integration
LibreChat successfully connects to MCPHub and discovers all MCP tools:
- **Endpoint**: `http://mcphub:3000/mcp`
- **Transport**: Streamable HTTP (SSE)
- **Tools Detected**: 5 email tools from zerolib-email server

### Available Tools
1. `zerolib-email-list_available_accounts` - List configured email accounts
2. `zerolib-email-add_email_account` - Add new email account
3. `zerolib-email-list_emails_metadata` - List email metadata
4. `zerolib-email-get_emails_content` - Get email content
5. `zerolib-email-send_email` - Send emails

## Performance

Performance of MCPHub depends on which image you run and the MCP servers you attach. The upstream image usually works fine; if you see excessive resource usage, consider switching to the optional custom image (see Maintenance). Monitor container metrics and logs to determine the best option for your environment.

## Maintenance

### Rebuilding or Using the Custom Image (Optional)
By default the Compose file pulls the upstream `samanhappy/mcphub:latest` image. If you prefer to build the included custom image, you can do one of the following:

1) Build using Docker Compose (uncomment the `build:` block in `docker-compose.yaml`):

```bash
# Edit docker-compose.yaml: uncomment the build: context and dockerfile lines for the mcphub service
docker-compose build mcphub
docker-compose up -d mcphub
```

2) Build directly with Docker (local image tag):

```bash
docker build -t local/mcphub:custom -f config/mcphub/Dockerfile.custom config/mcphub
docker run -d --name chatsuite_mcphub -p 3000:3000 \
  -v $(pwd)/config/mcphub/mcp_settings.json:/app/mcp_settings.json:rw \
  -v $(pwd)/data/mcphub:/app/data local/mcphub:custom
```

### Updating MCP Servers
Edit your local `config/mcphub/mcp_settings.json` and restart the mcphub service:

```bash
docker-compose restart mcphub
```

### Checking Logs
```bash
docker logs chatsuite_mcphub
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Troubleshooting

### If MCPHub won't start
1. Check logs: `docker logs chatsuite_mcphub`
2. Verify config: `cat config/mcphub/mcp_settings.json`
3. Rebuild image: `docker-compose build mcphub`
4. Check dependencies: Ensure mcp-email-server is healthy

### If memory usage increases
1. Check for runaway processes: `docker top chatsuite_mcphub`
2. Restart container: `docker-compose restart mcphub`
3. Review MCP server config for command-based servers

### If tools don't appear in LibreChat
1. Verify MCPHub is healthy: `curl http://localhost:3000/health`
2. Check LibreChat logs for MCP connection
3. Restart LibreChat: `docker-compose restart librechat`

## Future Improvements

### Adding More MCP Servers
To add HTTP/SSE-based servers (recommended):
```json
{
  "mcpServers": {
    "zerolib-email": {
      "url": "http://chatsuite_mcp-email-server:9557/sse"
    },
    "your-new-server": {
      "url": "http://your-server:port/sse"
    }
  }
}
```

### Command-based Servers (Use with Caution)
Only add if absolutely necessary and test thoroughly:
```json
{
  "mcpServers": {
    "test-server": {
      "command": "node",
      "args": ["path/to/server.js"]
    }
  }
}
```

**Avoid**: `uvx`, `npx`, or `pnpm` based servers that install on startup.

## Summary

MCPHub is now fully operational using a custom Docker build that:
- ✅ Eliminates the fork bomb issue from the official image
- ✅ Uses minimal memory (57MB vs 16GB)
- ✅ Successfully connects to MCP Email Server
- ✅ Provides tools to LibreChat
- ✅ Passes health checks
- ✅ Runs stably without errors
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
