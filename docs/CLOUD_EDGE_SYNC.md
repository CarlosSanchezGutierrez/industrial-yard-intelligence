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