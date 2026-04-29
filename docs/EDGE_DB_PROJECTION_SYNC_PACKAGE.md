# Edge DB projection sync package adapter

The edge runtime can now convert a DB projection snapshot into a Cloud Edge sync package.

## Purpose

This adapter bridges the current edge DB projection layer with the future cloud ingest pipeline.

## Current scope

This step does not expose an HTTP endpoint and does not send data to cloud.

It creates a package object compatible with `@iyi/api-contracts`:

- `manifest`
- `payload`
- `payloadHash`
- `payloadRecordCount`
- edge source endpoint
- cloud target endpoint

## Functions

- `countDbProjectionSnapshotRecords`
- `createEdgeDbProjectionSyncPackageFromSnapshot`

## Next step

Expose an edge endpoint that returns a package generated from the current DB projection snapshot.