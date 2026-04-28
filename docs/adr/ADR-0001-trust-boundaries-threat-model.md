# ADR-0001 — Trust Boundaries & Baseline Threat Model

**Status:** Proposed  
**Date:** 2026-04-28  
**Authors:** Carlos Sanchez Gutierrez  
**Deciders:** Carlos Sanchez Gutierrez  

---

## Context

Industrial Yard Intelligence is a local-first, offline-first SaaS platform for spatial industrial yard operations. The system must function across three distinct execution environments:

- **Cloud SaaS Control Plane** — future multi-tenant administration layer.
- **Edge Local Server** — one per terminal, runs inside the industrial yard, often without internet connectivity.
- **Offline Mobile Apps** — field devices carried by yard operators.

Additionally, the system will eventually ingest data from external measurement sources such as GNSS RTK, GPS industrial, drones, photogrammetry, LiDAR, total stations, scales, sensors, CAD/GIS files, GeoJSON and GeoTIFF. It will also capture evidence such as photos, documents, geospatial files and future measurement artifacts.

Before any repository structure, technology stack, or data model decisions are made, the trust boundaries between these environments must be explicitly defined. Without this, contracts, sync protocols, audit models, security assumptions and tenant boundaries may encode incorrect assumptions about what can be trusted.

This ADR does not implement any of these concerns. It establishes the conceptual trust model that subsequent ADRs and implementations must respect.

---

## Decision

Define the trust model for Industrial Yard Intelligence with four trust domains and their explicit boundaries, trust levels, responsibilities, and data ownership rules:

1. Cloud SaaS Control Plane.
2. Edge Local Server.
3. Mobile Offline Apps.
4. Future Measurement Sources.

---

## Trust Domains

### 1. Cloud SaaS Control Plane

**Trust level:** High — operated by the platform provider, not by customer field staff.

**Responsibilities:**

- Future multi-tenant administration.
- Licensing and provisioning of edge servers.
- Aggregated analytics and reporting across terminals.
- Master configuration distribution for yards, roles, rules and measurement types.
- Cloud backup and disaster recovery.
- Future AI/ML model management.
- Future identity provider or federation point.

**Explicitly does NOT:**

- Act as the real-time primary source of truth for field operations.
- Store real-time field data directly from mobile devices as authoritative operational state.
- Control field operations when internet is unavailable.
- Assume edge servers are always reachable or fully synchronized.

**Future data it may receive:**

- Aggregated KPIs.
- Validated operational events.
- Approved measurements.
- Tenant configuration changes.
- Resolved conflicts.
- Audit records from edge sync.

**Trust assumption:**

Cloud may distribute configuration and policy updates to edge servers, but edge must apply them through versioned, auditable, and locally accepted sync events. Cloud cannot silently overwrite operational data created at the edge without a validated sync process.

---

### 2. Edge Local Server

**Trust level:** Operational — trusted for yard-level decisions, not for platform-wide decisions.

The edge server is the primary operational source of truth for its terminal while operating locally.

**Responsibilities:**

- Store operational data for its terminal.
- Store entities, events, geometries, audit records and evidence.
- Serve the web dashboard to local network clients.
- Coordinate and validate sync from mobile devices.
- Serve map tiles and spatial layers to mobile and web clients.
- Execute local business rules and validation workflows.
- Manage evidence files such as photos, documents and geospatial files.
- Operate fully without internet connectivity.
- Sync with cloud when connectivity is available.

**Tenant boundary:**

For the initial design, one edge server instance corresponds to exactly one tenant terminal. A single physical edge server does not host multiple tenants. This simplifies isolation, local network trust, and deployment.

Multi-tenant aggregation happens only at the future cloud layer.

**Validation rule:**

The edge server may record supervisor validation workflows. It must not automatically promote data to `professionally_validated` without a certified measurement source or explicitly approved process.

**Physical form:**

