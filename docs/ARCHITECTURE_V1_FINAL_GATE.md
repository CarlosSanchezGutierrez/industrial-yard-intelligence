# Architecture v1 final gate

## Status

This is the final local verification command for the v1 architecture skeleton.

## Command

pnpm architecture:gate

## What it runs

- pnpm install
- pnpm architecture:check
- pnpm architecture:status -- -CheckOnly
- pnpm demo:operator -- -CheckOnly
- pnpm --filter @iyi/domain build
- pnpm --filter @iyi/domain test
- pnpm --filter @iyi/api-contracts build
- pnpm --filter @iyi/api-contracts test
- pnpm --filter @iyi/api build
- pnpm --filter @iyi/api test
- pnpm --filter @iyi/web build
- pnpm --filter @iyi/edge build
- pnpm --filter @iyi/edge test
- pnpm --filter @iyi/db build
- pnpm --filter @iyi/db test
- pnpm typecheck
- pnpm test
- scripts/ci-local.ps1

## Meaning

If this command passes, the repository is locally consistent as an architecture v1 skeleton.

It is valid to describe the project as:

V1_SKELETON_READY_FOR_DEMO

## What this does not prove

This gate does not prove production readiness.

It does not validate:

- production auth
- production deployment
- Postgres
- real sync apply mode
- mobile capture
- production media storage
- real industrial GPS accuracy

## Runtime validation still required

With the local stack running, also run:

- pnpm api:smoke
- pnpm demo:smoke
- pnpm sync:smoke
- pnpm smoke:runtime
## Live runtime gate

After starting the local stack, run:

pnpm architecture:runtime

This validates the API, Edge and integrated sync smoke paths against the running services.