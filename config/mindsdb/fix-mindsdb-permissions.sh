#!/bin/bash
# Fix permissions for MindsDB data directory on macOS/Linux
# Usage: ./fix-mindsdb-permissions.sh

set -e

MINDSDB_DATA_DIR="./data/mindsdb"

if [ ! -d "$MINDSDB_DATA_DIR" ]; then
  echo "Creating $MINDSDB_DATA_DIR ..."
  mkdir -p "$MINDSDB_DATA_DIR"
fi

chown -R root "$MINDSDB_DATA_DIR"
chmod -R 777 "$MINDSDB_DATA_DIR"

echo "Permissions fixed for $MINDSDB_DATA_DIR."
