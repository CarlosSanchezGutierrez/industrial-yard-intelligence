# Local Development Stack

This project now has three runtime surfaces:

apps/api
Cloud/backend skeleton.

apps/edge
Local/offline backend.

apps/web
Frontend cockpit.

## Start full stack on Windows

Run:

pnpm dev:stack:windows

This opens three PowerShell windows:

1. API on http://localhost:8788
2. Edge on http://localhost:8787
3. Web through Vite

## Start services manually

API:

pnpm dev:api

Edge:

pnpm dev:edge

Web:

pnpm dev:web

## Runtime smoke test

After API and Edge are running:

pnpm smoke:runtime

This runs:

1. API health check.
2. Edge health check.
3. API smoke test.
4. Edge demo smoke test.

## Environment

Copy .env.example when needed.

Default values:

API: http://localhost:8788
Edge: http://localhost:8787
## Cloud Edge integrated sync smoke

After starting the local stack, validate the Edge-to-Cloud sync skeleton with:

pnpm sync:smoke

This calls the edge export route and validates the exported package against the Cloud API sync preview and disabled apply-mode ingest endpoints.
## Architecture readiness check

Validate the v1 skeleton with:

pnpm architecture:check

This should pass together with build, test, typecheck and local CI before declaring the skeleton closed.