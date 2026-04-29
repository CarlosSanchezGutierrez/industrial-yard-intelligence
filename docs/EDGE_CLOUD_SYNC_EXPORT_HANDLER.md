# Edge Cloud sync export handler

The edge runtime now has an isolated handler for future DB projection sync export.

## Route shape

GET /sync/packages/db-projection

## Current scope

This step creates the route handler logic only.

It does not wire the handler into the live edge HTTP router yet.

## Output

The handler returns:

- `generatedAt`
- `recordCount`
- `package`

The package is a `CloudEdgeSyncPackageContract` with:

- `db_projection_snapshot` package kind
- `edge_to_cloud` direction
- source edge node
- target cloud node
- stable payload hash
- payload record count
- DB projection snapshot payload

## Next step

Wire this handler into the edge HTTP route layer so the local edge service can expose the package at runtime.
## Edge router wiring

The edge route layer now wraps the core router with `wrapEdgeCloudSyncExportRoute`.

Runtime route:

GET /sync/packages/db-projection

The wrapper calls the existing edge DB projection snapshot route internally and converts the returned snapshot into a Cloud Edge sync package.