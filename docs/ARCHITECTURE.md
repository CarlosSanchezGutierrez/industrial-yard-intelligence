# Industrial Yard Intelligence Architecture

## Direction

The system is local-first and evidence-driven.

The edge service owns local operation, offline demo state, sync reconciliation, evidence registration, audit chain state and package export/import.

The web application is the operator and supervisor cockpit.

The DB package owns the relational schema contract that will later be implemented by a real persistence layer.

## Applications

apps/edge
Local backend. Handles health, seed data, sync, conflicts, audit, evidence, demo readiness, demo reports and demo packages.

apps/web
Web cockpit. Shows the map-style dashboard, sync monitor, conflict queue, audit chain, evidence monitor, demo readiness and executive report.

Future apps/api
Cloud backend. Will own authenticated cloud APIs, organization-level data, remote sync and production persistence.

Future apps/mobile
Android field app. Will own GPS capture, camera evidence, offline queue, device identity and mobile sync.

## Packages

packages/kernel
Core primitives, branded IDs, enums and Result helpers.

packages/domain
Domain rules and business transitions.

packages/spatial
Spatial and yard geometry primitives.

packages/media
Evidence metadata and SHA-256 integrity primitives.

packages/audit
Append-only audit hash-chain primitives.

packages/sync-protocol
Sync envelope and transport-level primitives.

packages/sync-core
Sync reconciliation and conflict decision logic.

packages/api-contracts
Shared request and response contracts between edge, web and future clients.

packages/db
Database schema, migrations and future repositories.

packages/seed-data
Simulated Cooper/T. Smith data for smoke demos.

packages/design-tokens
Design tokens shared by web and future UI surfaces.

## Current persistence

The edge currently uses JSON-backed development stores.

This is intentional for the prototype stage.

The next persistence step is to connect packages/db to real repositories.

## Target persistence

Cloud production should use PostgreSQL.

Edge local persistence can use SQLite or an embedded durable store.

The schema in packages/db is the source of truth for both paths.

## Target flow

1. Operator captures yard event or evidence.
2. Device sends sync batch to edge.
3. Edge accepts, rejects or marks conflict.
4. Supervisor reviews conflicts.
5. Evidence receives SHA-256 integrity metadata.
6. Audit chain records evidence and supervisor actions.
7. Demo package exports report plus full offline backup.
8. Imported package can restore state and prove integrity.