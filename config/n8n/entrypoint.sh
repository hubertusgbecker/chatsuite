#!/bin/sh
# Simple n8n entrypoint that handles different command scenarios
set -e

echo "n8n entrypoint: Starting with args: $@"

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
