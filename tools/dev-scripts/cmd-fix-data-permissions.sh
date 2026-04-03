#!/usr/bin/env bash
set -euo pipefail

# ChatSuite Data Directory Permissions Script
# Ensures all data/ subdirectories exist with correct permissions
# for Docker bind mounts. Works on macOS, Linux, and Synology DiskStation.
#
# Usage:
#   bash tools/dev-scripts/cmd-fix-data-permissions.sh
#   bash tools/dev-scripts/cmd-fix-data-permissions.sh --check   (dry-run)

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
data_dir="$repo_root/data"

CHECK_ONLY=false
if [[ "${1:-}" == "--check" ]]; then
  CHECK_ONLY=true
fi

# All data directories referenced in docker-compose.yaml bind mounts
DATA_DIRS=(
  "librechat"
  "librechat/images"
  "librechat/logs"
  "librechat/meilisearch"
  "librechat/mongodb"
  "librechat/uploads"
  "mcp-browser-use-server"
  "mcp-email-server"
  "mcphub"
  "mindsdb"
  "minio"
  "n8n"
  "nocodb"
  "nocodb/postgres"
  "paperclip"
  "pgadmin"
  "postgres"
  "vectordb"
)

echo "=== ChatSuite Data Permissions ==="
echo "Data root: $data_dir"
echo ""

errors=0

for dir in "${DATA_DIRS[@]}"; do
  full_path="$data_dir/$dir"

  if $CHECK_ONLY; then
    if [[ -d "$full_path" ]]; then
      # macOS uses -f '%Lp', GNU/Linux uses -c '%a', BusyBox may lack both
      perms=$(stat -f '%Lp' "$full_path" 2>/dev/null) ||
        perms=$(stat -c '%a' "$full_path" 2>/dev/null) ||
        perms=$(ls -ld "$full_path" | awk '{print $1}')
      echo "  OK   $dir ($perms)"
    else
      echo "  MISS $dir"
      errors=$((errors + 1))
    fi
  else
    if [[ ! -d "$full_path" ]]; then
      echo "  CREATE $dir"
      mkdir -p "$full_path"
    else
      echo "  EXISTS $dir"
    fi
    chmod 777 "$full_path"
  fi
done

# Ensure .gitkeep exists
if ! $CHECK_ONLY; then
  touch "$data_dir/.gitkeep"
fi

echo ""
if $CHECK_ONLY; then
  if [[ $errors -gt 0 ]]; then
    echo "FAIL: $errors missing directories. Run without --check to create them."
    exit 1
  else
    echo "OK: All data directories exist."
  fi
else
  echo "OK: All data directories created with mode 777."
  echo "Docker services can now write to these bind mounts."
fi
