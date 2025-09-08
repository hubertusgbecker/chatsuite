#!/usr/bin/env bash

# ChatSuite Environment Security Verification Script
# Verifies that critical security settings are correctly configured

set -e

cd "$(dirname "$0")/../.."  # Go to project root

echo "🔐 ChatSuite Environment Security Verification"
echo "================================================"

# Get current environment
CURRENT_ENV=$(node tools/dev-scripts/cmd-resolve-env.js)
echo "📋 Current environment: $CURRENT_ENV"

# Source the environment file
ENV_FILE="./config/env/.env.$CURRENT_ENV"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ ERROR: Environment file $ENV_FILE does not exist!"
    exit 1
fi

echo "📁 Using environment file: $ENV_FILE"
echo ""

# Check critical security settings
echo "🔍 Checking security settings..."

# Check ALLOW_REGISTRATION
ALLOW_REG=$(grep "^ALLOW_REGISTRATION=" "$ENV_FILE" | cut -d'=' -f2 | tr -d ' ')
echo "   ALLOW_REGISTRATION=$ALLOW_REG"

if [ "$CURRENT_ENV" = "host" ] && [ "$ALLOW_REG" = "true" ]; then
    echo "❌ CRITICAL SECURITY ISSUE: ALLOW_REGISTRATION=true in host environment!"
    echo "   This allows unauthorized user registration in production!"
    echo "   Fix: Set ALLOW_REGISTRATION=false in $ENV_FILE"
    exit 1
elif [ "$CURRENT_ENV" = "qa" ] && [ "$ALLOW_REG" = "true" ]; then
    echo "⚠️  WARNING: ALLOW_REGISTRATION=true in QA environment!"
    echo "   Consider setting to false for QA security"
fi

# Check domain configuration for production
if [ "$CURRENT_ENV" = "host" ]; then
    echo ""
    echo "🌐 Checking domain configuration for production..."

    DOMAIN_CLIENT=$(grep "^DOMAIN_CLIENT=" "$ENV_FILE" | cut -d'=' -f2 | tr -d ' ')
    DOMAIN_SERVER=$(grep "^DOMAIN_SERVER=" "$ENV_FILE" | cut -d'=' -f2 | tr -d ' ')

    echo "   DOMAIN_CLIENT=$DOMAIN_CLIENT"
    echo "   DOMAIN_SERVER=$DOMAIN_SERVER"

    if [[ "$DOMAIN_CLIENT" == *"localhost"* ]] || [[ "$DOMAIN_CLIENT" == *"http://"* ]]; then
        echo "⚠️  WARNING: DOMAIN_CLIENT appears to be configured for development"
        echo "   Consider using HTTPS production domain"
    fi

    if [[ "$DOMAIN_SERVER" == *"localhost"* ]] || [[ "$DOMAIN_SERVER" == *"http://"* ]]; then
        echo "⚠️  WARNING: DOMAIN_SERVER appears to be configured for development"
        echo "   Consider using HTTPS production domain"
    fi
fi

echo ""
echo "✅ Security verification completed"

# Summary
if [ "$CURRENT_ENV" = "host" ] && [ "$ALLOW_REG" = "false" ]; then
    echo "🎯 Production environment is correctly configured for security"
elif [ "$CURRENT_ENV" = "dev" ]; then
    echo "🔧 Development environment detected - development settings are acceptable"
elif [ "$CURRENT_ENV" = "qa" ]; then
    echo "🧪 QA environment detected - review settings as needed"
else
    echo "⚠️  Environment configuration should be reviewed"
fi
