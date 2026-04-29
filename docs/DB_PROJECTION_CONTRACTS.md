# DB Projection API Contracts

The DB projection endpoints now have shared contracts in packages/api-contracts.

Endpoints covered:

GET /db/summary
GET /db/snapshot
POST /db/snapshot/save

Why this matters:

1. Edge and web now share the same DB projection payload shape.
2. The frontend no longer owns duplicated DB projection types.
3. Future apps/api and apps/mobile can reuse these contracts.
4. The DB schema, edge projection and web inspection panel stay aligned.