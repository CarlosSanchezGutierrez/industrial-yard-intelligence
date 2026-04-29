# Phase 2 demo polish gate

## Purpose

This gate validates that the cockpit demo polish layer exists and is mounted.

## Command

pnpm phase2:check

## What it validates

The check confirms these cockpit panels exist:

- DemoCommandCenter
- DemoNavigationPanel
- OperatorWorkflowProgressPanel
- RuntimeConnectionStatusPanel
- DemoDataResetPanel
- IndustrialValueSnapshotPanel
- StockpileDemoSummaryPanel
- AuditTimelineStoryPanel
- SyncDemoStoryPanel
- YardOperationsMapPanel

It also confirms these panels are mounted in:

apps/web/src/App.tsx

## Runtime routes represented in the cockpit

- GET /sync/status
- POST /admin/db/reset
- GET /stockpiles
- GET /audit/mutations
- GET /sync/packages/db-projection
- POST /sync/preview
- POST /sync/ingest

## Meaning

If this gate and pnpm --filter @iyi/web build pass, the Phase 2 cockpit polish baseline is internally consistent.

This does not replace live runtime validation. For live validation, start the stack and run:

pnpm architecture:runtime
## Runtime smoke

After static validation and web build pass, start the local stack and run:

pnpm phase2:runtime

This validates the runtime endpoints represented by the cockpit panels.
## Status check

Run:

pnpm phase2:status -- -CheckOnly

This validates the Phase 2 status document, static gate, runtime smoke document and mounted cockpit panels.