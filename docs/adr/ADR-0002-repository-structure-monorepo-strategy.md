# ADR-0002 — Repository Structure & Monorepo Strategy

**Status:** Proposed  
**Date:** 2026-04-28  
**Authors:** Carlos Sanchez Gutierrez  
**Deciders:** Carlos Sanchez Gutierrez  

---

## Context

Industrial Yard Intelligence is a local-first, offline-first industrial SaaS platform for spatial yard operations.

The platform must eventually support:

- Cloud SaaS Control Plane.
- Edge Local Server per terminal.
- Offline mobile apps.
- Web dashboard.
- Future professional measurement integrations.
- GIS-ready spatial data.
- Evidence and audit workflows.
- Offline sync.
- Multi-tenant SaaS expansion.

ADR-0001 established the trust boundaries between cloud, edge, mobile apps, future measurement sources, evidence, audit, sync, and tenant scope.

This ADR defines how the repository should be structured so the system can grow without collapsing into a tangled app, a frontend-only prototype, or an overengineered microservice system.

The repository must support long-term product architecture while still allowing incremental development.

---

## Decision

Use a monorepo from the start.

The repository will be structured around:

1. Application composition roots.
2. Shared platform packages.
3. Domain modules.
4. Tooling and configuration.
5. ADR-driven incremental development.

The repository will follow a hybrid strategy:

- Monorepo from day one.
- Domain and contracts first.
- No full application implementation until foundational packages are defined.
- No microservices.
- No premature cloud infrastructure.
- No empty folder explosion.
- No frontend-first hardcoding.
- No backend-only modeling without an early smoke UI.

Target structure:

    apps/
      api/
      edge/
      edge-worker/
      web/
      mobile/

    packages/
      kernel/
      domain/
      db/
      sync-protocol/
      sync-core/
      api-contracts/
      spatial/
      media/
      design-tokens/

    tooling/
      eslint-config/
      tsconfig/

    docs/
      adr/

This structure is the target direction. Not every folder must be created immediately.

---

## Architectural Rationale

### Why Monorepo

A monorepo is appropriate because the system has multiple runtimes that must share core concepts:

- Cloud API.
- Edge server.
- Edge worker.
- Web dashboard.
- Mobile app.
- Shared domain model.
- Shared sync protocol.
- Shared spatial primitives.
- Shared validation states.
- Shared audit and evidence contracts.

The platform cannot allow each app to invent its own representation of:

- Tenant identity.
- Entity identity.
- Geometry.
- Events.
- Validation state.
- Confidence level.
- Measurement source.
- Audit metadata.
- Sync envelope.
- Conflict type.

A monorepo allows these concepts to be developed once and consumed consistently.

---

## Why Not Frontend First

A frontend-first approach would produce visible progress quickly, but it creates high risk:

- Cooper/T. Smith seed data could become hardcoded into UI components.
- The map could become the source of truth instead of the event model.
- Offline sync, audit, validation, evidence, and tenant boundaries would be bolted on later.
- The product could look impressive but become structurally weak.
- Multi-tenant SaaS architecture would become an afterthought.
- Future edge/mobile/cloud boundaries would be harder to recover.

Frontend matters, but it must not define the domain alone.

---

## Why Not Backend / Domain Only

A backend/domain-only approach would protect the core model, but it also creates risk:

- The product could become abstract and detached from UX.
- The customer would not see visual progress early enough.
- Spatial workflows may be modeled incorrectly without map feedback.
- The team may overdesign domain concepts that are not needed.
- The product may lose commercial momentum.

Therefore, the strategy is domain-first but not UI-blind.

A smoke UI should appear early, after the kernel/domain/contracts have enough shape to prevent hardcoding.

---

## Why Not Microservices

Microservices are rejected for the initial phase.

Reasons:

- Too much operational complexity.
- Bad fit for offline edge deployment.
- Harder local development.
- Harder debugging.
- Harder synchronization.
- Premature infrastructure overhead.
- Not necessary before product-market fit.

