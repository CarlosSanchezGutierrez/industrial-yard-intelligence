# Edge DB Projection

The edge still uses its proven JSON development stores.

This projection maps that runtime state into the shared DB schema from packages/db.

Endpoints:

GET /db/summary
Returns row counts by DB table.

GET /db/snapshot
Returns a JsonFileDbSnapshot compatible with packages/db.

POST /db/snapshot/save
Writes the current projection to .edge-data/edge-db-snapshot.json.

Purpose:

1. Start moving edge toward the DB repository layer.
2. Avoid breaking the working demo stores.
3. Give future SQLite/Postgres adapters a stable target shape.
4. Let backend, frontend and Android align around the same DB model.

This is a bridge step, not the final persistence implementation.