The edge server may run on a laptop, mini PC, industrial PC, local server, or future dedicated appliance. It is not assumed to be inside a secure data center. Physical security is the customer's responsibility.

---

### 3. Mobile Offline Apps

**Trust level:** Low-to-medium — untrusted until edge validates and reconciles.

**Responsibilities:**

- Capture field events.
- Capture movements, equipment states, material updates and geometry drawings.
- Capture evidence such as photos, GPS coordinates and annotations.
- Queue events in a local outbox when the edge server is unreachable.
- Display operational state from the last sync.
- Identify the acting user and device on every action.

**Explicitly does NOT:**

- Act as the source of truth.
- Resolve sync conflicts autonomously without defined rules.
- Silently discard conflicting data.
- Issue its own credentials independently of the auth model.

**Every event captured on mobile must eventually carry:**

- User identifier.
- Device identifier.
- Client-side timestamp.
- Local sequence number.
- Source information.
- Validation state.
- Sync status.

The exact clock strategy, idempotency key design, and outbox protocol are deferred to ADR-0005.

**Trust assumption:**

Mobile data is untrusted at capture. It becomes operational data only after edge reconciliation. It becomes validated data only after a supervisor or certified process approves it.

---

### 4. Future Measurement Sources

**Trust level:** External — treated as data providers, not inherently trusted system actors.

**Includes:**

- GNSS RTK.
- GPS industrial.
- Survey pole / bastón topográfico.
- Drone RTK/PPK.
- Photogrammetry.
- LiDAR.
- Total station.
- Scales.
- External sensors.
- CAD/GIS imports.
- GeoJSON.
- GeoTIFF.

**Design constraints:**

Each measurement session must eventually carry:

- Source type.
- Operator.
- Device or instrument.
- Capture timestamp.
- Raw data reference.
- Processed geometry.
- Assigned confidence level.
- Validation state.

Confidence levels follow the defined taxonomy:

- `simulated`
- `approximate`
- `operational`
- `georeferenced`
- `centimeter_ready`
- `professionally_validated`

The system must never promote a measurement's confidence level without explicit validation action.

Raw files such as point clouds, GeoTIFF, DXF, CSV, images or other imports are stored as evidence. Processed geometry derived from them is stored in the spatial model with a reference back to the raw evidence.

Future integrations must use defined ingestion contracts. They must not parse files ad hoc inside business logic.

**Trust assumption:**

External sources are not automatically trusted actors in the system. They are inputs that require a human, service account, or validated workflow to assign confidence and incorporate them into the operational record.

---

## Evidence & Files

Evidence is any file or record attached to an operational event, asset, measurement, validation, or audit-relevant action.

**Examples:**

- Photo.
- Document.
- Image.
- GeoJSON.
- GeoTIFF.
- CAD/GIS file.
- Future point cloud.
- Future drone output.
- Future scale ticket.
- Future sensor export.

**Design constraints:**

Every evidence item must eventually carry:

- Type.
- Owner or origin.
- User, device, service account, or ingestion process where applicable.
- Creation timestamp.
- Related entity.
- Related event.
- Storage reference.
- Integrity hash or checksum field.

Evidence must have a future-ready slot for integrity verification. This field should exist in the data model from the first migration, even if initially nullable.

GeoJSON and future GeoTIFF or point cloud files are evidence when they arrive as external imports. They become spatial data only when processed and incorporated into the model via a measurement session.

Evidence is immutable after creation. Corrections create a new evidence record linked to the previous one; they do not overwrite the original.

**Explicitly deferred:**

Full cryptographic chain-of-custody, hash chaining, device signing, legal-grade tamper evidence, and key management. The data model should accommodate these features, but implementation is deferred to a future ADR.

---

## Audit Log

**Design constraints:**

Every important action in the system must produce an audit record.

Minimum required fields per audit entry:

- User.
- Device.
- Timestamp.
- Action type.
- Affected entity ID.
- Affected entity type.
- Previous value snapshot.
- New value snapshot.
- Source.
- Result.

