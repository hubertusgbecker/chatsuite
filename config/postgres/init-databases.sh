#!/bin/bash
set -e

# Comprehensive database initialization for ChatSuite monorepo
# This script ensures all required databases and users are created automatically

echo "=== ChatSuite Database Initialization Script ==="

# Function to create database if it doesn't exist
create_database_if_not_exists() {
    local dbname=$1
    local owner=${2:-$POSTGRES_USER}

    echo "Checking if database '$dbname' exists..."
    if psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$dbname"; then
        echo "Database '$dbname' already exists"
    else
        echo "Creating database '$dbname' with owner '$owner'..."
        psql -U "$POSTGRES_USER" -c "CREATE DATABASE \"$dbname\" OWNER \"$owner\";"
        echo "Database '$dbname' created successfully"
    fi
}

# Function to create user if it doesn't exist
create_user_if_not_exists() {
    local username=$1
    local password=$2

    echo "Checking if user '$username' exists..."
    if psql -U "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$username'" | grep -q 1; then
        echo "User '$username' already exists"
    else
        echo "Creating user '$username'..."
        psql -U "$POSTGRES_USER" -c "CREATE USER \"$username\" WITH PASSWORD '$password';"
        echo "User '$username' created successfully"
    fi
}

echo "Starting database initialization..."

# Ensure PostgreSQL is running and ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -U "$POSTGRES_USER" -d postgres; do
    echo "PostgreSQL is not ready yet, waiting..."
    sleep 2
done
echo "PostgreSQL is ready!"

# Create main application database
echo "=== Setting up main application database ==="
create_database_if_not_exists "chatsuite"

# Create MetaMCP database and user
echo "=== Setting up MetaMCP database ==="
create_user_if_not_exists "metamcp_user" "m3t4mcp_pass"
create_database_if_not_exists "metamcp_db" "metamcp_user"

# Grant necessary permissions to MetaMCP user
echo "Granting permissions to metamcp_user..."
psql -U "$POSTGRES_USER" -c "GRANT ALL PRIVILEGES ON DATABASE \"metamcp_db\" TO \"metamcp_user\";"
psql -U "$POSTGRES_USER" -d "metamcp_db" -c "GRANT ALL ON SCHEMA public TO \"metamcp_user\";"

# Create NocoDB database
echo "=== Setting up NocoDB database ==="
create_database_if_not_exists "nocodb"

# List all databases for verification
echo "=== Database setup complete! ==="
echo "Available databases:"
psql -U "$POSTGRES_USER" -l

echo "=== Database initialization finished successfully ==="
