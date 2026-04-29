# Architecture v1 manifest

## Status

V1_DEMO_MANIFEST_READY

## Product

Industrial Yard Intelligence / Modelo Namiki.

## Target company context

Cooper/T. Smith, Altamira, Tamaulipas.

The system targets industrial yard operations involving bulk material stockpiles, yard zones, evidence, auditability and future edge-to-cloud synchronization.

## Architecture intent

The v1 skeleton proves a local-first, SaaS-ready architecture.

It is designed for:

- technical demo
- incubator review
- investor angel explanation
- Cooper/T. Smith prototype walkthrough
- next-phase engineering planning

It is not production-ready yet.

## Runtime applications

### apps/edge

Local-first runtime for yard/offline operation.

Current v1 responsibilities:

- health/runtime foundation
- DB projection
- evidence/demo foundations
- DB projection sync export
- edge smoke validation

Key runtime path:

GET /sync/packages/db-projection

### apps/api

Cloud/principal backend skeleton.

Current v1 responsibilities:

- health and manifest
- stockpile operations
- stockpile lifecycle metadata
- mutation audit
- audit query endpoints
- Cloud Edge sync status
- sync preview
- disabled apply-mode ingest

Key runtime paths:

GET /stockpiles/lifecycle
GET /audit/summary
GET /audit/mutations
GET /audit/stockpiles/:id
GET /sync/status
POST /sync/preview
POST /sync/ingest

### apps/web

Supervisor cockpit.

Current v1 responsibilities:

- Cloud API dashboard
- DB projection visibility
- stockpile creation
- stockpile status updates
- lifecycle metadata usage
- audit timeline
- stockpile-specific audit history
- Cloud Edge sync readiness panel

## Shared packages

### packages/db

Owns shared schema, records, repositories and JSON DB store.

### packages/api-contracts

Owns shared route and payload contracts.

### packages/domain

Owns pure stockpile lifecycle rules.

## Validation commands

### Static/local gate

pnpm architecture:gate

This validates repository consistency, package builds, package tests, typecheck, root tests and ci-local.

### Runtime gate

pnpm dev:stack:windows
pnpm architecture:runtime

This validates the running local stack.

### Demo operator

pnpm demo:operator

This prints the live demo order and checks demo-facing files/scripts.

### Manifest check

pnpm architecture:manifest -- -CheckOnly

This validates the manifest-facing docs/scripts.

## Runtime smoke commands

pnpm api:smoke
pnpm demo:smoke
pnpm sync:smoke
pnpm smoke:runtime

## Architecture documents

- docs/ARCHITECTURE_V1_BLUEPRINT.md
- docs/ARCHITECTURE_V1_DIAGRAMS.md
- docs/ARCHITECTURE_V1_PHASE_GATE.md
- docs/ARCHITECTURE_V1_READINESS.md
- docs/ARCHITECTURE_V1_ROADMAP.md
- docs/ARCHITECTURE_V1_STATUS.md
- docs/ARCHITECTURE_V1_FINAL_GATE.md
- docs/ARCHITECTURE_V1_RUNTIME_GATE.md

## Demo documents

- docs/DEMO_OPERATOR_V1.md
- docs/INVESTOR_TECHNICAL_NARRATIVE.md

## Architecture decision records

- docs/adr/0001-local-first-edge-architecture.md
- docs/adr/0002-shared-contracts-over-duplicated-types.md
- docs/adr/0003-json-db-before-postgres.md
- docs/adr/0004-audit-before-production-sync.md
- docs/adr/0005-sync-preview-before-apply.md
- docs/adr/0006-domain-rules-outside-http.md

## What v1 proves

- clear monorepo structure
- local-first edge path
- cloud API skeleton
- web cockpit skeleton
- stockpile lifecycle rules
- mutation audit path
- DB projection path
- edge export package path
- cloud sync preview path
- disabled apply-mode ingest
- runtime smoke validation
- architecture readiness gates
- investor/demo narrative

## What v1 does not prove

- production authentication
- production authorization
- production deployment
- Postgres persistence
- real sync apply mode
- conflict resolution
- mobile capture
- production media storage
- advanced geospatial UX
- industrial GPS accuracy guarantees

## Next recommended milestone

After this manifest passes, move to v1 closure:

1. Run pnpm architecture:gate.
2. Start local stack.
3. Run pnpm architecture:runtime.
4. Run pnpm demo:operator.
5. Tag the skeleton as v1 demo baseline.