#!/usr/bin/env bash
set -euo pipefail

# Atomic writer for repository .env
# Usage: write-env.sh NX_APP_ENV host

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"

var_name="${1:-NX_APP_ENV}"
value="${2:-host}"

tmp_file="$repo_root/.env.tmp.$$"
target_file="$repo_root/.env"

cleanup() {
  rm -f "$tmp_file" || true
}
trap cleanup EXIT

# Write file with explicit newlines
{
  printf '%s\n' "# ChatSuite Environment Configuration"
  printf '%s\n' "# This sets which environment template to use from config/env/"
  printf '%s=%s\n' "$var_name" "$value"
} > "$tmp_file"

# Ensure data is flushed to disk (best-effort)
sync || true

# Move into place atomically
mv -f "$tmp_file" "$target_file"

# Set safe permissions
chmod 644 "$target_file"

echo "Wrote $target_file ($var_name=$value)"
