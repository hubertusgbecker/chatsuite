#!/bin/sh
# Comprehensive n8n entrypoint with SSL support, permission fixes, and command handling
set -e

echo "n8n entrypoint: Starting with args: $@"

# Ensure the n8n data directory exists and has correct permissions
N8N_DATA_DIR="/home/node/.n8n"
echo "Checking n8n data directory: $N8N_DATA_DIR"

# Create the directory if it doesn't exist
if [ ! -d "$N8N_DATA_DIR" ]; then
    echo "Creating n8n data directory: $N8N_DATA_DIR"
    mkdir -p "$N8N_DATA_DIR"
fi

# Get current user info
CURRENT_USER=$(id -u)
CURRENT_GROUP=$(id -g)
echo "Current user: $CURRENT_USER, group: $CURRENT_GROUP"

# Fix ownership and permissions for n8n data directory
echo "Setting ownership and permissions for n8n data directory..."

# Comprehensive permission fixing - handles both root and non-root scenarios
echo "Fixing permissions comprehensively..."

# Always ensure subdirectories exist first
mkdir -p "$N8N_DATA_DIR/workflows" "$N8N_DATA_DIR/credentials" "$N8N_DATA_DIR/logs" "$N8N_DATA_DIR/nodes"

if [ "$(id -u)" -eq 0 ]; then
    echo "Running as root, setting optimal ownership and permissions..."
    # Set ownership to node user and group
    chown -R node:node "$N8N_DATA_DIR" 2>/dev/null || echo "Warning: Could not change ownership"
    # Set permissions to allow full access
    chmod -R 755 "$N8N_DATA_DIR" 2>/dev/null || echo "Warning: Could not set 755 permissions"
else
    echo "Running as user $CURRENT_USER, attempting comprehensive permission fix..."

    # Try to set liberal permissions to ensure access
    chmod -R 777 "$N8N_DATA_DIR" 2>/dev/null || \
    chmod -R 755 "$N8N_DATA_DIR" 2>/dev/null || \
    echo "Warning: Could not set permissions, trying to continue anyway..."

    # Test if directory is now accessible
    if [ -w "$N8N_DATA_DIR" ] && [ -r "$N8N_DATA_DIR" ]; then
        echo "✅ n8n data directory is accessible by current user"
    else
        echo "⚠️  Warning: Permission issues detected, but continuing startup..."
        echo "   If n8n fails to start, you may need to run: docker-compose restart n8n"
    fi
fi

# Verify final permissions
echo "Final permission check:"
ls -la "$N8N_DATA_DIR" | head -5 || echo "Could not list directory contents"

echo "Permission setup completed for n8n data directory"

# Optional: Install Chromium for Puppeteer-based workflows if not already present
echo "Checking for Chromium browser for Puppeteer..."
if [ -z "${PUPPETEER_EXECUTABLE_PATH}" ]; then
    # Default path for Alpine chromium package
    export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
fi

# Install chromium only if executable missing
if [ ! -x "$PUPPETEER_EXECUTABLE_PATH" ]; then
    echo "Chromium not found at $PUPPETEER_EXECUTABLE_PATH. Attempting installation..."
    # Detect package manager (Alpine vs Debian/Ubuntu). Base n8n image is Alpine as of n8nio/n8n:latest.
    if command -v apk >/dev/null 2>&1; then
        echo "Installing chromium and fonts via apk..."
        apk add --no-cache \
            chromium \
            nss \
            freetype \
            harfbuzz \
            ca-certificates \
            ttf-freefont || {
              echo "Failed to install chromium dependencies via apk"; exit 1; }
    elif command -v apt-get >/dev/null 2>&1; then
        echo "Installing chromium and fonts via apt-get (Debian/Ubuntu variant)..."
        apt-get update && apt-get install -y \
            chromium \
            fonts-liberation \
            libnss3 \
            libfreetype6 \
            libharfbuzz0b \
            ca-certificates && \
            rm -rf /var/lib/apt/lists/* || {
              echo "Failed to install chromium dependencies via apt-get"; exit 1; }
        # On Debian family chromium path may differ
        [ -x /usr/bin/chromium ] && export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
    else
        echo "Unsupported package manager for automatic chromium installation. Skipping."
    fi
else
    echo "Chromium already present at $PUPPETEER_EXECUTABLE_PATH"
fi
echo "PUPPETEER_EXECUTABLE_PATH set to: $PUPPETEER_EXECUTABLE_PATH"

# Configure SSL support if certificates are available
echo "Configuring SSL support..."
if [ -f "/certs/localhost-key.pem" ] && [ -f "/certs/localhost-crt.pem" ]; then
    echo "SSL certificates found, enabling HTTPS..."
    export N8N_PROTOCOL=https
    export N8N_SECURE_COOKIE=true
    export N8N_SSL_KEY=/certs/localhost-key.pem
    export N8N_SSL_CERT=/certs/localhost-crt.pem
    export WEBHOOK_URL=https://${N8N_HOST:-localhost}:${N8N_PORT:-5678}
    export N8N_EDITOR_BASE_URL=https://${N8N_HOST:-localhost}:${N8N_PORT:-5678}
else
    echo "SSL certificates not found, running in HTTP mode..."
    export N8N_PROTOCOL=http
    export N8N_SECURE_COOKIE=false
    unset N8N_SSL_KEY
    unset N8N_SSL_CERT
    export WEBHOOK_URL=http://${N8N_HOST:-localhost}:${N8N_PORT:-5678}
    export N8N_EDITOR_BASE_URL=http://${N8N_HOST:-localhost}:${N8N_PORT:-5678}
fi

echo "n8n configuration:"
echo "  Protocol: $N8N_PROTOCOL"
echo "  Host: ${N8N_HOST:-localhost}"
echo "  Port: ${N8N_PORT:-5678}"
echo "  Database: $N8N_DB_POSTGRESDB_HOST"
echo "  SSL: $([ "$N8N_PROTOCOL" = "https" ] && echo "Enabled" || echo "Disabled")"

# Check if n8n command exists and what commands are available
if command -v n8n >/dev/null 2>&1; then
    echo "n8n binary found, checking available commands..."

    # Try to get help to see available commands
    if n8n --help >/dev/null 2>&1; then
        echo "n8n help available, attempting to start..."

        # If no arguments provided, try to start n8n
        if [ $# -eq 0 ]; then
            echo "No arguments provided, trying 'n8n start'..."
            exec n8n start
        else
            echo "Arguments provided: $@"
            exec n8n "$@"
        fi
    else
        echo "n8n help not available, trying direct execution..."
        exec n8n "$@"
    fi
else
    echo "ERROR: n8n binary not found in PATH"
    echo "Available binaries:"
    ls -la /usr/local/bin/ | grep n8n || echo "No n8n binaries found"
    exit 1
fi
