# Supabase CLI

[![Coverage Status](https://coveralls.io/repos/github/supabase/cli/badge.svg?branch=develop)](https://coveralls.io/github/supabase/cli?branch=develop) [![Bitbucket Pipelines](https://img.shields.io/bitbucket/pipelines/supabase-cli/setup-cli/master?style=flat-square&label=Bitbucket%20Canary)](https://bitbucket.org/supabase-cli/setup-cli/pipelines) [![Gitlab Pipeline Status](https://img.shields.io/gitlab/pipeline-status/sweatybridge%2Fsetup-cli?label=Gitlab%20Canary)
](https://gitlab.com/sweatybridge/setup-cli/-/pipelines)

[Supabase](https://supabase.io) is an open source Firebase alternative. We're building the features of Firebase using enterprise-grade open source tools.

This repository contains all the functionality for Supabase CLI.

- [x] Running Supabase locally
- [x] Managing database migrations
- [x] Creating and deploying Supabase Functions
- [x] Generating types directly from your database schema
- [x] Making authenticated HTTP requests to [Management API](https://supabase.com/docs/reference/api/introduction)

## Getting started

### Install the CLI

Available via [NPM](https://www.npmjs.com) as dev dependency. To install:

```bash
npm i supabase --save-dev
```

When installing with yarn 4, you need to disable experimental fetch with the following nodejs config.

```
NODE_OPTIONS=--no-experimental-fetch yarn add supabase
```

> **Note**
For Bun versions below v1.0.17, you must add `supabase` as a [trusted dependency](https://bun.sh/guides/install/trusted) before running `bun add -D supabase`.

<details>
  <summary><b>macOS</b></summary>

  Available via [Homebrew](https://brew.sh). To install:

  ```sh
  brew install supabase/tap/supabase
  ```

  To install the beta release channel:
  
  ```sh
  brew install supabase/tap/supabase-beta
  brew link --overwrite supabase-beta
  ```
  
  To upgrade:

  ```sh
  brew upgrade supabase
  ```
</details>

<details>
  <summary><b>Windows</b></summary>

  Available via [Scoop](https://scoop.sh). To install:

  ```powershell
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

  To upgrade:

  ```powershell
  scoop update supabase
  ```
</details>

<details>
  <summary><b>Linux</b></summary>

  Available via [Homebrew](https://brew.sh) and Linux packages.

  #### via Homebrew

  To install:

  ```sh
  brew install supabase/tap/supabase
  ```

  To upgrade:

  ```sh
  brew upgrade supabase
  ```

  #### via Linux packages

  Linux packages are provided in [Releases](https://github.com/supabase/cli/releases). To install, download the `.apk`/`.deb`/`.rpm`/`.pkg.tar.zst` file depending on your package manager and run the respective commands.

  ```sh
  sudo apk add --allow-untrusted <...>.apk
  ```

  ```sh
  sudo dpkg -i <...>.deb
  ```

  ```sh
  sudo rpm -i <...>.rpm
  ```

  ```sh
  sudo pacman -U <...>.pkg.tar.zst
  ```
</details>

<details>
  <summary><b>Other Platforms</b></summary>

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

  ```sh
  go install github.com/supabase/cli@latest
  ```

  Add a symlink to the binary in `$PATH` for easier access:

  ```sh
  ln -s "$(go env GOPATH)/bin/cli" /usr/bin/supabase
  ```

  This works on other non-standard Linux distros.
</details>

<details>
  <summary><b>Community Maintained Packages</b></summary>

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/supabase.com/cli/package.yml).
  To install in your working directory:

  ```bash
  pkgx install supabase
  ```

  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/supabase-cli/default.nix).
</details>

### Run the CLI

```bash
supabase bootstrap
```

Or using npx:

```bash
npx supabase bootstrap
```

The bootstrap command will guide you through the process of setting up a Supabase project using one of the [starter](https://github.com/supabase-community/supabase-samples/blob/main/samples.json) templates.

## Docs

Command & config reference can be found [here](https://supabase.com/docs/reference/cli/about).

## Breaking changes

We follow semantic versioning for changes that directly impact CLI commands, flags, and configurations.

However, due to dependencies on other service images, we cannot guarantee that schema migrations, seed.sql, and generated types will always work for the same CLI major version. If you need such guarantees, we encourage you to pin a specific version of CLI in package.json.

## Developing

To run from source:

```sh
# Go >= 1.22
go run . help
```

## Auth Setup

Follow these steps to enable email+password signups with email confirmation for the app.

Checklist (Supabase Dashboard)

- Authentication → Settings
  - Enable "Allow signups" (if you want public registrations)
  - Enable "Email confirmations" (confirmations ON)
  - Confirm the **Confirm signup** email template uses the token_hash flow and points to your app:
    - Example template link: `https://nanocards.now/auth/confirm?token_hash={{ .TokenHash }}&type=signup`
- Authentication → URL Configuration
  - Site URL: `https://nanocards.now`
  - Redirect URLs (add these):
    - `https://nanocards.now`
    - `http://localhost:5173`
    - `http://localhost:5173/auth/confirm`
    - `https://nanocards.now/auth/confirm`

Environment variables (local / Vite)

- Add to your `.env` or `.env.local` (restart dev server after editing):

```
VITE_SUPABASE_URL=https://lompxaggrcfmmsjkbgyt.supabase.co
VITE_SUPABASE_ANON_KEY=<your-publishable-anon-key>
```

Optional (service-role key for server/admin actions):
```
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Install client SDK

```bash
npm i @supabase/supabase-js
```

Client usage notes

- Use the public anon (publishable) key in browser code. Never expose the service-role key to clients.
- The app contains a signup UI that calls `supabase.auth.signUp({ email, password })`. With the token_hash confirm template above, Supabase will email a link that lands at `/auth/confirm`.

Confirm route behavior (app)

- The app includes `/auth/confirm` which reads `token_hash` (and `type`) from the query and calls the Supabase verify endpoint (or SDK `verifyOtp`) to confirm the email, then redirects the user to `/login` (or `/app`).

Testing flow

1. Ensure env vars are set and dev server restarted: `npm run dev`.
2. Sign up with a test email.
3. Receive confirmation email and click link — you should land at `/auth/confirm` and see a success message, then be redirected to login.

Security & troubleshooting

- If confirmation does not complete: verify the Confirm signup template uses `{{ .TokenHash }}` (not `{{ .ConfirmationURL }}`) and that the redirect URL list includes your confirm route and localhost.
- For automation or server-side creation of users (frictionless flow), use a server-side endpoint that calls the Admin REST API with `SUPABASE_SERVICE_ROLE_KEY`. Keep that key private.
