# @iyi/db

Database schema package for Industrial Yard Intelligence.

## Current stage

This package currently owns:

- persistence conventions
- tenant-aware table rules
- migration naming rules
- Drizzle schema placeholders
- Drizzle Kit generation config

It does **not** require Docker yet.

It does **not** require a running PostgreSQL database yet.

It does **not** apply migrations yet.

## Commands

Generate SQL migrations from the TypeScript Drizzle schema:

```powershell
pnpm --filter @iyi/db db:generate
pnpm --filter @iyi/db build
pnpm --filter @iyi/db test
## Important

Generated SQL is not automatically applied to a database.

drizzle-kit generate creates migration files only.

A future step will introduce:

- PostgreSQL/PostGIS runtime
- database connection configuration
- migration application
- seed scripts
- integration tests

For now, this package only generates SQL migration files from the TypeScript Drizzle schema.

Do not run migrations against a real database yet.

Do not add Docker yet unless explicitly approved.

Do not treat the generated schema as final production schema.