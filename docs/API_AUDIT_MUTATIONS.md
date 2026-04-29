# Cloud API mutation audit

This document defines the first audit contract for Cloud API mutations.

## Mutation types

- `stockpile.created`
- `stockpile.status_updated`

## Entry context

Every mutation audit entry includes:

- `requestId`
- `occurredAt`
- `source`
- `actor`

The Cloud API source is fixed as `cloud_api`.

## Current implementation stage

This step adds:

- shared audit contracts in `@iyi/api-contracts`
- API-side audit mutation entry builder in `apps/api`
- tests for contract shape and deterministic audit metadata

The next implementation step is to persist these entries into the shared DB `audit_entries` table when:

- `POST /stockpiles` succeeds
- `PATCH /stockpiles/:id/status` succeeds
## Snapshot store adapter

The local snapshot adapter is documented in:

`docs/API_AUDIT_MUTATION_STORE.md`