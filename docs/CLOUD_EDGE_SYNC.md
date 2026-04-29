# Cloud Edge sync

This document defines the first Cloud Edge sync contract layer.

## Purpose

The system needs a safe path for future local edge nodes to exchange operational data with the Cloud API.

The first contract layer is intentionally non-invasive. It defines payload shape and route intent before real ingestion logic is connected.

## Routes

GET /sync/status

Returns Cloud Edge sync capabilities.

POST /sync/preview

Previews a sync package without applying records.

POST /sync/ingest

Accepts a sync package with an explicit ingest mode and conflict policy.

## Package kinds

- `db_projection_snapshot`
- `audit_mutation_delta`
- `evidence_manifest`
- `full_demo_package`

## Conflict policies

- `reject`
- `prefer_cloud`
- `prefer_edge`
- `manual_review`

## Current stage

This step adds shared contracts and route definitions only.

Next steps:

1. Add API stub endpoints.
2. Add smoke coverage for sync status.
3. Add preview-only validation.
4. Later connect real ingestion into DB repositories.
## Route wiring

`apps/api/src/routes.ts` wraps `routeApiRequest` with `wrapCloudApiSyncRoutes`, so these paths are handled before falling through to the existing core API route logic.
## Runtime smoke coverage

`scripts/api-smoke.ps1` validates:

GET /sync/status
POST /sync/preview
POST /sync/ingest

This confirms the Cloud API exposes contract-safe Cloud Edge sync stubs before real ingestion is enabled.
## Web cockpit visibility

The web cockpit sync panel is documented in:

`docs/WEB_CLOUD_EDGE_SYNC.md`
## Edge package builder

The edge-side sync package builder is documented in:

`docs/EDGE_CLOUD_EDGE_SYNC_PACKAGE.md`

It prepares `db_projection_snapshot` packages for future edge-to-cloud sync.
## Edge DB projection sync package adapter

The edge DB projection package adapter is documented in:

`docs/EDGE_DB_PROJECTION_SYNC_PACKAGE.md`
## Edge sync export handler

The isolated edge sync export handler is documented in:

`docs/EDGE_CLOUD_SYNC_EXPORT_HANDLER.md`