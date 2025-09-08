#!/bin/sh
set -e


# Ensure persistent data directory exists
if [ ! -d "/root/mdb_storage" ]; then
  mkdir -p /root/mdb_storage
fi


# Copy default config if not present
if [ ! -f "/root/mindsdb_config.json" ] && [ -f "/docker-entrypoint-initdb.d/mindsdb_config.json" ]; then
  cp /docker-entrypoint-initdb.d/mindsdb_config.json /root/mindsdb_config.json
fi

if [ "$#" -eq 0 ]; then
  exec python3 -m mindsdb
else
  exec "$@"
fi
