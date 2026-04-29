# Architecture v1 status

## Status

V1_READY_FOR_DEMO

## Estimated skeleton completion

90-95%

This means the architecture skeleton is coherent enough for:

- Cooper/T. Smith technical walkthrough
- incubator presentation
- investor angel technical explanation
- local prototype demo
- next-phase planning

This does not mean production-ready.

## What is complete

### Monorepo structure

The project has separated runtime applications and shared packages:

- `apps/api`
- `apps/edge`
- `apps/web`
- `packages/db`
- `packages/api-contracts`
- `packages/domain`
- supporting packages for seed data, audit, media, spatial and sync foundations

### Local-first edge skeleton

The edge runtime has:

- local DB projection
- demo smoke coverage
- sync package builder
- DB projection sync export route
- local-first architecture documentation

### Cloud API skeleton

The Cloud API has:

- health and manifest routes
- stockpile listing/creation/status updates
- stockpile lifecycle metadata
- JSON DB persistence
- mutation audit capture
- audit query endpoints
- Cloud Edge sync status, preview and disabled ingest stubs

### Web cockpit skeleton

The web cockpit has:

- Cloud API dashboard
- DB projection visibility
- stockpile creation
- stockpile status update
- lifecycle metadata usage
- mutation audit panel
- stockpile-specific audit history
- Cloud Edge sync readiness panel

### Shared DB skeleton

The DB package has:

- schema v1
- typed records
- in-memory repository
- JSON file DB store
- snapshot creation and normalization

### Shared contracts skeleton

The API contracts package has:

- Cloud API route definitions
- stockpile lifecycle contracts
- DB projection contracts
- audit contracts
- Cloud Edge sync contracts

### Domain skeleton

The domain package owns stockpile lifecycle rules:

- statuses
- transitions
- status guards
- transition validation
- descriptions

### Audit skeleton

The system can model and expose audit entries for:

- stockpile creation
- stockpile status updates
- stockpile-specific history

### Sync skeleton

The system validates the first safe sync path:

1. Edge exports DB projection package.
2. Cloud API previews package.
3. Cloud API rejects apply mode safely until real ingest is designed.

### Validation skeleton

The repo has:

- architecture readiness check
- package build/test checks
- root typecheck/test
- ci-local
- API smoke
- edge/demo smoke
- integrated Cloud Edge sync smoke
- demo operator guide

## What is intentionally not complete

### Authentication and authorization

No production auth exists yet.

Required later:

- users
- roles
- permissions
- tenant scoping
- operator/supervisor/admin flows

### Postgres

The current persistence is JSON file based.

Postgres should come after repository contracts and migration strategy are formalized.

### Real sync apply mode

Apply mode is intentionally disabled.

Required later:

- conflict detection
- conflict resolution
- ingest audit
- idempotency
- package replay protection
- transactional persistence

### Deployment

No production deploy pipeline exists yet.

Required later:

- API deploy target
- web deploy target
- edge deploy packaging
- environment variables
- secrets
- monitoring

### Mobile app

No mobile capture app exists yet.

Required later:

- Android or mobile web capture
- GPS/Bluetooth workflow
- offline capture
- media/evidence capture

### Advanced geospatial UI

No production map workflow exists yet.

Required later:

- yard map
- stockpile polygons or markers
- GPS precision handling
- zone overlays

## Recommended next phase

After v1 skeleton closure, the next phase should be demo polish and production planning, not random feature expansion.

Recommended order:

1. UI demo polish.
2. Final presentation deck.
3. Auth/roles design.
4. Real sync ingest design.
5. Postgres adapter plan.
6. Mobile capture plan.
7. Deployment plan.
8. Evidence/media hardening.
## Final gate

Final local verification document:

`docs/ARCHITECTURE_V1_FINAL_GATE.md`

Command:

`pnpm architecture:gate`
## Runtime gate

Runtime gate document:

`docs/ARCHITECTURE_V1_RUNTIME_GATE.md`

Command:

`pnpm architecture:runtime`
## Manifest

Architecture v1 manifest:

`docs/ARCHITECTURE_V1_MANIFEST.md`

Command:

`pnpm architecture:manifest`
## Closure

Architecture v1 closure document:

`docs/ARCHITECTURE_V1_CLOSURE.md`

Command:

`pnpm architecture:close`