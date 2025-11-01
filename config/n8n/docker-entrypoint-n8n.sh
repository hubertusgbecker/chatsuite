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

# Install system libraries required by Chromium if running as root (Alpine) - idempotent
if [ "$(id -u)" -eq 0 ] && command -v apk >/dev/null 2>&1; then
    CHROME_DEPS_MARKER="/var/tmp/.chromium_deps_installed"
    if [ ! -f "$CHROME_DEPS_MARKER" ]; then
        echo "[Puppeteer] Installing system shared libraries for Chromium (Alpine)..."
        # Package list compiled from runtime errors + provided snippet
        APK_CHROMIUM_DEPS="chromium nss nspr freetype harfbuzz ca-certificates ttf-freefont ttf-liberation \
            atk at-spi2-core at-spi2-atk pango cairo gdk-pixbuf dbus-libs cups-libs alsa-lib glib gobject-introspection \
            libx11 libxcomposite libxdamage libxrandr libxi libxcursor libxtst libxext libxfixes libxkbcommon libxcb \
            libdrm mesa-gl mesa-dri-gallium udev eudev-libs libgcc libstdc++"
        # Install with best-effort; continue if some optional packages unavailable
        for pkg in $APK_CHROMIUM_DEPS; do
            if ! apk info -e "$pkg" >/dev/null 2>&1; then
                apk add --no-cache "$pkg" || echo "[Puppeteer] Warning: failed to install $pkg"
            fi
        done
        # Symlink convenience
        ln -sf /usr/bin/chromium-browser /usr/bin/chromium 2>/dev/null || true
        touch "$CHROME_DEPS_MARKER"
    else
        echo "[Puppeteer] Chromium dependencies already installed (marker present)"
    fi
    export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
    export PUPPETEER_SKIP_DOWNLOAD=true
fi

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
  echo "[Puppeteer] No system chromium binary found after dependency install attempts."
  echo "[Puppeteer] Headless browser tasks will fail until chromium is available."
fi

echo "[Puppeteer] Final PUPPETEER_EXECUTABLE_PATH: ${PUPPETEER_EXECUTABLE_PATH:-<none>}"

echo "Configuring SSL support..."
# Normalize N8N_HOST: strip leading scheme if present to avoid duplicated schemes in URLs
if [ -n "${N8N_HOST:-}" ]; then
    # Remove leading http:// or https:// if user accidentally included it
    SANITIZED_N8N_HOST="$(echo "$N8N_HOST" | sed -E 's~^https?://~~i')"
    export N8N_HOST="$SANITIZED_N8N_HOST"
fi

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

# Database backend enforcement & migration support
SQLITE_FILE="$N8N_DATA_DIR/database.sqlite"
MIGRATION_MARKER="$N8N_DATA_DIR/.sqlite_exported"
if [ "${N8N_DB_TYPE}" = "postgresdb" ]; then
    # Validate required Postgres vars
    REQUIRED_VARS="N8N_DB_POSTGRESDB_HOST N8N_DB_POSTGRESDB_PORT N8N_DB_POSTGRESDB_DATABASE N8N_DB_POSTGRESDB_USER N8N_DB_POSTGRESDB_PASSWORD N8N_DB_POSTGRESDB_SCHEMA"
    MISSING=""
    for v in $REQUIRED_VARS; do
        eval val="\${$v}" || val=""
        if [ -z "$val" ]; then
            MISSING="$MISSING $v"
        fi
    done
    if [ -n "$MISSING" ]; then
        echo "[DB] ERROR: Postgres backend selected (N8N_DB_TYPE=postgresdb) but missing required vars:$MISSING"
        echo "[DB] Please set them in your environment files before restarting. Aborting startup to prevent silent SQLite fallback."
        exit 1
    fi
    # If a legacy SQLite file exists and not yet exported, perform a one-time export backup
    if [ -f "$SQLITE_FILE" ] && [ ! -f "$MIGRATION_MARKER" ]; then
        echo "[Migration] Detected legacy SQLite database at $SQLITE_FILE"
        BACKUP_DIR="$N8N_DATA_DIR/sqlite-backup"
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d-%H%M%S)
        echo "[Migration] Creating backup copy before Postgres initialization..."
        cp "$SQLITE_FILE" "$BACKUP_DIR/database.sqlite.$TIMESTAMP" || echo "[Migration] Warning: could not copy SQLite file"
        # Attempt automated export of workflows & credentials using internal n8n CLI if available
        if command -v n8n >/dev/null 2>&1; then
            echo "[Migration] Exporting existing workflows & credentials via CLI..."
            EXPORT_DIR="$BACKUP_DIR/exports-$TIMESTAMP"
            mkdir -p "$EXPORT_DIR"
            set +e
            n8n export:workflow --all --output="$EXPORT_DIR/workflows.json" >/dev/null 2>&1 && echo "[Migration] Workflows exported to $EXPORT_DIR/workflows.json" || echo "[Migration] Workflow export failed (will need manual export)"
            n8n export:credentials --all --output="$EXPORT_DIR/credentials.json" >/dev/null 2>&1 && echo "[Migration] Credentials exported to $EXPORT_DIR/credentials.json" || echo "[Migration] Credential export failed (will need manual export)"
            set -e
        else
            echo "[Migration] n8n CLI not available for export at this stage. Restart after enabling Postgres to perform manual export if needed."
        fi
        touch "$MIGRATION_MARKER"
        echo "[Migration] SQLite export phase completed. Files stored under $BACKUP_DIR"
        echo "[Migration] Remove $MIGRATION_MARKER to re-run export if necessary."
    fi
else
    echo "[DB] Using default SQLite backend (N8N_DB_TYPE not set to postgresdb)."
    echo "[DB] To migrate: set N8N_DB_TYPE=postgresdb and corresponding N8N_DB_POSTGRESDB_* vars, then restart."
fi

# Check if n8n command exists and what commands are available
if command -v n8n >/dev/null 2>&1; then
    echo "n8n binary found, checking available commands..."

    # Try to get help to see available commands
    if n8n --help >/dev/null 2>&1; then
        echo "n8n help available, attempting to start..."

        # If no arguments provided, try to start n8n
        if [ $# -eq 0 ]; then
            echo "No arguments provided, trying 'n8n start'..."
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
