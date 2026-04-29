# API Backend Skeleton

apps/api is the future cloud/backend service for Industrial Yard Intelligence.

It does not replace apps/edge.

Responsibilities:

apps/edge
Local-first operation, offline sync, evidence, audit and demo package workflows.

apps/api
Future cloud API, production persistence, auth, tenant management and remote sync.

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

Default local port:

8788

Run:

pnpm --filter @iyi/api dev