#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

expected="$1"
if [ -z "$expected" ]; then
  echo "Usage: check-env.sh <expected-env>" >&2
  exit 2
fi

echo "Checking .env file..."
sudo sed -n '1,120p' "$repo_root/.env"

echo "Resolver output..."
resolved=$(node "$repo_root/tools/dev-scripts/cmd-resolve-env.js")
echo "$resolved"

echo "pnpm helper output..."
pnpm_output=$(pnpm --silent env:show || true)
echo "$pnpm_output"

if [ "$resolved" != "$expected" ]; then
  echo "Resolver output ($resolved) does not match expected ($expected)" >&2
  exit 3
fi

if [[ ! "$pnpm_output" =~ "$expected" ]]; then
  echo "pnpm env:show output does not contain expected value ($expected)" >&2
  exit 4
fi

echo "OK: environment is $expected"
