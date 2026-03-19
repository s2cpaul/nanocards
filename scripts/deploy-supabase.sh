#!/usr/bin/env zsh
set -euo pipefail

# deploy-supabase.sh
# Usage:
#   ./scripts/deploy-supabase.sh <SUPABASE_PROJECT_REF> <SUPABASE_TOKEN>
# Or:
#   export SUPABASE_TOKEN="..." && ./scripts/deploy-supabase.sh <SUPABASE_PROJECT_REF>

PROJECT_REF="$1"
TOKEN="${2:-${SUPABASE_TOKEN:-}}"

if [[ -z "$PROJECT_REF" ]]; then
  echo "Usage: $0 <SUPABASE_PROJECT_REF> [SUPABASE_TOKEN]"
  exit 1
fi

if [[ -z "$TOKEN" ]]; then
  echo "Supabase token not provided via argument or SUPABASE_TOKEN env var"
  exit 2
fi

# Ensure we're running from the repo root (where this script lives)
REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT"

# Install supabase CLI if missing
if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Attempting to install..."
  if command -v brew >/dev/null 2>&1; then
    echo "Installing supabase CLI via Homebrew..."
    brew install supabase/tap/supabase || {
      echo "Homebrew install failed. Trying npm global install as fallback..."
      npm install -g supabase
    }
  else
    echo "Homebrew not found. Installing supabase via npm global package..."
    npm install -g supabase
  fi
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI still not available after installation attempts. Please install it manually."
  exit 3
fi

FUNCTION_DIR="supabase/functions/make-server-d91f8206"
if [[ ! -d "$FUNCTION_DIR" ]]; then
  echo "Function directory $FUNCTION_DIR not found. Are you in the project root?"
  exit 4
fi

echo "Deploying Supabase Edge Function make-server-d91f8206 to project $PROJECT_REF"

supabase functions deploy make-server-d91f8206 --project-ref "$PROJECT_REF" --path "$FUNCTION_DIR" --token "$TOKEN"

EXIT_CODE=$?
if [[ $EXIT_CODE -ne 0 ]]; then
  echo "Supabase function deploy failed with exit code $EXIT_CODE"
  exit $EXIT_CODE
fi

echo "Deploy complete."
