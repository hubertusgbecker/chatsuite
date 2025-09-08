#!/bin/bash
set -e

# Skip permission changes for macOS compatibility
echo "Starting PostgreSQL initialization for ChatSuite monorepo..."

# Set PostgreSQL environment variables
export PGDATA="${PGDATA:-/var/lib/postgresql/data}"

# Remove any leftover pid file
rm -f "$PGDATA/postmaster.pid"

# Initialize database if it doesn't exist
if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database cluster..."
    # Run as postgres user
    gosu postgres initdb

    echo "Starting PostgreSQL for initial setup..."
    gosu postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses=''" -w start

    echo "Running ChatSuite database initialization..."
    # Run our custom database initialization script
    gosu postgres bash /docker-entrypoint-initdb.d/init-databases.sh

    echo "Stopping PostgreSQL after initialization..."
    gosu postgres pg_ctl -D "$PGDATA" -m fast -w stop

    echo "Database initialization complete!"
fi

# Start PostgreSQL as postgres user
echo "Starting PostgreSQL server..."
exec gosu postgres postgres
