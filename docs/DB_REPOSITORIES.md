# DB Repository Layer V1

The DB package now defines three levels:

1. Schema
2. Records
3. Repository contracts

## Why this exists

The edge currently uses JSON-backed development stores.

The next production step is to move those stores behind repository interfaces.

This lets us keep the edge behavior stable while changing persistence later.

## Current implementation

InMemoryDbRepository

Used for tests, local prototyping and contract validation.

InMemoryDbUnitOfWork

Provides all repositories through one transaction-like boundary.

## Future implementations

PostgresDbRepository

For cloud/backend production.

SQLiteEdgeRepository

For local edge/offline persistence.

## Rule

apps/web should not talk to repositories directly.

apps/web talks to API contracts.

apps/edge and future apps/api may use repositories.