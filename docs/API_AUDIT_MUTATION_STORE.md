# Cloud API audit mutation snapshot store

This step prepares the local persistence adapter for Cloud API mutation audit entries.

## Scope

The adapter appends Cloud API audit mutation entries into the `audit_entries` collection of a JSON DB snapshot-like object.

## Supported helpers

- `appendCloudApiAuditMutationEntry`
- `getCloudApiAuditMutationEntryCount`
- `findCloudApiAuditMutationEntriesByStockpileId`

## Current stage

This does not wire audit persistence into HTTP mutations yet.

The next step is to call this adapter after successful:

- `POST /stockpiles`
- `PATCH /stockpiles/:id/status`