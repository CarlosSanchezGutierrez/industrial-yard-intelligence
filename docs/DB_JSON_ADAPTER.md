# JSON File DB Adapter V1

This adapter persists the typed DB repository layer into one JSON file.

It is not the final production database.

Purpose:

1. Give edge a persistence adapter aligned with packages/db.
2. Keep local-first development simple.
3. Allow tests and demos to run without Docker.
4. Prepare the migration path from JSON stores to SQLite or PostgreSQL.

Current adapter:

JsonFileDbStore

Capabilities:

- loadFromDisk
- saveToDisk
- exportSnapshot
- importSnapshot
- reset
- unit-of-work style transaction boundary
- typed repository access through DbRepositorySet

Future production adapters:

- SQLiteEdgeDbStore for local edge.
- PostgresDbStore for cloud/backend.