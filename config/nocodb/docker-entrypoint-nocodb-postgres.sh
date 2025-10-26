#!/bin/bash
set -e

# NocoDB PostgreSQL Database Initialization Script
# This script ensures the NocoDB database is properly set up with the correct user and permissions

echo "=== NocoDB PostgreSQL Database Initialization ==="

# Function to create database if it doesn't exist
create_database_if_not_exists() {
    local dbname=$1
    local owner=${2:-$POSTGRES_USER}

    echo "Checking if database '$dbname' exists..."
    if psql -U "$POSTGRES_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$dbname"; then
        echo "Database '$dbname' already exists"
    else
        echo "Creating database '$dbname' with owner '$owner'..."
        psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE \"$dbname\" OWNER \"$owner\";"
        echo "Database '$dbname' created successfully"
    fi
}

# Function to create user if it doesn't exist
create_user_if_not_exists() {
    local username=$1
    local password=$2

    echo "Checking if user '$username' exists..."
    if psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$username'" | grep -q 1; then
        echo "User '$username' already exists"
        # Update password in case it changed
        psql -U "$POSTGRES_USER" -d postgres -c "ALTER USER \"$username\" WITH PASSWORD '$password';"
    else
        echo "Creating user '$username'..."
        psql -U "$POSTGRES_USER" -d postgres -c "CREATE USER \"$username\" WITH PASSWORD '$password';"
        echo "User '$username' created successfully"
    fi
}

echo "Starting NocoDB database initialization..."

# Ensure PostgreSQL is running and ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -U "$POSTGRES_USER" -d postgres; do
    echo "PostgreSQL is not ready yet, waiting..."
    sleep 2
done
echo "PostgreSQL is ready!"

# Create NocoDB specific user and database
echo "=== Setting up NocoDB database and user ==="
create_user_if_not_exists "${NOCODB_DB_USER}" "${NOCODB_DB_PASSWORD}"
create_database_if_not_exists "${NOCODB_DB_NAME}" "${NOCODB_DB_USER}"

# Grant necessary permissions to NocoDB user
echo "Granting permissions to ${NOCODB_DB_USER}..."
psql -U "$POSTGRES_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"${NOCODB_DB_NAME}\" TO \"${NOCODB_DB_USER}\";"
psql -U "$POSTGRES_USER" -d "${NOCODB_DB_NAME}" -c "GRANT ALL ON SCHEMA public TO \"${NOCODB_DB_USER}\";"
psql -U "$POSTGRES_USER" -d "${NOCODB_DB_NAME}" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO \"${NOCODB_DB_USER}\";"
psql -U "$POSTGRES_USER" -d "${NOCODB_DB_NAME}" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO \"${NOCODB_DB_USER}\";"

# List databases for verification
echo "=== NocoDB database setup complete! ==="
echo "Available databases:"
psql -U "$POSTGRES_USER" -d postgres -l

echo "=== NocoDB database initialization finished successfully ==="
