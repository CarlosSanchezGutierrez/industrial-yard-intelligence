# Architecture v1 readiness

This checklist validates that the Industrial Yard Intelligence skeleton has the required v1 architecture pieces in place.

## Command

pnpm architecture:check

## What it validates

The check verifies required files and route markers for:

- shared DB layer
- shared API contracts
- stockpile lifecycle domain rules
- Cloud API routes
- Cloud API mutation audit
- Cloud Edge sync stubs
- Edge DB projection sync export
- Web cockpit panels
- local smoke scripts
- local CI script
- architecture documentation

## Current readiness target

This does not validate production readiness.

It validates skeleton readiness: packages, route contracts, local runtime paths, docs and smoke coverage.

## Expected phase result

After this check, build, test, typecheck, smoke scripts and ci-local pass, the architecture skeleton can be treated as v1-ready for demo/incubator purposes.

## Remaining after v1 skeleton

- real sync ingest apply mode
- auth and roles
- Postgres adapter
- deployment pipeline
- mobile app
- advanced geospatial UX
- evidence media hardening
## Related architecture documents

- `docs/ARCHITECTURE_V1_BLUEPRINT.md`
- `docs/ARCHITECTURE_V1_PHASE_GATE.md`
- `docs/ARCHITECTURE_V1_ROADMAP.md`

## Architecture decision records

- `docs/adr/0001-local-first-edge-architecture.md`
- `docs/adr/0002-shared-contracts-over-duplicated-types.md`
- `docs/adr/0003-json-db-before-postgres.md`
- `docs/adr/0004-audit-before-production-sync.md`
- `docs/adr/0005-sync-preview-before-apply.md`
- `docs/adr/0006-domain-rules-outside-http.md`
## Diagrams

Architecture diagrams are documented in:

`docs/ARCHITECTURE_V1_DIAGRAMS.md`
## Status report

Architecture v1 status report:

`docs/ARCHITECTURE_V1_STATUS.md`

Command:

`pnpm architecture:status`
## Final gate

Final local gate:

`docs/ARCHITECTURE_V1_FINAL_GATE.md`

Command:

`pnpm architecture:gate`
## Manifest

Architecture v1 manifest:

`docs/ARCHITECTURE_V1_MANIFEST.md`

Command:

`pnpm architecture:manifest -- -CheckOnly`