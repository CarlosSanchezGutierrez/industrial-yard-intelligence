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