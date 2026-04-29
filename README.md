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