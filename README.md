# Industrial Yard Intelligence

Industrial Yard Intelligence is a local-first industrial SaaS platform for spatial yard operations, designed for ports, terminals, industrial yards, bulk material storage facilities, and heavy logistics environments.

The initial tenant and business case is Cooper/T. Smith, but the platform is designed to be multi-tenant, configurable, and reusable across industrial operations.

## Product Vision

This is not a GPS app, a simple map, an ERP, or a traditional WMS.

It is an Industrial Spatial Operations Platform that models industrial yards as living spatial systems.

The core truth of the system is:

Entity + Geometry + State + Event + Evidence + Validation + Audit + Measurement Source + Confidence Level

The map is the visual interface. The system of record is the operational event and spatial data model.

## Core Capabilities

- Yard and terminal configuration
- Spatial map and GIS-ready layers
- Materials and stockpile registry
- Equipment and infrastructure tracking
- Movement/event logging
- Evidence and file attachments
- Validation workflow
- Audit log
- Offline-first mobile workflows
- Local edge server operation
- Local network synchronization
- Scenario simulation
- Recommendation engine
- KPI dashboard
- Future professional measurement integrations

## Target Architecture

Cloud SaaS Control Plane  
↓  
Edge Local Server per terminal  
↓  
Offline mobile apps  
↓  
Future measurement sources: GNSS RTK, GPS industrial, drone RTK/PPK, photogrammetry, LiDAR, total station, GeoTIFF, CAD/GIS, scales, and sensors.

## Initial Technical Direction

Potential stack:

- React + TypeScript
- Vite
- Tailwind CSS
- MapLibre GL
- Capacitor
- Node.js + TypeScript
- Fastify or NestJS
- PostgreSQL + PostGIS
- SQLite for offline storage
- GeoJSON as core spatial interchange format

Final technology choices must be justified before implementation.

## Working Principles

- Do not treat this as a demo.
- Do not hardcode business data into UI components.
- Do not assume unconfirmed operational facts.
- Mark simulated data explicitly.
- Keep business logic out of UI components.
- Prefer configuration over hardcoding.
- Design for offline/local-first operation.
- Design for future SaaS multi-tenancy.
- Keep every step small, reversible, and verifiable.

## Status

Early product architecture phase.

Current Cooper/T. Smith data is treated as seed/simulated configuration unless explicitly confirmed.

## Local stack

Start the full local stack on Windows:

pnpm dev:stack:windows

Then run runtime smoke checks:

pnpm smoke:runtime

Main services:

- API: http://localhost:8788
- Edge: http://localhost:8787
- Web: Vite dev server
## Architecture readiness

Run the architecture skeleton checklist with:

pnpm architecture:check

This validates required v1 files, route markers, smoke scripts and docs.
## Architecture v1 documents

Core architecture documents:

- `docs/ARCHITECTURE_V1_BLUEPRINT.md`
- `docs/ARCHITECTURE_V1_PHASE_GATE.md`
- `docs/ARCHITECTURE_V1_ROADMAP.md`
- `docs/ARCHITECTURE_V1_READINESS.md`

Architecture decision records live under:

- `docs/adr/`
## Architecture diagrams

Architecture v1 diagrams:

`docs/ARCHITECTURE_V1_DIAGRAMS.md`
## Demo operator

Run the v1 demo operator guide with:

pnpm demo:operator

Docs:

- `docs/DEMO_OPERATOR_V1.md`
- `docs/INVESTOR_TECHNICAL_NARRATIVE.md`
## Architecture v1 status

Run:

pnpm architecture:status

Status document:

`docs/ARCHITECTURE_V1_STATUS.md`
## Architecture v1 final gate

Run:

pnpm architecture:gate

This validates the local v1 skeleton before demo/incubator presentation.
## Architecture v1 runtime gate

After starting the local stack:

pnpm dev:stack:windows
pnpm architecture:runtime

This validates the live API, Edge and sync runtime paths.
## Architecture v1 manifest

Run:

pnpm architecture:manifest

Document:

`docs/ARCHITECTURE_V1_MANIFEST.md`
## Architecture v1 closure

Run:

pnpm architecture:close

Document:

`docs/ARCHITECTURE_V1_CLOSURE.md`
## Phase 2 demo polish

Phase 2 starts with cockpit demo polish.

Document:

`docs/PHASE_2_DEMO_POLISH.md`

First UI component:

`apps/web/src/components/DemoCommandCenter.tsx`
## Phase 2 cockpit navigation

The web cockpit includes a guided demo navigation panel:

`apps/web/src/components/DemoNavigationPanel.tsx`
## Phase 2 operator workflow

The cockpit includes an operator workflow progress panel:

`apps/web/src/components/OperatorWorkflowProgressPanel.tsx`
## Phase 2 runtime status

The cockpit includes live local stack status cards:

`apps/web/src/components/RuntimeConnectionStatusPanel.tsx`
## Phase 2 demo data reset

The cockpit includes a Cloud API demo reset panel:

`apps/web/src/components/DemoDataResetPanel.tsx`
## Phase 2 industrial value snapshot

The cockpit includes an executive value panel:

`apps/web/src/components/IndustrialValueSnapshotPanel.tsx`
## Phase 2 stockpile demo summary

The cockpit includes stockpile demo summary cards:

`apps/web/src/components/StockpileDemoSummaryPanel.tsx`
## Phase 2 audit timeline story

The cockpit includes a clearer audit timeline panel:

`apps/web/src/components/AuditTimelineStoryPanel.tsx`
## Phase 2 sync demo story

The cockpit includes a guided Edge-to-Cloud sync demo panel:

`apps/web/src/components/SyncDemoStoryPanel.tsx`
## Phase 2 yard operations map

The cockpit includes a conceptual yard operations map:

`apps/web/src/components/YardOperationsMapPanel.tsx`
## Phase 2 demo polish gate

Run:

pnpm phase2:check

Document:

docs/PHASE_2_DEMO_POLISH_GATE.md
## Phase 2 runtime smoke

After starting the local stack:

pnpm phase2:runtime

Document:

docs/PHASE_2_DEMO_RUNTIME_SMOKE.md
## Phase 2 demo polish status

Run:

pnpm phase2:status

Document:

docs/PHASE_2_DEMO_POLISH_STATUS.md
## Phase 2 cockpit section navigation

The cockpit includes quick section navigation:

`apps/web/src/components/CockpitSectionNavigationPanel.tsx`