# Architecture v1 roadmap

## Current completed skeleton areas

- monorepo package separation
- shared DB schema and JSON store
- shared Cloud API contracts
- shared Cloud Edge sync contracts
- stockpile lifecycle domain rules
- Cloud API stockpile operations
- mutation audit contracts and runtime visibility
- web cockpit creation/status/audit panels
- edge DB projection package export
- Cloud API sync preview and disabled ingest stubs
- integrated Edge-to-Cloud sync smoke
- architecture readiness check

## Remaining before closing v1

Recommended remaining blocks:

1. Add final architecture diagram documentation.
2. Add demo operator script for presentation.
3. Add final architecture status report.
4. Add investor/incubator technical narrative.
5. Run all smoke scripts against local stack.
6. Tag architecture skeleton v1.

## Next phase after v1 skeleton

The next phase should not start by adding random features.

Recommended order:

1. UI demo polish.
2. Auth/roles design.
3. Real sync ingest design.
4. Postgres adapter design.
5. Mobile capture design.
6. Deployment design.
7. Industrial evidence hardening.
## Architecture diagrams

Architecture v1 diagrams are now available in:

`docs/ARCHITECTURE_V1_DIAGRAMS.md`
## Demo operator check

Run:

pnpm demo:operator

This prints the recommended architecture demo flow and validates that demo-facing docs/scripts exist.
## Current status

Current architecture status:

`docs/ARCHITECTURE_V1_STATUS.md`
## V1 closure

Current closure target:

`V1_SKELETON_CLOSED_FOR_DEMO`

Closure document:

`docs/ARCHITECTURE_V1_CLOSURE.md`