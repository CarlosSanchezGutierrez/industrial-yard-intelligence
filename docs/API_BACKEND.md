# API Backend Skeleton

apps/api is the future cloud/backend service for Industrial Yard Intelligence.

It does not replace apps/edge.

Responsibilities:

apps/edge
Local-first operation, offline sync, evidence, audit and demo package workflows.

apps/api
Future cloud API, production persistence, auth, tenant management and remote sync.

Current mode:

Repository-backed JSON file API using packages/db repository contracts.

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
## Local JSON persistence

apps/api now persists its repository state to:

.api-data/api-db.json

Admin endpoints:

GET /admin/db/snapshot
Returns the current API JSON DB snapshot.

POST /admin/db/reset
Resets the API JSON DB to Cooper/T. Smith seed data.

This is still not the final production database. The next long-term target is PostgreSQL.
## Stockpile write endpoint

POST /stockpiles

Creates a stockpile in the API JSON DB.

Required body fields:

- tenantId
- terminalId
- name
- material

Optional body fields:

- id
- category
- estimatedTons
- validationState
- confidenceLevel
- status

This is the first write endpoint in apps/api.
## Stockpile status update endpoint

PATCH /stockpiles/:id/status

Updates only the stockpile status metadata.

Required body fields:

- status

Optional body fields:

- validationState
- confidenceLevel

Allowed status values:

- draft
- operational
- pending_review
- validated
- archived

This prepares the supervisor review flow.
## Stockpile lifecycle

GET /stockpiles/lifecycle

Returns stockpile lifecycle metadata generated from `@iyi/domain`:

- statuses
- explicit transitions
- allowed transitions indexed by current status
## Mutation audit contract

Cloud API mutation audit contracts are documented in:

`docs/API_AUDIT_MUTATIONS.md`

The first mutation types are:

- `stockpile.created`
- `stockpile.status_updated`