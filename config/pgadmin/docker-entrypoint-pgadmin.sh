#!/bin/sh
set -e

echo "[pgadmin-entrypoint] starting initialization wrapper"

# Wait for mount to become available and writable (useful on slow NAS)
PGADMIN_DIR="/root/.pgadmin"
max_attempts=60
attempt=1
while [ $attempt -le $max_attempts ]; do
  if [ -d "$PGADMIN_DIR" ] && [ -w "$PGADMIN_DIR" ]; then
    echo "[pgadmin-entrypoint] data dir $PGADMIN_DIR is available and writable"
    break
  fi
  echo "[pgadmin-entrypoint] waiting for $PGADMIN_DIR to be ready ($attempt/$max_attempts)..."
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "[pgadmin-entrypoint] WARNING: $PGADMIN_DIR not ready after wait; continuing anyway"
fi

# Ensure permissions are permissive enough for the container (avoids UID/GID mismatches on NFS)
echo "[pgadmin-entrypoint] fixing permissions on $PGADMIN_DIR"
chmod -R 700 "$PGADMIN_DIR" || true
chown -R root:root "$PGADMIN_DIR" || true

echo "[pgadmin-entrypoint] exec original entrypoint: /entrypoint.sh $@"
exec /entrypoint.sh "$@"
