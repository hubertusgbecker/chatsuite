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

# Chromium / Puppeteer setup (pull image scenario)
echo "[Puppeteer] Checking for Chromium availability..."

# Preferred system paths
SYSTEM_PATHS="/usr/bin/chromium-browser /usr/bin/chromium /usr/bin/google-chrome /usr/bin/google-chrome-stable"
FOUND_SYSTEM_BROWSER=""
for p in $SYSTEM_PATHS; do
    if [ -x "$p" ]; then
        FOUND_SYSTEM_BROWSER="$p"; break; fi
done

if [ -n "$FOUND_SYSTEM_BROWSER" ]; then
    export PUPPETEER_EXECUTABLE_PATH="$FOUND_SYSTEM_BROWSER"
    echo "[Puppeteer] Using system browser at $PUPPETEER_EXECUTABLE_PATH"
else
    # User-level download (no root perms required) using @puppeteer/browsers
    echo "[Puppeteer] No system browser found. Attempting user-space fetch..."
    BROWSER_CACHE_DIR="${N8N_DATA_DIR}/.cache/puppeteer"
    mkdir -p "$BROWSER_CACHE_DIR"
    export PUPPETEER_CACHE_DIR="$BROWSER_CACHE_DIR"
    # Try fetch only if npx & node available
    if command -v node >/dev/null 2>&1 && command -v npx >/dev/null 2>&1; then
        # Fetch stable chrome (chromium) with retries
        if [ ! -f "$BROWSER_CACHE_DIR/INSTALL_DONE" ]; then
            echo "[Puppeteer] Downloading Chromium to $BROWSER_CACHE_DIR (this may take a while)..."
            npx --yes @puppeteer/browsers install chrome@stable --path "$BROWSER_CACHE_DIR" --platform=linux || \
                npx --yes @puppeteer/browsers install chromium@stable --path "$BROWSER_CACHE_DIR" --platform=linux || echo "[Puppeteer] Warning: download failed"
            # Mark attempt regardless to avoid repeated heavy downloads; remove this file to force re-attempt
            touch "$BROWSER_CACHE_DIR/INSTALL_DONE"
        else
            echo "[Puppeteer] Cached browser install marker found; skipping download"
        fi
        # Discover executable
        DL_EXE=$(find "$BROWSER_CACHE_DIR" -type f -name chrome -o -name chromium-browser -o -name chromium 2>/dev/null | head -1 || true)
        if [ -n "$DL_EXE" ]; then
            chmod +x "$DL_EXE" 2>/dev/null || true
            export PUPPETEER_EXECUTABLE_PATH="$DL_EXE"
            echo "[Puppeteer] Using downloaded browser at $PUPPETEER_EXECUTABLE_PATH"
        else
            echo "[Puppeteer] No downloadable browser executable found. Headless tasks may fail."
        fi
    else
        echo "[Puppeteer] npx not available; cannot download Chromium."
    fi
fi

echo "[Puppeteer] Final PUPPETEER_EXECUTABLE_PATH: ${PUPPETEER_EXECUTABLE_PATH:-<none>}"

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
                        # If running as root and apk present, install chromium dependencies (one-time per container)
                        if [ "$(id -u)" -eq 0 ] && command -v apk >/dev/null 2>&1; then
                            echo "Installing Chromium runtime dependencies via apk..."
                            apk add --no-cache \
                                chromium nss freetype harfbuzz ca-certificates ttf-freefont \
                                atk dbus-libs cups-libs alsa-lib pango cairo libx11 libxcomposite \
                                libxdamage libxext libxfixes libxrandr libxkbcommon libdrm libgcc libstdc++ ttf-liberation || echo "Warning: Some chromium deps failed to install"
                            export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
                        fi
                        # Drop privileges if currently root (needs su-exec or gosu; attempt both)
                        if [ "$(id -u)" -eq 0 ]; then
                            if command -v su-exec >/dev/null 2>&1; then
                                echo "Starting n8n as node user via su-exec"
                                exec su-exec node n8n start
                            elif command -v gosu >/dev/null 2>&1; then
                                echo "Starting n8n as node user via gosu"
                                exec gosu node n8n start
                            else
                                echo "su-exec/gosu not found; running n8n as root (not recommended)"
                                exec n8n start
                            fi
                        else
                            exec n8n start
                        fi
        else
            echo "Arguments provided: $@"
                        if [ "$(id -u)" -eq 0 ] && command -v su-exec >/dev/null 2>&1; then
                            exec su-exec node n8n "$@"
                        elif [ "$(id -u)" -eq 0 ] && command -v gosu >/dev/null 2>&1; then
                            exec gosu node n8n "$@"
                        else
                            exec n8n "$@"
                        fi
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
