# API Backend Skeleton

apps/api is the future cloud/backend service for Industrial Yard Intelligence.

It does not replace apps/edge.

Responsibilities:

apps/edge
Local-first operation, offline sync, evidence, audit and demo package workflows.

apps/api
Future cloud API, production persistence, auth, tenant management and remote sync.

Current mode:

Repository-backed in-memory API using packages/db repository contracts.

Current endpoints:

GET /
API manifest.

GET /health
Health check and DB schema version.

GET /db/schema
Returns the current SQL schema contract from packages/db.

GET /db/tables
Returns required core DB table names.

GET /seed/cooper-smoke
Returns Cooper/T. Smith smoke seed data.

GET /tenants
Lists tenants from the API repository layer.

GET /stockpiles
Lists stockpiles from the API repository layer. Supports tenantId query.

GET /system/overview
Returns repository-backed table counts for API-owned state.

Default local port:

8788

Run:

pnpm --filter @iyi/api dev
## CORS

apps/api includes permissive local-development CORS headers so apps/web can call it from Vite during development.

Current headers:

- access-control-allow-origin: *
- access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
- access-control-allow-headers: content-type,authorization,x-request-id

Before production, this should be restricted to known frontend origins.