The correct initial strategy is a modular monolith with strong package boundaries.

If the product later needs service extraction, the monorepo and package boundaries will make that possible.

---

## Repository Structure

### apps/api

Future cloud control plane API.

Responsibilities:

- Cloud tenant administration.
- Global configuration.
- Licensing.
- Cloud sync endpoints.
- Future analytics aggregation.
- Future AI/ML services.
- Future SaaS administration.

Initial status:

- Do not implement yet.
- Do not create full framework skeleton until backend ADR is approved.
- Must remain separate from edge because cloud and edge have different trust boundaries.

---

### apps/edge

Local edge server application.

Responsibilities:

- Local operational API.
- Local dashboard backend.
- Local PostGIS database access.
- Local evidence storage.
- Local rules execution.
- Local sync coordination.
- Local authentication and authorization.
- Local map layer serving.

Initial status:

- Do not implement yet.
- Must be treated as the first real backend runtime.
- Must remain separate from cloud API.

---

### apps/edge-worker

Background worker for local sync and reconciliation.

Responsibilities:

- Drain sync queues.
- Reconcile mobile events.
- Process conflict detection.
- Process background ingestion.
- Handle future cloud sync.
- Run scheduled local tasks.

Initial status:

- Do not implement yet.
- Exists conceptually because sync is not just an API route.

---

### apps/web

Web dashboard application.

Responsibilities:

- Command center.
- Yard map.
- Layer manager.
- KPI dashboard.
- Scenario studio.
- Measurement center.
- Admin console.
- Audit and timeline views.

Initial status:

- Do not implement full UI yet.
- A smoke UI should be created early after core packages exist.
- Must not hardcode business data into components.
- Must consume seed/config/contracts.

---

### apps/mobile

Mobile app shell.

Responsibilities:

- Offline field capture.
- Movement capture.
- Photo/evidence capture.
- Local map view.
- Outbox.
- Sync with edge server.
- Future Android app via Capacitor.
- Future iOS support if required.

Initial status:

- Do not implement yet.
- Capacitor remains likely but must be validated later.
- Mobile constraints influence sync and domain design from the start.

---

## Shared Packages

### packages/kernel

Platform primitives shared by all apps and packages.

Expected contents:

- TenantId.
- EntityId.
- UserId.
- DeviceId.
- Timestamp.
- DomainEvent base.
- Result/Either utilities if needed.
- ValidationState.
- ConfidenceLevel.
- AuditSource.
- MeasurementSource.
- ConflictType.
- Base provenance metadata.

Initial priority:

- This should be the first code package created.

---

### packages/domain

Behavioral domain modules.

Expected modules:

- identity.
- tenant.
- spatial.
- assets.
- materials.
- operations.
- measurement.
- evidence.
- audit.
- validation.
- scenarios.
- recommendations.
- kpis.

Rules:

- Domain must not be types-only.
- Domain must include behavior, invariants, state transitions and validations.
- Domain must not depend on React, Fastify, database clients, MapLibre or platform-specific APIs.
- Domain must be testable without infrastructure.

Initial priority:

- Create only after kernel exists.
- Start with core spatial, operations, measurement and audit concepts.

---

### packages/db

Database schema, migrations and database-specific adapters.

Expected responsibilities:

- PostgreSQL/PostGIS schema.
- Migration files.
- Tenant-aware schema design.
- Audit tables.
- Event tables.
- Evidence tables.
- Spatial data tables.
- Future edge/cloud compatible schema strategy.

Important:

- Spatial schema must not be an afterthought.
- DB schema should co-evolve with domain.
- ORM choice is deferred to ADR-0004 or a later technical ADR.

Initial priority:

- Do not implement before ADR-0003 and ADR-0004.

---

### packages/sync-protocol

Versioned wire format for synchronization.

Expected responsibilities:

