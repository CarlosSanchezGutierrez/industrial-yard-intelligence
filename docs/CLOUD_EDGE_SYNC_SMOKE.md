# Cloud Edge integrated sync smoke

This smoke validates the first full Cloud Edge sync skeleton path.

## Runtime requirements

Start the local stack first:

- Cloud API at `http://localhost:8788`
- Edge API at `http://localhost:8787`

## Command

pnpm sync:smoke

## Direct command

powershell -NoProfile -ExecutionPolicy Bypass -File scripts/cloud-edge-sync-smoke.ps1

## Validated flow

1. Edge exports a DB projection sync package from `GET /sync/packages/db-projection`.
2. Cloud API previews the exported package through `POST /sync/preview`.
3. Cloud API validates disabled apply-mode ingest through `POST /sync/ingest`.

## Required assertions

- edge export includes `generatedAt`
- edge export includes `recordCount`
- edge export includes `package`
- package manifest uses `db_projection_snapshot`
- package direction is `edge_to_cloud`
- package schema is `cloud-edge-sync-v1`
- package payload hash uses `sha256:<64 hex chars>`
- API preview accepts the exported package
- API preview record count matches package manifest count
- API ingest apply mode remains disabled
- API ingest applies zero records
- API ingest skips the package payload count