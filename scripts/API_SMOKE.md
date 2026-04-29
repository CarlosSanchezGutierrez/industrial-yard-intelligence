# API smoke test

This validates apps/api in runtime mode.

Prerequisite:

Start API in another terminal:

pnpm --filter @iyi/api dev

Run smoke test:

pnpm api:smoke

Direct run:

.\scripts\api-smoke.ps1

Validates:

1. API health.
2. CORS preflight.
3. API manifest.
4. DB schema endpoint.
5. DB tables endpoint.
6. Tenants endpoint.
7. Stockpiles endpoint.
8. System overview endpoint.

Default API URL:

http://localhost:8788

Override:

.\scripts\api-smoke.ps1 -ApiBaseUrl http://localhost:8788