- Event envelope.
- Sync request/response shape.
- Conflict type taxonomy.
- Idempotency metadata.
- Device/user metadata.
- Versioning.
- Compatibility rules.

Rules:

- Must be stable and versioned.
- Must not depend on UI or database implementation.
- Must encode the trust rules from ADR-0001.

Initial priority:

- Do not implement before ADR-0005.

---

### packages/sync-core

Pure sync and reconciliation logic.

Expected responsibilities:

- Conflict detection.
- Event ordering.
- Reconciliation policies.
- Idempotency checks.
- Merge/reject/supersede decisions.
- Testable sync logic without I/O.

Rules:

- No database access.
- No HTTP calls.
- No UI imports.
- No platform-specific APIs.

Initial priority:

- Do not implement before ADR-0005.

---

### packages/api-contracts

API and RPC contract definitions.

Expected responsibilities:

- Request schemas.
- Response schemas.
- Validation schemas.
- API DTOs.
- Error contracts.
- Public API shapes.

Possible future tool:

- Zod or equivalent schema system.

Initial priority:

- Do not implement before tooling and backend strategy are approved.

---

### packages/spatial

Spatial primitives and helpers.

Expected responsibilities:

- GeoJSON canonical types.
- Geometry validation.
- Bounding boxes.
- Area/perimeter helpers.
- Coordinate transformation placeholders.
- Future WKB/WKT adapters.
- Future PostGIS helper mappings.
- Future Turf.js integration if selected.

Rules:

- Must not assume real Cooper/T. Smith coordinates unless confirmed.
- Must support simulated and georeferenced data.
- Must distinguish operational geometry from professionally validated geometry.

Initial priority:

- Create after kernel; before full map UI.

---

### packages/media

Evidence and media metadata contracts.

Expected responsibilities:

- Evidence metadata.
- Photo metadata.
- File reference model.
- Integrity hash fields.
- EXIF placeholder model.
- Future chunked upload contract.
- Future chain-of-custody extension points.

Initial priority:

- Create after kernel and audit concepts.

---

### packages/design-tokens

Shared design tokens.

Expected responsibilities:

- Colors.
- Spacing.
- Typography.
- Industrial UI theme.
- Light technical mode.
- Dark industrial mode.
- Future branding overrides per tenant.

Rules:

- UI must be configurable and themeable.
- Cooper/T. Smith branding must not be hardcoded into core components.

Initial priority:

- Create before serious UI work.

---

## Tooling

### tooling/eslint-config

Shared lint configuration.

Initial priority:

- Create after ADR-0004.

### tooling/tsconfig

Shared TypeScript configuration.

Initial priority:

- Create after ADR-0004.

---

## What Will Not Be Created Yet

The following should not be created until the relevant ADRs are approved:

- Full React app.
- Full API app.
- Full Edge server app.
- Full mobile app.
- Docker Compose.
- Database migrations.
- ORM schema.
- Authentication implementation.
- MapLibre implementation.
- Capacitor setup.
- CI/CD pipeline.
- Cloud deployment.
- Sync engine implementation.
- PostGIS schema.
- Evidence storage implementation.
- Recommendation engine.
- KPI engine.
- Scenario simulator implementation.

---

## Initial Creation Order

The intended order is:

1. ADR-0001 — Trust Boundaries & Baseline Threat Model.
2. ADR-0002 — Repository Structure & Monorepo Strategy.
3. ADR-0003 — Tenant Isolation Strategy.
4. ADR-0004 — Tooling / TypeScript / Package Manager.
5. ADR-0005 — Sync Protocol / IDs / Clocks / Outbox.
6. Minimal monorepo scaffold.
7. packages/kernel.
8. packages/domain initial behavioral primitives.
9. packages/spatial.
10. packages/media.
11. packages/db initial schema design.
12. packages/sync-protocol.
13. packages/sync-core.
14. apps/web smoke UI.
15. apps/edge skeleton.
16. apps/api skeleton.
17. apps/mobile spike.