Possible sources include:

- Mobile.
- Edge.
- Cloud.
- External ingestion process.

Possible results include:

- Success.
- Failure.
- Conflict.
- Rejected.
- Superseded.

The audit log must be append-oriented. Existing audit records are never modified or deleted.

Audit records reference the sync event that created them when applicable.

KPI values derived from operational data must carry a classification:

- `real`
- `estimated`
- `simulated`
- `pending_validation`

**Explicitly deferred:**

Partitioning strategy, archival policy, hash-chained integrity, and physical append-only enforcement at the database level. These are implementation decisions for later ADRs.

---

## Offline Sync Trust Model

The sync model follows an event outbox pattern. Design details are deferred to ADR-0005.

**Trust constraints established here:**

- Mobile devices are sources of pending events, not sources of resolved state.
- Edge is the resolver for local operational state.
- An event received from mobile that conflicts with current edge state must surface the conflict explicitly.
- The edge server must not silently overwrite operational data based on mobile sync.
- Conflicts require resolution through defined rules or supervisor action.
- Edge-to-cloud sync follows the same principle: cloud does not silently overwrite edge operational records.
- Cloud sync may distribute configuration and policy updates downward.
- Initial sync should prefer edge-initiated outbound synchronization.
- Cloud-initiated synchronization requires a future ADR and explicit security model.
- Events replayed during sync must be idempotent.

Conflict types the system must eventually handle:

- `geometry_conflict`
- `status_conflict`
- `quantity_conflict`
- `duplicate_asset`
- `stale_measurement`
- `validation_conflict`

Mechanisms such as idempotency keys, sequence numbers, event versioning and clock strategy are deferred to ADR-0005.

---

## Tenant Boundary

- One edge server instance equals one tenant terminal for the initial design.
- Cloud is the future multi-tenant aggregator.
- Tenant isolation strategy on cloud is deferred to ADR-0003.
- Tenant-aware entities must carry `tenant_id` from the first schema design.
- The exact propagation mechanism is deferred to ADR-0003 and ADR-0004.
- The system must not assume that mobile, edge and cloud share identical tenant isolation mechanisms.

Possible future tenant isolation strategies include:

- Schema-per-tenant.
- Row-level security.
- Database-per-tenant.
- Hybrid strategy.

This ADR does not choose between them.

---

## Security Baseline

**Established here as design constraints:**

### Authentication

Every state-changing action must be attributable to a user, device, service account, or ingestion process.

External measurement sources must be identified as data sources, not necessarily as authenticated actors.

Anonymous writes are not permitted.

Authentication mechanism is deferred to a future ADR.

Possible future mechanisms include:

- Edge-local accounts.
- Federated identity.
- JWT.
- Offline tokens.
- Device-bound credentials.

### Authorization

Role-based access control must be part of early implementation.

Roles must be configurable per tenant.

Specific role definitions and permission checks are deferred to a future ADR.

### Device as Actor

Devices are first-class actors in the audit model.

A user action should carry both user identity and device identity where applicable.

### Untracked Changes

Any state change that bypasses the event model or audit log is a defect, not a feature.

Direct production database mutations outside application logic are prohibited.

### Validation State Gates

Data in `validated` or higher-confidence states must not be modified without producing a correction event that references the original.

The system must enforce this at the domain model level, not only at the UI level.

### Evidence Integrity

Integrity verification fields must exist in the data model from the first migration.

Cryptographic implementation is future work.

### Offline Trust Boundary

The edge server is not a trusted platform node in the same way a cloud service is.

Its physical security depends on customer premises.

The system design must not assume edge storage is tamper-proof.

---

## Out of Scope for this ADR

The following decisions are explicitly deferred:

