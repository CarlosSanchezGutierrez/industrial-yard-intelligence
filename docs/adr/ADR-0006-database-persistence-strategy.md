# ADR-0006 - Database & Persistence Strategy

**Status:** Proposed  
**Date:** 2026-04-28  
**Authors:** Carlos Sanchez Gutierrez  
**Deciders:** Carlos Sanchez Gutierrez  

---

## Context

Industrial Yard Intelligence already has the first local-first architecture pieces:

- packages/kernel
- packages/domain
- packages/spatial
- packages/media
- packages/sync-protocol
- packages/sync-core
- packages/api-contracts
- packages/design-tokens
- packages/seed-data
- apps/edge
- apps/web

The edge server can currently receive sync batches and keep event history in memory.

That is useful for architecture validation, but it is not sufficient for a real industrial product.

The system must eventually persist:

- tenants
- terminals
- users
- devices
- yards
- zones
- stockpiles
- materials
- equipment
- infrastructure
- operational events
- sync events
- audit records
- evidence metadata
- measurement sessions
- geometries
- recommendations
- scenarios
- KPI snapshots

Because the product is spatial, offline-first and audit-heavy, the database strategy must be deliberate.

---

## Decision

Use a multi-tier persistence strategy:

1. **Edge Local Server:** PostgreSQL with PostGIS as the target operational database.
2. **Cloud SaaS Control Plane:** PostgreSQL with PostGIS as the future cloud database.
3. **Mobile Offline Apps:** SQLite as the local mobile persistence layer.
4. **Evidence files:** Stored outside relational tables; database stores metadata and references.
5. **Schema ownership:** `packages/db`.
6. **Migration ownership:** `packages/db`.
7. **Domain ownership:** `packages/domain`; database must not become the source of business rules.
8. **Spatial ownership:** PostGIS for persisted spatial operations; `packages/spatial` for pure TypeScript geometry helpers.
9. **Initial implementation:** Do not create production DB schema until the first `packages/db` scaffold is approved.

---

## Persistence Roles

### Edge PostgreSQL/PostGIS

The edge database is the primary operational database for one terminal.

It must persist:

- current operational state
- accepted sync events
- rejected/conflicted sync attempts
- audit log
- evidence metadata
- spatial geometries
- measurement sessions
- scenario snapshots
- KPI snapshots
- local tenant configuration

The edge server must continue to function without internet.

### Cloud PostgreSQL/PostGIS

The future cloud database is the SaaS aggregation and administration layer.

It may eventually persist:

- tenant administration
- licensing
- cloud backups
- cross-terminal analytics
- approved sync data from edge
- configuration distribution
- platform-level user management

Cloud must not silently overwrite edge operational records.

### Mobile SQLite

Mobile apps need local storage for:

- offline outbox
- last synced state
- draft field events
- cached map/config data
- evidence capture metadata
- retry state

Mobile SQLite is not the source of resolved truth.

Mobile data becomes operational only after edge reconciliation.

---

## ORM / Query Builder Direction

Use Drizzle as the preferred initial schema and migration tool for TypeScript.

Rationale:

- lightweight
- TypeScript-friendly
- explicit schema definitions
- good fit for monorepo packages
- easier to keep schema close to domain primitives
- less heavy than a full framework ORM

Raw SQL is acceptable for advanced PostGIS operations when needed.

The database strategy must not hide spatial complexity behind weak abstractions.

---

## PostGIS Direction

PostGIS is required for persisted spatial data.

The system eventually needs:

- geometry columns
- spatial indexes
- area/perimeter calculations
- bounding boxes
- intersection checks
- proximity queries
- yard/zone containment
- stockpile geometry storage
- future orthomosaic and GeoTIFF references
- future RTK/GNSS/drone-derived geometry workflows

`packages/spatial` remains useful for pure in-memory helpers, validation and frontend calculations, but persisted spatial truth belongs in PostGIS.

---

## SQLite Direction

Mobile SQLite must not try to fully replicate PostGIS.

Mobile stores:

- simplified geometry payloads
- event envelopes
- outbox records
- local drafts
- cached read models

Spatial-heavy validation should happen at the edge.

Mobile can do lightweight geometry validation but should not claim professional spatial authority.

---

## Evidence Storage Direction

Evidence files are not stored directly in relational tables.

Database stores metadata:

- evidence id
- tenant id
- terminal id
- file type
- storage provider
- storage key
- integrity hash
- owner user
- owner device
- related entity
- related event
- related measurement session
- timestamps

Actual files may live in:

- edge filesystem
- edge object storage
- future cloud object storage
- external reference

Evidence is immutable. Corrections create new evidence records.

---

## Tenant Requirements

