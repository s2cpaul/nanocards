#!/usr/bin/env zsh
set -euo pipefail

# run-deploy-safe.sh
# Safely extract SUPABASE_PAT from .env.local (without sourcing), export SUPABASE_TOKEN,
# ensure deploy script is executable, then run deploy.
# Usage: ./scripts/run-deploy-safe.sh <SUPABASE_PROJECT_REF>

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT"

ENV_FILE="$REPO_ROOT/.env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env.local not found in repo root ($REPO_ROOT)"
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <SUPABASE_PROJECT_REF>"
  exit 2
fi

PROJECT_REF="$1"

# Extract SUPABASE_PAT without sourcing the file (handles quoted values)
TOKEN=$(grep -m1 '^SUPABASE_PAT=' "$ENV_FILE" | sed 's/^SUPABASE_PAT=//; s/^"//; s/"$//; s/^'"'"'//; s/'"'"'$//')

if [[ -z "$TOKEN" ]]; then
  echo "Error: SUPABASE_PAT not found or empty in .env.local"
  exit 3
fi

export SUPABASE_TOKEN="$TOKEN"
# Masked info
echo "SUPABASE_TOKEN exported (length=${#SUPABASE_TOKEN})"

# Ensure deploy script exists and is executable
if [[ ! -f "./scripts/deploy-supabase.sh" ]]; then
  echo "Error: scripts/deploy-supabase.sh not found"
  exit 4
fi

chmod +x ./scripts/deploy-supabase.sh

# Run deploy script
./scripts/deploy-supabase.sh "$PROJECT_REF" "$SUPABASE_TOKEN"

# Unset token from env after run
unset SUPABASE_TOKEN

echo "Done."