---

## First Scaffold Scope

When scaffolding begins, only create the minimum necessary structure:

- root package.json.
- pnpm-workspace.yaml.
- tsconfig.base.json.
- .editorconfig.
- .nvmrc.
- apps placeholder with .gitkeep only if needed.
- packages placeholder with .gitkeep only if needed.
- tooling placeholder with .gitkeep only if needed.

Do not create full app frameworks in the first scaffold.

---

## Positive Consequences

- Strong separation between cloud, edge, worker, web, mobile and shared domain.
- Reduces risk of duplicated types and inconsistent contracts.
- Supports local-first and offline-first architecture.
- Supports future SaaS multi-tenancy.
- Supports future professional measurement workflows.
- Keeps edge and cloud trust boundaries visible in code.
- Allows incremental development without throwing away architecture.
- Avoids frontend hardcoding.
- Avoids backend-only abstraction detached from UI.
- Enables early smoke UI after core primitives exist.

---

## Negative Consequences

- More setup overhead than a single app.
- More package discipline required.
- More decisions must be documented before coding.
- May feel slower at the start.
- Requires strict control to avoid empty-folder architecture.
- Requires tooling decisions before implementation starts.
- Requires developers to understand package boundaries.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Overengineering before product feedback | Medium | High | Create only minimal scaffold; build smoke UI early |
| Empty folders create fake progress | Medium | Medium | Do not create folders until needed |
| packages/contracts becomes junk drawer | High | High | Split api-contracts, sync-protocol, spatial and media |
| Domain becomes types-only | Medium | High | Require behavioral domain with tests |
| Frontend hardcodes seed data | Medium | High | Use seed/config/contracts, not UI constants |
| Tooling complexity slows progress | Medium | Medium | ADR-0004 must keep tooling minimal |
| Mobile constraints arrive too late | Medium | High | Include mobile constraints in ADR-0005 and later spike |
| DB schema drifts from domain | Medium | High | packages/db must co-evolve with domain after tenant strategy |

---

## Decisions Conditioned or Blocked by this ADR

### ADR-0003 — Tenant Isolation Strategy

Must decide:

- How tenant_id is represented.
- How tenant-aware entities are enforced.
- How cloud differs from edge.
- Whether cloud uses schema-per-tenant, RLS, database-per-tenant, or hybrid strategy.

### ADR-0004 — Tooling / TypeScript / Package Manager

Must decide:

- Package manager.
- Workspace strategy.
- Node version.
- TypeScript strictness.
- ESLint and formatting.
- Build strategy.
- Testing baseline.

### ADR-0005 — Sync Protocol / IDs / Clocks / Outbox

Must decide:

- ID strategy.
- Clock strategy.
- Event envelope.
- Outbox format.
- Conflict model.
- Idempotency.
- Mobile-to-edge sync assumptions.
- Edge-to-cloud sync assumptions.

### Future Backend ADR

Must decide:

- Fastify vs NestJS or alternative.
- API module boundaries.
- Edge composition root.
- Cloud API composition root.
- Worker process model.

### Future Frontend ADR

Must decide:

- React/Vite confirmation.
- MapLibre confirmation.
- State management.
- Query/cache strategy.
- Design system.
- Smoke UI scope.

### Future Mobile ADR

Must decide:

- Capacitor vs alternative.
- SQLite plugin.
- File storage.
- Background sync constraints.
- Android-first assumptions.
- Future iOS support.

---

## Criteria for Future Revision

This ADR should be reviewed and possibly superseded when:

- The repository structure blocks development speed.
- The package boundaries create unnecessary coupling.
- A second tenant forces different cloud/edge assumptions.
- Mobile implementation invalidates shared package assumptions.
- Sync protocol requires different package separation.
- PostGIS/database strategy requires different schema ownership.
- The product pivots away from local-first edge deployment.
- The team grows and requires different developer experience.
