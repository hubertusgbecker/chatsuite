# MCP Email Server

IMAP and SMTP email functionality exposed via the Model Context Protocol (MCP) over Server-Sent Events.

## Overview

| Property   | Value                                        |
| ---------- | -------------------------------------------- |
| Container  | `chatsuite_mcp-email-server`                 |
| Image      | `ghcr.io/ai-zerolab/mcp-email-server:latest` |
| Port       | 9557 (SSE)                                   |
| Network(s) | gateway                                      |
| Data       | `./data/mcp-email-server/`                   |

## Files

- `config.example.toml` — Example email account configuration (tracked in Git)
- `config.toml` — Active configuration with credentials (gitignored)

## Setup

```bash
# Create config from template
cp config/mcp-email-server/config.example.toml config/mcp-email-server/config.toml

# Edit with your email account details
nano config/mcp-email-server/config.toml

# Start the service
docker compose up mcp-email-server -d
```

## MCP Endpoint

The server exposes an SSE endpoint at `http://localhost:9557/sse`.

### Client Configuration (SSE)

```json
{
  "mcpServers": {
    "zerolib-email": {
      "transport": { "type": "sse", "url": "http://localhost:9557/sse" }
    }
  }
}
```

### Client Configuration (stdio)

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

## Available MCP Tools

| Tool                        | Purpose                          |
| --------------------------- | -------------------------------- |
| `list_available_accounts`   | List configured email accounts   |
| `add_email_account`         | Add new email account            |
| `list_emails_metadata`      | List email metadata              |
| `get_emails_content`        | Retrieve email content           |
| `send_email`                | Send emails                      |

## Troubleshooting

```bash
docker compose logs mcp-email-server           # Container logs
curl -I http://localhost:9557/sse               # Test SSE endpoint
cat config/mcp-email-server/config.toml         # Verify config syntax
```

## References

- Source: https://github.com/ai-zerolab/mcp-email-server
- Docs: https://ai-zerolab.github.io/mcp-email-server/
