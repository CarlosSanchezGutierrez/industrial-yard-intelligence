# Phase 2 demo polish

Phase 2 starts after the architecture v1 baseline tag.

## Goal

Make the cockpit easier to present to Cooper/T. Smith, school reviewers, incubator evaluators and angel investors.

## First UI addition

`DemoCommandCenter`

Location:

`apps/web/src/components/DemoCommandCenter.tsx`

## Purpose

The panel gives the cockpit a clear demo command center:

- explains the current baseline
- shows the recommended demo order
- lists validation commands
- frames the system as local-first, audit-ready and sync-safe

## What this changes

This does not add new backend behavior.

It improves demo clarity and product storytelling inside the web cockpit.

## Next recommended phase 2 steps

1. Add cockpit section navigation.
2. Add operator workflow progress indicator.
3. Add demo mode seed/reset action.
4. Improve stockpile cards and status labels.
5. Add visual audit timeline polish.
6. Add edge/cloud connection status cards.
## Demo navigation panel

`DemoNavigationPanel` adds a guided presentation layer inside the cockpit.

Location:

`apps/web/src/components/DemoNavigationPanel.tsx`

It helps presenters explain the system in this order:

1. Architecture baseline.
2. Stockpile operator workflow.
3. Audit traceability.
4. Edge-to-cloud sync safety.

This keeps the demo focused and avoids jumping randomly between panels.
## Operator workflow progress panel

`OperatorWorkflowProgressPanel` adds a clear industrial demo flow.

Location:

`apps/web/src/components/OperatorWorkflowProgressPanel.tsx`

It presents the sequence:

1. Stack local.
2. Captura stockpile.
3. Lifecycle.
4. Auditoria.
5. Sync seguro.

Purpose:

Make the cockpit read as an operational product demo instead of disconnected technical panels.
## Runtime connection status panel

`RuntimeConnectionStatusPanel` adds live demo status cards for:

- Cloud API `/health`
- Edge `/health`
- Cloud API `/sync/status`

Location:

`apps/web/src/components/RuntimeConnectionStatusPanel.tsx`

Purpose:

Make the cockpit immediately show whether the local demo stack is healthy before presenting stockpiles, audit and sync.
## Demo data reset panel

`DemoDataResetPanel` adds a visible Cloud API demo reset action to the cockpit.

Location:

`apps/web/src/components/DemoDataResetPanel.tsx`

Runtime route used:

`POST /admin/db/reset`

Purpose:

Before a live demo, reset Cloud API JSON data back to the seed baseline without manually deleting `.api-data`.
## Industrial value snapshot panel

`IndustrialValueSnapshotPanel` adds an executive/business-value layer to the cockpit.

Location:

`apps/web/src/components/IndustrialValueSnapshotPanel.tsx`

Purpose:

Translate the technical demo into business value:

- stockpiles become traceable operational assets
- audit becomes visible
- edge-first architecture supports industrial environments
- SaaS-ready package boundaries support future scaling
## Stockpile demo summary panel

`StockpileDemoSummaryPanel` adds clean stockpile cards and lifecycle counters for demo.

Location:

`apps/web/src/components/StockpileDemoSummaryPanel.tsx`

Runtime route used:

`GET /stockpiles`

Purpose:

Show stockpiles as operational yard assets with material, zone, quantity and status labels.
## Audit timeline story panel

`AuditTimelineStoryPanel` adds a clearer audit narrative to the cockpit.

Location:

`apps/web/src/components/AuditTimelineStoryPanel.tsx`

Runtime route used:

`GET /audit/mutations`

Purpose:

Show traceability as a supervisor-facing timeline instead of raw mutation data.
## Sync demo story panel

`SyncDemoStoryPanel` adds a guided Edge-to-Cloud sync demo.

Location:

`apps/web/src/components/SyncDemoStoryPanel.tsx`

Runtime routes used:

- `GET /sync/status`
- `GET /sync/packages/db-projection`
- `POST /sync/preview`
- `POST /sync/ingest`

Purpose:

Demonstrate that Edge can export a DB projection package, Cloud API can preview it, and apply mode remains safely blocked.
## Yard operations map panel

`YardOperationsMapPanel` adds a conceptual yard map to the cockpit.

Location:

`apps/web/src/components/YardOperationsMapPanel.tsx`

Purpose:

Make the demo feel industrial and spatial by showing stockpiles as patio zones instead of only table/card data.

This is not a production GIS map yet. It is a visual bridge toward future GPS/geospatial work.