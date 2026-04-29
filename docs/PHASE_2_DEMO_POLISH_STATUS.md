# Phase 2 demo polish status

## Status

PHASE_2_DEMO_POLISH_STATIC_READY

## Estimated completion

80-85%

This means the cockpit has enough visual/product polish to support a clear demo narrative, but the UI can still be improved before final presentation.

## What is complete

### Demo command center

Component:

`apps/web/src/components/DemoCommandCenter.tsx`

Purpose:

Frames the cockpit as a guided demo instead of isolated technical panels.

### Demo navigation

Component:

`apps/web/src/components/DemoNavigationPanel.tsx`

Purpose:

Shows the recommended order for presenting architecture, operation, audit and sync.

### Operator workflow progress

Component:

`apps/web/src/components/OperatorWorkflowProgressPanel.tsx`

Purpose:

Explains the industrial operator flow in sequence.

### Runtime connection status

Component:

`apps/web/src/components/RuntimeConnectionStatusPanel.tsx`

Purpose:

Shows Cloud API, Edge and Sync live status from the browser.

### Demo data reset

Component:

`apps/web/src/components/DemoDataResetPanel.tsx`

Purpose:

Resets Cloud API demo data without manually deleting `.api-data`.

### Industrial value snapshot

Component:

`apps/web/src/components/IndustrialValueSnapshotPanel.tsx`

Purpose:

Translates architecture into business value.

### Stockpile demo summary

Component:

`apps/web/src/components/StockpileDemoSummaryPanel.tsx`

Purpose:

Shows stockpiles as visible operational yard assets.

### Audit timeline story

Component:

`apps/web/src/components/AuditTimelineStoryPanel.tsx`

Purpose:

Shows mutation audit as a supervisor-facing traceability story.

### Sync demo story

Component:

`apps/web/src/components/SyncDemoStoryPanel.tsx`

Purpose:

Guides Edge export, Cloud preview and apply-blocked sync story.

### Yard operations map

Component:

`apps/web/src/components/YardOperationsMapPanel.tsx`

Purpose:

Adds an industrial/spatial visual layer to the cockpit.

## Validation commands

Static check:

`pnpm phase2:check`

Static status:

`pnpm phase2:status -- -CheckOnly`

Web build:

`pnpm --filter @iyi/web build`

Runtime smoke after starting local stack:

`pnpm phase2:runtime`

## Remaining polish

Recommended next work:

1. Add sections/tabs to reduce vertical clutter.
2. Improve cockpit visual grouping.
3. Add presenter script for the final live walkthrough.
4. Run live runtime validation.
5. Tag Phase 2 demo polish baseline.