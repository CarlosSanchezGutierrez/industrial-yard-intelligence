# Architecture v1 phase gate

This document defines what must be true before declaring the architecture skeleton closed.

## Required checks

The following must pass:

pnpm architecture:check
pnpm --filter @iyi/domain build
pnpm --filter @iyi/domain test
pnpm --filter @iyi/api-contracts build
pnpm --filter @iyi/api-contracts test
pnpm --filter @iyi/api build
pnpm --filter @iyi/api test
pnpm --filter @iyi/web build
pnpm --filter @iyi/edge build
pnpm --filter @iyi/edge test
pnpm --filter @iyi/db build
pnpm --filter @iyi/db test
pnpm typecheck
pnpm test
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/ci-local.ps1 -SkipInstall -SkipGitStatus

## Runtime smoke checks

With the local stack running, these should pass:

pnpm api:smoke
pnpm demo:smoke
pnpm sync:smoke
pnpm smoke:runtime

## Phase gate status

Architecture v1 can be considered skeleton-ready when:

- all required packages build
- all package tests pass
- root typecheck passes
- root test passes
- ci-local passes
- API smoke passes
- edge/demo smoke passes
- integrated sync smoke passes
- architecture readiness check passes
- docs describe the runtime and package boundaries

## Meaning of skeleton-ready

Skeleton-ready means the system has a coherent technical structure.

It does not mean production-ready.

Skeleton-ready means the project can safely move into the next stage:

- real operator workflow polish
- UI demo polish
- sync ingestion planning
- auth planning
- Postgres adapter planning
- mobile app planning
- investor/demo narrative
## Final local gate

Run:

pnpm architecture:gate

This command runs the architecture readiness check, status check, demo operator check, package builds, package tests, root typecheck, root tests and ci-local.
## Runtime gate

With the local stack running, run:

pnpm architecture:runtime

This validates the live API, Edge and integrated Cloud Edge sync runtime path.
## Manifest check

Run:

`pnpm architecture:manifest -- -CheckOnly`

This validates the final docs/scripts expected for v1 demo handoff.