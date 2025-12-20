# MCP Email Server Integration

This directory contains the configuration for the MCP Email Server integration in the ChatSuite monorepo.

## Overview

The MCP Email Server provides IMAP and SMTP functionality via the Model Context Protocol (MCP). It runs as a pure Docker container in SSE (Server-Sent Events) mode for optimal integration.

## Configuration

### Files Structure

- `./config/mcp-email-server/config.example.toml` - Example configuration file for email accounts
- `./config/mcp-email-server/config.toml` - Actual configuration file (git-ignored)
- `./data/mcp-email-server/` - Data persistence directory

### Docker Service

The service is configured in `docker-compose.yaml` as:

- **Container**: `chatsuite_mcp-email-server`
- **Image**: `ghcr.io/ai-zerolab/mcp-email-server:latest`
- **Port**: 9557 (SSE server endpoint)
- **Networks**: gateway
- **Mode**: Server-Sent Events (SSE) for MCP protocol communication

### MCPHub Integration

MCPHub is available at `http://localhost:3000` and currently includes time and fetch servers. The email server runs independently and can be integrated as needed.

## Usage

### Starting the Service

```bash
docker-compose up mcp-email-server
```

### MCP Endpoint

The MCP server is available at `http://localhost:9557/sse` using Server-Sent Events transport.

### Configuration

1. Copy the example configuration: `cp config.example.toml config.toml`
2. Edit `config.toml` to add your email accounts
3. Restart the container to apply changes: `docker-compose restart mcp-email-server`

## MCP Client Configuration

For direct MCP client access using SSE transport:

```json
{
  "mcpServers": {
    "zerolib-email": {
      "transport": {
        "type": "sse",
        "url": "http://localhost:9557/sse"
      }
    }
  }
}
```

For stdio-based MCP clients (direct container execution):

```json
{
  "mcpServers": {
    "zerolib-email": {
      "command": "docker",
      "args": ["exec", "chatsuite_mcp-email-server", "uv", "run", "mcp-email-server", "stdio"]
    }
  }
}
```

## Service Status

✅ **Working Components:**

- MCP Email Server container running on port 9557
- SSE endpoint accessible and responding correctly
- MCPHub running independently on port 3000
- Docker volume mounts for config and data persistence

✅ **Integration Benefits:**

- Pure Docker deployment - no code dependencies in monorepo
- Persistent configuration through mounted volumes
- Network isolation through Docker networking
- Independent scaling and management

## Troubleshooting

1. **Container not starting**: Check Docker logs with `docker-compose logs mcp-email-server`
2. **Configuration issues**: Verify the `config.toml` file syntax
3. **Network connectivity**: Ensure the container can reach email servers (check firewall/proxy settings)
4. **SSE endpoint issues**: Test with `curl -I http://localhost:9557/sse`

## Repository

- **Source**: https://github.com/ai-zerolab/mcp-email-server
- **Documentation**: https://ai-zerolab.github.io/mcp-email-server/