- ORM choice.
- Backend framework.
- Frontend framework.
- Monorepo structure and package layout.
- Tenant isolation implementation.
- Package manager.
- TypeScript configuration.
- ESLint setup.
- Sync protocol wire format.
- Idempotency key design.
- Clock strategy.
- Conflict resolution algorithm.
- Authentication implementation.
- Authorization implementation.
- Audit log partitioning.
- Audit log archival.
- Chain-of-custody cryptographic implementation.
- Mobile shell.
- PostGIS spatial indexing.
- Schema design.
- Map tile source.
- CI/CD pipeline.
- Release signing.
- LFPDPPP / GDPR compliance implementation.

---

## Positive Consequences

- Subsequent ADRs have an explicit trust model to validate against.
- Package split decisions can reference trust boundaries directly.
- Sync contracts can reference mobile-as-untrusted and edge-as-resolver.
- Audit schemas can reference required provenance fields.
- Tenant-aware data is required from the start.
- Device identity is established early.
- Evidence and audit append-oriented constraints are established before the first schema migration.
- Edge-as-single-tenant-physical-boundary is explicit.
- Future enterprise security discussions have a reference document.

---

## Negative Consequences

- Adds ADR overhead before code exists.
- Slows the first visible UI milestone.
- Some assumptions may change once real Cooper/T. Smith operational details are confirmed.
- Deferred cryptographic chain-of-custody creates a window where early data may be operational but not legally defensible.
- Single-tenant-per-edge may need revision if a future customer wants multiple terminals on one edge server.
- Security concerns may influence repository structure and implementation order earlier than a visual-first product team would prefer.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Cooper/T. Smith operational details reveal edge assumptions are wrong | Medium | High | Review with operations stakeholders before ADR-0003 |
| Deferred chain-of-custody means early operational data is not legally defensible | Medium | Medium | Mark early data as operational, not professionally_validated |
| Edge physical security failure exposes tenant data | Low | High | Document disk encryption as deployment prerequisite |
| Mobile background sync constraints affect sync design | Medium | High | Include Android/iOS sync constraints in ADR-0005 |
| Single-tenant-per-edge limits future commercial flexibility | Low | Medium | Define exception path in ADR-0003 |
| Future measurement sources arrive with proprietary formats | Low | Medium | Store raw files as evidence and normalize through ingestion adapters |

---

## Decisions Conditioned or Blocked by this ADR

### ADR-0002 — Repository Structure & Monorepo Strategy

Must expose `apps/edge` as a separate composition root from future `apps/api`, reflecting the trust boundary between edge and cloud.

Packages shared between cloud and edge must not encode cloud-only trust assumptions.

### ADR-0003 — Tenant Isolation Strategy

Must respect the initial single-tenant-per-edge constraint.

Must decide cloud tenant isolation strategy.

Must decide how `tenant_id` is propagated and enforced.

### ADR-0004 — Tooling / TypeScript / Package Manager

Must support strict type boundaries, shared domain types, and schema evolution.

Must not make tenant or provenance metadata optional by accident.

### ADR-0005 — Sync Protocol / IDs / Clocks / Outbox

Must encode:

- Mobile as pending-event source.
- Edge as resolver.
- Conflict taxonomy.
- Idempotency.
- Device identity.
- User identity.
- Clock strategy.

### Domain Entity Design

Operational, spatial, measurement, evidence, and event entities must carry validation and provenance metadata where applicable.

Tenant-aware entities must carry `tenant_id` from the first schema design.

### Evidence Data Model

Must include an integrity hash or checksum field, nullable at first if necessary.

### Audit Log Data Model

Must be append-oriented and include the minimum fields defined in this ADR.

---

## Criteria for Future Revision

This ADR should be reviewed and possibly superseded when:

- Cooper/T. Smith confirms operational details that contradict any trust assumption made here.
- A second tenant is onboarded.
- Chain-of-custody implementation is initiated.
- Edge-to-cloud sync is implemented.
- A security audit of the platform is commissioned.
- A future tenant requests multi-terminal operation on a single edge server.
- A certified professional measurement workflow is implemented.
- The product expands from local-first edge deployment to fully managed cloud operation.
