# LibreChat

Web-based AI chat platform supporting multiple AI models with MCP integration.

## Overview

| Property   | Value                                        |
| ---------- | -------------------------------------------- |
| Container  | `chatsuite_librechat`                        |
| Image      | `ghcr.io/danny-avila/librechat-dev-api:latest` |
| Port       | 3080                                         |
| Network(s) | gateway, librechat_internal                  |
| Data       | `./data/librechat/`                          |
| Depends on | mongodb, mcphub                              |

## Files

- `librechat.yaml` — Main configuration (AI endpoints, MCP servers, interface settings)
- `librechat.example.yaml` — Example configuration template
- `docker-entrypoint-librechat.sh` — Custom startup script
- `Dockerfile` — Custom Docker image build

## Configuration

### API Keys

Add to your active environment file (`config/env/.env.${NX_APP_ENV}`):

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...               # Optional
```

### AI Models

Edit `librechat.yaml` to configure available models:

```yaml
endpoints:
  openAI:
    apiKey: '${OPENAI_API_KEY}'
    models:
      default: ['gpt-4o', 'gpt-4o-mini']
    mcpServers: ['mcphub']
```

### Supported Models

- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-4-turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
- **Google**: Gemini models (with API key)
- **Azure OpenAI**: Enterprise models (with configuration)

## MCP Integration

LibreChat connects to MCP servers via MCPHub at `http://mcphub:3000/mcp`. Available tools depend on configured MCP servers (email, browser, fetch, etc.).

## Data Persistence

| Path                          | Purpose              |
| ----------------------------- | -------------------- |
| `./data/librechat/uploads/`   | Uploaded files       |
| `./data/librechat/images/`    | Generated images     |
| `./data/librechat/logs/`      | Application logs     |
| MongoDB                       | Conversations        |

## Usage

```bash
# Start with dependencies
docker compose up mongodb mcphub librechat -d

# Access
open http://localhost:3080
open https://localhost:10443/librechat/   # Via Nginx proxy
```

First visit: click **Sign up** to create your account.

## Troubleshooting

| Issue                    | Solution                                                           |
| ------------------------ | ------------------------------------------------------------------ |
| AI models not responding | Verify API keys: `grep OPENAI_API_KEY config/env/.env.dev`         |
| Chat history not saving  | Check MongoDB: `docker compose logs mongodb`                       |
| MCP tools missing        | Check MCPHub: `curl http://localhost:3000/health`                  |
| Login issues             | Clear browser cache; check MongoDB connection                      |
| Container not starting   | `docker compose logs librechat`                                    |
