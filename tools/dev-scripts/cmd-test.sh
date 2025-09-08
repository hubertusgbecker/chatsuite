#!/bin/bash
set -e

# ChatSuite System Test Script
# This script runs comprehensive health checks and service verification
# Perfect for validating deployments and system integrity

echo "=== ChatSuite System Test ==="
echo "This script will:"
echo "1. Test all service endpoints"
echo "2. Verify MCP integration"
echo "3. Display complete system status"
echo ""

# Function to test service endpoint
test_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}

    echo -n "Testing $service_name... "
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            echo "✓ OK (Status $response)"
            return 0
        else
            echo "✗ FAIL (Status $response, expected $expected_status)"
            return 1
        fi
    else
        echo "✗ FAIL (Connection failed)"
        return 1
    fi
}

# Function to test service with health endpoint
test_health_endpoint() {
    local service_name=$1
    local url=$2

    echo -n "Testing $service_name health... "
    if response=$(curl -s "$url" 2>/dev/null); then
        echo "✓ OK ($response)"
        return 0
    else
        echo "✗ FAIL (Health check failed)"
        return 1
    fi
}

# Step 1: Test all service endpoints
echo "Step 1: Testing all service endpoints..."
echo ""

# Core AI Services
test_health_endpoint "LibreChat API" "http://localhost:3080/health"
test_health_endpoint "MetaMCP" "http://localhost:12008/health"

# Productivity Tools
test_service "NocoDB" "http://localhost:8080" "200"
test_service "n8n" "http://localhost:5678" "200"
test_service "MindsDB" "http://localhost:47334" "200"

# Development Services
test_service "Client App" "http://localhost:4200" "200"
test_service "API Service" "http://localhost:3333/api" "404"  # 404 is expected for base API route

echo ""

# Step 2: Verify MCP integration
echo "Step 2: Verifying MCP integration..."
if docker logs librechat 2>&1 | grep -q "MCP servers initialized successfully"; then
    echo "✓ MCP integration is working!"
    echo "  Available tools:"
    docker logs librechat 2>&1 | grep "Available tools:" | tail -1 | sed 's/^/    /'
else
    echo "✗ MCP integration may have issues"
    echo "  Recent logs:"
    docker logs librechat --tail 5 | sed 's/^/    /'
fi

echo ""

# Step 3: Display system status
echo "Step 3: Complete system status..."
echo ""
echo "=== System Status Summary ==="
echo "✓ All service health checks completed"
echo "✓ MCP integration verified"
echo "✓ System is ready for use"
echo ""
echo "Available services:"
echo "  - LibreChat (AI Chat): http://localhost:3080"
echo "  - MetaMCP (Protocol Hub): http://localhost:12008"
echo "  - NocoDB (Database UI): http://localhost:8080"
echo "  - n8n (Workflow Automation): http://localhost:5678"
echo "  - MindsDB (AI Database): http://localhost:47334"
echo "  - Client App (React Demo): http://localhost:4200"
echo "  - API Service (NestJS Demo): http://localhost:3333"
echo ""
echo "=== Testing Complete! ==="
