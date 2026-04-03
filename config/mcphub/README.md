# MCPHub

Unified hub for managing multiple Model Context Protocol (MCP) servers with a web interface.

## Overview

| Property   | Value                            |
| ---------- | -------------------------------- |
| Container  | `chatsuite_mcphub`               |
| Image      | `samanhappy/mcphub:latest`       |
| Port       | 3000                             |
| Network(s) | gateway                          |
| Data       | `./data/mcphub/`                 |

## Files

- `mcp_settings.json.example` — Template configuration (tracked in Git)
- `mcp_settings.json` — Active server configuration (gitignored)
- `Dockerfile.custom` — Optional custom image build (alternative to upstream)

## Setup

**Required before first start:**

```bash
# Create your config from the template
cp config/mcphub/mcp_settings.json.example config/mcphub/mcp_settings.json

# Customize as needed
nano config/mcphub/mcp_settings.json

# Start
docker compose up mcphub -d
```

## Configuration

The `mcp_settings.json` file defines which MCP servers MCPHub connects to:

```json
{
  "mcpServers": {
    "zerolib-email": {
      "url": "http://chatsuite_mcp-email-server:9557/sse"
    }
  }
}
```

Only HTTP/SSE-based servers are recommended. Command-based (`uvx`) servers can cause excessive process spawning.

## LibreChat Integration

LibreChat connects to MCPHub at `http://mcphub:3000/mcp` using Streamable HTTP transport. All MCP tools registered in MCPHub are automatically discovered by LibreChat.

## Custom Docker Image (optional)

The default `docker-compose.yaml` pulls the upstream image. If you encounter issues, build the included custom image instead:

```bash
# Option 1: Uncomment build: block in docker-compose.yaml, then:
docker compose build mcphub

# Option 2: Build directly
docker build -t local/mcphub:custom -f config/mcphub/Dockerfile.custom config/mcphub
```

## Usage

```bash
docker compose up mcphub -d
open http://localhost:3000                 # Web interface
open https://localhost:10443/mcphub/       # Via Nginx proxy
```

## Troubleshooting

| Issue                | Solution                                            |
| -------------------- | --------------------------------------------------- |
| Won't start          | `docker compose logs mcphub`; verify `mcp_settings.json` |
| High memory          | Check for runaway processes: `docker top chatsuite_mcphub` |
| Tools missing in chat| Verify health: `curl http://localhost:3000/health`; restart LibreChat |
| Config changes       | `docker compose restart mcphub`                     |
