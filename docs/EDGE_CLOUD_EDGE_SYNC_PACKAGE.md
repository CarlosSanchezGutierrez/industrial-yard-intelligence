# Edge Cloud Edge sync package builder

The edge runtime now has a package builder for future Cloud Edge sync exports.

## Current scope

This step adds package construction only. It does not expose a runtime endpoint and does not transmit data.

## Builder functions

- `createCloudEdgeSyncPackage`
- `createEdgeDbProjectionSyncPackage`

## Package output

The builder creates a `CloudEdgeSyncPackageContract` with:

- manifest
- payload
- stable payload hash
- payload record count
- source edge endpoint
- target cloud endpoint

## Current package kind

`db_projection_snapshot`

## Current direction

`edge_to_cloud`

## Next step

Expose a local edge endpoint that returns a sync package generated from the current DB projection snapshot.