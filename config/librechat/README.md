# LibreChat Integration

This directory contains the configuration for LibreChat, a free and open-source AI chat platform, integrated into the ChatSuite monorepo.

## Overview

LibreChat provides a web-based interface for multiple AI models including OpenAI GPT, Anthropic Claude, and others. It features conversation management, user authentication, and Model Context Protocol (MCP) integration for enhanced functionality.

## Configuration

### Files Structure

- `./config/librechat/librechat.example.yaml` - Example configuration file
- `./config/librechat/librechat.yaml` - Main configuration file (edit this)
- `./config/librechat/docker-entrypoint-librechat.sh` - Custom startup script
- `./config/librechat/Dockerfile` - Custom Docker image configuration
- `./data/librechat/` - Data persistence directory

### Docker Service

The service is configured in `docker-compose.yaml` as:

- **Container**: `chatsuite_librechat`
- **Image**: `ghcr.io/danny-avila/librechat-dev-api:latest`
- **Port**: 3080
- **Networks**: gateway
- **Dependencies**: mongodb, mcphub

## Setup Guide

### 1. Configure API Keys

Check which environment is active and edit the corresponding environment file:

```bash
# Check current environment
cat ../../.env    # Should show NX_APP_ENV=dev (or qa/host)

# Edit the active environment file
nano ../../config/env/.env.dev    # For development (default)
# nano ../../config/env/.env.qa   # For QA environment
# nano ../../config/env/.env.host # For production environment
```

Add your API keys to the active environment file:

```bash
# OpenAI API Key (required for GPT models)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key (required for Claude models)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Other AI providers
GOOGLE_API_KEY=your_google_api_key
AZURE_OPENAI_API_KEY=your_azure_key
```

### 2. Start the Service

```bash
# Start all dependencies (MongoDB, MCPHub)
docker-compose up mongodb mcphub -d

# Start LibreChat
docker-compose up librechat -d

# Or start everything at once
docker-compose up -d
```

### 3. Access LibreChat

Open your browser and go to: `http://localhost:3080`

### 4. Create Your Account

1. Click "Sign up" on the LibreChat login page
2. Enter your email and password
3. Complete registration and log in

## Features

### AI Model Support

- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo
- **Anthropic**: Claude-3.5-sonnet, Claude-3.5-haiku, Claude-3-opus
- **Google**: Gemini models (with API key)
- **Azure OpenAI**: Enterprise models (with configuration)

### MCP Integration

LibreChat integrates with Model Context Protocol servers via MCPHub:

- **Email Server**: Send and manage emails through AI chat
- **Time Server**: Get current time and date information
- **Fetch Server**: Retrieve web content and APIs
- **Custom Servers**: Add your own MCP servers via MCPHub

### Data Persistence

- **Conversations**: Stored in MongoDB
- **Files**: Uploaded files in `./data/librechat/uploads/`
- **Images**: Generated images in `./data/librechat/images/`
- **Logs**: Application logs in `./data/librechat/logs/`

## Configuration

### Basic Settings

Edit `./config/librechat/librechat.yaml` to customize:

```yaml
# Enable conversation caching
cache: true

# Configure AI endpoints
endpoints:
  openAI:
    apiKey: '${OPENAI_API_KEY}'
    models:
      default: ['gpt-4o', 'gpt-4o-mini']
    mcpServers: ['mcphub'] # Enable MCP integration

# Customize interface
interface:
  customWelcome: 'Welcome to ChatSuite LibreChat!'
```

### Advanced Configuration

For advanced users, you can:

1. Add custom AI endpoints
2. Configure authentication providers (Google, GitHub, etc.)
3. Set up conversation templates
4. Configure file upload limits
5. Add custom branding

## MCP Server Configuration

LibreChat connects to MCP servers through MCPHub. To add new MCP capabilities:

1. Configure the server in `./config/mcphub/mcp_settings.json`
2. Add the server reference to `librechat.yaml`:

```yaml
endpoints:
  openAI:
    mcpServers: ['mcphub'] # This enables all MCPHub servers
```

## Troubleshooting

### Common Issues

1. **Cannot connect to AI models**

   - Check your API keys in the active environment file:
     ```bash
     cat ../../.env  # Check which environment is active
     grep OPENAI_API_KEY ../../config/env/.env.${NX_APP_ENV:-dev}
     ```
   - Verify internet connectivity
   - Check API rate limits

2. **Chat history not saving**

   - Ensure MongoDB is running: `docker-compose logs mongodb`
   - Check volume mounts for data persistence

3. **MCP features not working**

   - Verify MCPHub is running: `docker-compose logs mcphub`
   - Check MCP server status in MCPHub web interface

4. **Login/Registration issues**
   - Clear browser cache and cookies
   - Check MongoDB connection
   - Verify user permissions

### Debug Mode

Enable debug logging by setting environment variables:

```bash
DEBUG=true
LOG_LEVEL=debug
```

### Container Logs

Check LibreChat logs:

```bash
docker-compose logs librechat
```

## Service Status

### **Working Components:**

- LibreChat web interface on port 3080
- MongoDB database integration
- MCP server integration via MCPHub
- File upload and image generation
- Conversation persistence

### **Integration Benefits:**

- Unified AI chat interface
- Multiple model support
- MCP protocol for tool integration
- Persistent conversation history
- User authentication and management

## Repository

- **Source**: https://github.com/danny-avila/LibreChat
- **Documentation**: https://www.librechat.ai/docs
- **MCP Documentation**: https://modelcontextprotocol.io/

## Security Notes

1. **API Keys**: Never commit API keys to version control
2. **Environment Files**: Use different API keys for dev, qa, and host environments
3. **Network Access**: LibreChat is exposed only on localhost by default
4. **File Uploads**: Configure upload limits based on your needs
5. **User Management**: Set up proper authentication for production use
6. **Environment Switching**: Change environment via root `.env` file (`NX_APP_ENV=dev/qa/host`)
