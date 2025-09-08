#!/bin/bash
set -e

# ChatSuite Complete System Rebuild Script
# This script rebuilds the entire platform from a fresh state
# Perfect for deployment preparation and clean environment setup

echo "=== ChatSuite System Rebuild ==="
echo "This script will:"
echo "1. Stop all containers"
echo "2. Pull latest images"
echo "3. Start all services"
echo "4. Wait for core services initialization"
echo ""

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local health_check=$2
    local max_attempts=${3:-30}
    local attempt=1

    echo "Waiting for $service_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if eval "$health_check" >/dev/null 2>&1; then
            echo "✓ $service_name is ready!"
            return 0
        fi
        echo "  Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "✗ ERROR: $service_name failed to become ready after $max_attempts attempts"
    return 1
}

# Step 1: Complete rebuild
echo "Step 1: Rebuilding entire system..."
docker-compose down
docker-compose pull
docker-compose up -d

# Step 2: Wait for core services
echo ""
echo "Step 2: Waiting for core services to initialize..."
wait_for_service "PostgreSQL" "docker exec postgres pg_isready -U admin"
wait_for_service "MetaMCP" "curl -f http://localhost:12008/health"
wait_for_service "LibreChat API" "curl -f http://localhost:3080/health"

# Step 3: Wait for MCP integration
echo ""
echo "Step 3: Waiting for MCP integration..."
sleep 15

echo ""
echo "=== Rebuild Complete! ==="
echo "✓ All services rebuilt and started"
echo "✓ Core services are ready"
echo "✓ System ready for testing"
echo ""
echo "Next steps:"
echo "  - Run 'pnpm test' to verify all services"
echo "  - Or run 'pnpm rebuild && pnpm test' for complete workflow"
echo ""
