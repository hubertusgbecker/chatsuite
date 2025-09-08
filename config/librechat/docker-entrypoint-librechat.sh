#!/bin/sh
# LibreChat Docker Entrypoint Script
# Ensures MCP tools are properly installed and configured on every container start
# This is essential for consistent deployments across different environments

set -e

echo "[INFO] Starting LibreChat initialization with MCP integration..."

# Create required directories
echo "[INFO] Creating required directories..."
mkdir -p /app/api/logs
mkdir -p /app/uploads
mkdir -p /app/client/public/images

# Wait for MCPHub service to be available
echo "[INFO] Waiting for MCPHub service..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if wget -q --spider http://mcphub:3000/health >/dev/null 2>&1; then
        echo "[INFO] MCPHub service is ready!"
        break
    elif wget -q --spider http://mcphub:3000 >/dev/null 2>&1; then
        echo "[INFO] MCPHub service is ready!"
        break
    fi
    echo "[INFO] Attempt $attempt/$max_attempts: MCPHub not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "[WARN] MCPHub service not available, continuing anyway..."
fi

# Install MCP tools (essential for consistent deployment)
echo "[INFO] Installing MCP tools..."

# Install Python and pip if not available
if ! command -v python3 >/dev/null 2>&1; then
    echo "[INFO] Installing Python..."
    apk add --no-cache python3 py3-pip
else
    echo "[INFO] Python is already available"
fi

# Install uv (modern Python package manager)
if ! command -v uv >/dev/null 2>&1; then
    echo "[INFO] Installing uv..."
    pip install --break-system-packages uv
    export PATH="/root/.local/bin:$PATH"
else
    echo "[INFO] uv is already available"
fi

# Install MCP Python package
echo "[INFO] Installing MCP Python package..."
pip install --break-system-packages mcp || echo "[WARN] MCP package may already be installed"

# Verify uvx is available
if ! command -v uvx >/dev/null 2>&1; then
    echo "[INFO] Adding uv to PATH..."
    export PATH="/root/.local/bin:$PATH"
fi

# Test mcp-proxy availability
echo "[INFO] Testing mcp-proxy availability..."
if uvx mcp-proxy --help >/dev/null 2>&1; then
    echo "[INFO] ✓ mcp-proxy is available via uvx"
else
    echo "[INFO] mcp-proxy will be installed on first use by uvx"
fi

# Set up proper permissions for directories
echo "[INFO] Setting up directory permissions..."
if [ -w /app/api/logs ]; then
    chown -R node:node /app/api/logs 2>/dev/null || true
    chmod -R 755 /app/api/logs 2>/dev/null || true
fi

if [ -w /app/uploads ]; then
    chown -R node:node /app/uploads 2>/dev/null || true
    chmod -R 755 /app/uploads 2>/dev/null || true
fi

if [ -w /app/client/public/images ]; then
    chown -R node:node /app/client/public/images 2>/dev/null || true
    chmod -R 755 /app/client/public/images 2>/dev/null || true
fi

# Set environment variables for Node.js
echo "[INFO] Setting up Node.js environment..."
export NODE_TLS_REJECT_UNAUTHORIZED=0
export PATH="/root/.local/bin:$PATH"

echo "[INFO] LibreChat MCP initialization complete!"
echo "[INFO] Available MCP configuration:"
echo "  - MCPHub endpoint: http://mcphub:3000"
echo "  - Python tools: $(python3 --version 2>/dev/null || echo 'Not available')"
echo "  - UV package manager: $(uv --version 2>/dev/null || echo 'Not available')"

# Execute the main application command
echo "[INFO] Starting LibreChat application..."
echo "[INFO] Executing original entrypoint: docker-entrypoint.sh $@"
exec docker-entrypoint.sh "$@"
