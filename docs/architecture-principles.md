# Architecture Principles

## Target Architecture

Industrial Yard Intelligence must be designed as a SaaS industrial platform with local-first and offline-first capabilities.

Target model:

    Cloud SaaS Control Plane
            ↓
    Edge Local Server per terminal
            ↓
    Offline mobile apps
            ↓
    Future professional measurement sources

## Cloud SaaS Control Plane

Future responsibilities:

- multi-tenant administration
- licensing
- billing
- global configuration
- backups
- updates
- analytics aggregation
- AI/ML model management
- multi-terminal administration

## Edge Local Server

The Edge Local Server is essential for industrial yards that do not have reliable internet.

Responsibilities:

- run backend locally
- host local dashboard
- store local operational data
- store evidence and files
- synchronize mobile devices through local network
- serve map layers and local configuration
- run local rules and recommendations
- support operation without internet

Possible physical forms:

- laptop
- mini PC
- industrial PC
- local server
- future dedicated appliance

## Mobile Offline Apps

Mobile apps must support:

- offline field capture
- local storage
- movement/event creation
- photos and evidence
- map consultation
- geometry editing
- local event outbox
- synchronization with edge server when available

## Core Architectural Pattern

The system should be centered on operational spatial events.

The map is not the source of truth.

The source of truth is:

    Entity + Geometry + State + Event + Evidence + Validation + Audit + Measurement Source + Confidence Level

## Recommended Initial Stack

This is a strategic recommendation, not a final irreversible decision.

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- MapLibre GL
- Capacitor

Backend:

- Node.js
- TypeScript
- Fastify or NestJS
- PostgreSQL
- PostGIS

Offline:

- SQLite
- Local Event Outbox
- Event queue
- Conflict handling
- Export/import fallback

GIS formats:

- GeoJSON initially
- GeoTIFF future
- COG future
- MBTiles future
- DXF future
- LAS/LAZ future

## Modular Monolith First

Do not start with microservices.

The correct initial architecture is a modular monolith with strong domain boundaries.

Reasons:

- faster development
- simpler deployment
- easier local operation
- easier debugging
- better for early product iteration
- can be split later if needed

Initial modules:

- identity
- tenant
- spatial
- assets
- materials
- operations
- measurement
- evidence
- audit
- validation
- scenarios
- recommendations
- KPIs
- sync

## Offline Sync Pattern

Use the Local Event Outbox pattern.

Expected flow:

1. User creates or changes data on mobile.
2. Change is saved locally.
3. An event is placed in the local outbox.
4. When the edge server is available, pending events are pushed.
5. Backend validates events.
6. Central local database updates state.
7. Server returns new events/state changes.
8. Mobile app updates local cache.

Conflicts must not be silently overwritten.

Conflict types:

- geometry_conflict
- status_conflict
- quantity_conflict
- duplicate_asset
- stale_measurement
- validation_conflict

## Validation Workflow

Suggested states:

- draft
- operational
- pending_review
- validated
- corrected
- rejected
- superseded
- archived

Manual or approximate data can be operational.

Supervisor-reviewed data can be validated.

Data replaced by better measurement can become superseded.

## Data Honesty

Do not claim exactness without exact data.

Volume estimation requires:

- 3D current surface
- base terrain surface
- material density
- validation through scale or professional measurement

Initial versions may prepare the data structure for volume but must not fake professional measurements.

## Security and Audit

Every important action must be auditable.

Audit dimensions:

- user
- device
- timestamp
- action
- affected entity
- previous value
- new value
- source
- status
- result

This is required for enterprise industrial adoption.
