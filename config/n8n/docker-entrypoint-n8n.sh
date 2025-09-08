#!/bin/sh
# n8n startup script with conditional SSL support
set -e

echo "Starting n8n with conditional SSL support..."

# Check if SSL certificates exist and are readable
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
echo "  Host: $N8N_HOST"
echo "  Port: $N8N_PORT"
echo "  Database: $N8N_DB_POSTGRESDB_HOST"
echo "  SSL: $([ "$N8N_PROTOCOL" = "https" ] && echo "Enabled" || echo "Disabled")"

# Start n8n with the original arguments
exec "$@"
