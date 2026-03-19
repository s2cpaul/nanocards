# Deploy Supabase Edge Function (Automated)

This document explains how to deploy the `make-server-d91f8206` Supabase Edge Function automatically via GitHub Actions and how to deploy locally with a small helper script.

## Prerequisites
- A Supabase project and project ref (Project Settings → General → Project ref).
- A Supabase Personal Access Token (PAT) with permissions to deploy functions.
- GitHub repository admin (to add secrets).

## GitHub Actions (automatic)
A workflow has been added at `.github/workflows/deploy-supabase-functions.yml`. To enable automatic deployment on push to `main`:

1. Add two repository secrets:
   - `SUPABASE_PROJECT_REF` — your Supabase project ref
   - `SUPABASE_TOKEN` — your Supabase PAT

You can add secrets via GitHub UI or with the `gh` CLI:

# Using gh CLI (run locally)
# Replace <value> with your actual values
gh secret set SUPABASE_PROJECT_REF --body "<your-project-ref>"
gh secret set SUPABASE_TOKEN --body "<your-supabase-token>"

2. Push to `main` (or open a PR merge to main). The workflow runs on push to main and will deploy the function.

3. To trigger manually from the command line using gh:

gh workflow run deploy-supabase-functions.yml

Check Actions → Deploy Supabase Edge Function for logs and status.

## Local deployment script
A small helper script is available at `scripts/deploy-supabase.sh` to install the Supabase CLI (via Homebrew) and deploy the function from your macOS machine.

Usage (zsh):

# Option A: Supply project ref and token as arguments
./scripts/deploy-supabase.sh <SUPABASE_PROJECT_REF> <SUPABASE_TOKEN>

# Option B: Export token env var first
export SUPABASE_TOKEN="<your-token>"
./scripts/deploy-supabase.sh <SUPABASE_PROJECT_REF>

Notes:
- The script uses Homebrew to install the `supabase` CLI if it is not present. If you don't have Homebrew, install it first: https://brew.sh
- The script deploys the function defined in `supabase/functions/make-server-d91f8206`.

## Post-deploy verification
Run a preflight check to confirm CORS headers are returned:

curl -i -X OPTIONS "https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/make-server-d91f8206" \
  -H "Origin: http://localhost:5180" \
  -H "Access-Control-Request-Method: GET"

You should see `Access-Control-Allow-Origin` and related headers returned.

If you want automated frontend deployment (Vercel, Netlify, or Supabase Hosting) added to the same workflow, tell me which host and I will add it.