Every tenant-aware table must include tenant identity from the first migration.

Edge is initially single-tenant, but tenant id is still required because:

- backups must be self-describing
- sync payloads include tenant context
- future cloud aggregation requires tenant context
- audit records require tenant context
- schema should not need a rewrite for cloud

---

## Audit Requirements

Audit persistence must be append-oriented.

Audit records must include:

- tenant id
- terminal id when applicable
- user id
- device id
- action type
- affected entity id
- affected entity type
- previous snapshot
- new snapshot
- source runtime
- result
- sync event reference when applicable
- timestamp

Physical append-only enforcement and hash chaining are deferred.

The first schema must still leave space for future integrity fields.

---

## Sync Persistence Requirements

Sync persistence must support:

- event id
- idempotency key
- tenant id
- terminal id
- user id
- device id
- local sequence
- source runtime
- event payload
- result status
- conflict type
- received timestamp
- processed timestamp

Edge must eventually reject duplicate event ids and duplicate idempotency keys.

The current in-memory store in `apps/edge` is temporary and must be replaced by database persistence.

---

## Migration Strategy

`packages/db` owns migrations.

Initial migrations should be small and reviewable.

Do not create a giant schema in one commit.

Recommended migration order:

1. tenants / terminals
2. users / devices
3. yards / zones
4. materials / equipment / infrastructure
5. operational events
6. sync events / outbox records
7. evidence metadata
8. measurement sessions
9. spatial geometries
10. audit log
11. scenarios / recommendations / KPI snapshots

---

## What Not To Do

Do not:

- build schema directly inside apps/edge
- hardcode Cooper-specific data into migrations
- let the database replace domain rules
- use mobile SQLite as source of truth
- store large evidence files inside relational rows
- start with a giant final schema
- add cloud database infrastructure yet
- add Docker complexity before the first schema package is stable
- assume real Cooper/T. Smith coordinates exist
- claim centimeter precision before professional measurement input exists

---

## Initial Implementation Plan

After this ADR, create `packages/db` as a TypeScript package.

Initial `packages/db` should include:

- package setup
- schema placeholder modules
- migration placeholder structure
- database naming conventions
- tenant-aware table conventions
- no live database dependency yet if avoidable
- no Docker yet unless explicitly needed

The first database package should compile and test without requiring a running database.

A real PostgreSQL/PostGIS runtime comes after schema conventions are stable.

---

## Positive Consequences

- Persistence strategy matches local-first architecture.
- Spatial data has a professional target: PostGIS.
- Mobile storage remains lightweight and offline-capable.
- Evidence storage is not mixed with relational rows.
- Future cloud SaaS remains compatible.
- Edge in-memory sync can evolve into durable sync.
- Domain rules stay outside the database.
- Migrations become reviewable and incremental.

---

## Negative Consequences

- PostgreSQL/PostGIS adds deployment complexity for edge.
- Mobile and edge use different storage engines.
- Drizzle may still require raw SQL for advanced spatial operations.
- Schema design becomes more serious before the demo is finished.
- Local edge installation will eventually require database setup.
- Testing database behavior will require integration testing later.

---

## Risks

- Edge database setup becomes too heavy for early demo.
- Spatial schema gets designed before real Cooper coordinates exist.
- Developers overfit schema to simulated seed data.
- Evidence storage becomes messy if file strategy is delayed too long.
- Mobile SQLite and edge Postgres drift apart.
- Sync idempotency is not enforced until real persistence exists.

Mitigations:

- Start with `packages/db` conventions before live DB.
- Keep simulated data clearly marked.
- Do not create final spatial schema until real/georeferenced input exists.
- Keep mobile SQLite as outbox/cache, not full operational truth.
- Add DB integration tests only after first real schema.
- Keep migrations small.

---

## Decisions Conditioned by this ADR

### packages/db

Must own database schema and migrations.

### apps/edge

Must eventually replace in-memory sync store with durable persistence.

### apps/mobile

Must use SQLite for offline outbox and cache.

### apps/api

Must use cloud persistence later, not edge database directly.

### packages/spatial

Must remain pure TypeScript helpers and not become PostGIS wrapper only.

### packages/media

Must own evidence metadata concepts, while DB persists those concepts later.

### packages/sync-core

Must remain pure reconciliation logic and not access the database directly.

---

## Criteria for Future Revision

This ADR should be reviewed when:

- first real PostGIS migration is created
- Docker or local Postgres setup is introduced
- mobile SQLite package is introduced
- evidence file storage implementation begins
- cloud database design begins
- Cooper/T. Smith provides real layout or coordinates
- professional measurement integrations begin
- multi-tenant cloud isolation is implemented