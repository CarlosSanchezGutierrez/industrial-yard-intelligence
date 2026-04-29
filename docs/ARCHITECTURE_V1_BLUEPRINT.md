# Architecture v1 blueprint

Industrial Yard Intelligence / Modelo Namiki is structured as a local-first industrial yard intelligence platform for Cooper/T. Smith.

## Product intent

The system registers, locates, validates and audits bulk material stockpiles in industrial yards.

The architecture is designed as a future SaaS platform, but the first deployable shape remains local-first:

- edge runtime for yard/offline operation
- web cockpit for supervisors
- cloud API skeleton for future backend consolidation
- shared contracts across web, API and edge
- shared DB model and JSON persistence
- domain package for pure business rules
- audit and sync skeletons for traceability

## Main runtime areas

### apps/edge

Local/offline runtime for yard operation.

Current responsibilities:

- local health/runtime routes
- demo package support
- evidence and audit foundations
- DB projection
- DB projection sync package export
- local smoke validation

Key route:

GET /sync/packages/db-projection

### apps/api

Cloud/principal backend skeleton.

Current responsibilities:

- health and manifest routes
- stockpile CRUD skeleton
- stockpile lifecycle metadata
- mutation audit capture
- audit query endpoints
- Cloud Edge sync preview/ingest stubs
- JSON file persistence

Key routes:

GET /stockpiles/lifecycle
GET /audit/summary
GET /audit/mutations
GET /audit/stockpiles/:id
GET /sync/status
POST /sync/preview
POST /sync/ingest

### apps/web

Supervisor cockpit.

Current responsibilities:

- Cloud API dashboard
- DB projection visibility
- stockpile creation
- stockpile status update
- lifecycle metadata usage
- mutation audit timeline
- stockpile-specific audit history
- Cloud Edge sync readiness panel

### packages/db

Shared DB model.

Current responsibilities:

- schema v1
- typed records
- in-memory repository
- JSON file DB store
- empty snapshot creation
- snapshot normalization

### packages/api-contracts

Shared HTTP/API contracts.

Current responsibilities:

- Cloud API route definitions
- DB projection contracts
- stockpile lifecycle payloads
- mutation audit contracts
- Cloud Edge sync contracts

### packages/domain

Pure domain rules.

Current responsibilities:

- stockpile lifecycle statuses
- status transition validation
- transition descriptions
- status guards

## Current architecture position

The project is not production-ready yet.

It is an architecture skeleton suitable for:

- investor/incubator demo
- Cooper/T. Smith technical walkthrough
- student prototype delivery
- next phase planning
- local runtime validation

## Non-goals for v1 skeleton

The v1 skeleton intentionally does not include:

- real authentication
- real authorization/roles
- real cloud deployment
- real Postgres adapter
- real sync apply mode
- mobile app
- geospatial map editor
- production media storage
- production observability

Those belong to v2/v3.
## Architecture diagrams

Diagrams are documented in:

`docs/ARCHITECTURE_V1_DIAGRAMS.md`

Included diagrams:

- system context
- package boundaries
- stockpile lifecycle
- Cloud API mutation audit
- Edge-to-cloud sync skeleton
- local runtime ports
- architecture readiness gate
## Demo and investor narrative

Demo operator script:

`docs/DEMO_OPERATOR_V1.md`

Investor technical narrative:

`docs/INVESTOR_TECHNICAL_NARRATIVE.md`
## Architecture status

Current v1 status report:

`docs/ARCHITECTURE_V1_STATUS.md`

Status command:

`pnpm architecture:status`