# ADR-0003 - Tenant Isolation Strategy

**Status:** Proposed  
**Date:** 2026-04-28  
**Authors:** Carlos Sanchez Gutierrez  
**Deciders:** Carlos Sanchez Gutierrez  

---

## Context

Industrial Yard Intelligence is a local-first and offline-first industrial SaaS platform for spatial yard operations.

ADR-0001 defined the trust boundaries between cloud, edge, mobile apps, future measurement sources, evidence, audit, sync and tenant scope.

ADR-0002 defined the repository strategy and confirmed that cloud, edge, web, mobile, sync and shared packages must remain architecturally separated.

This ADR defines how tenant isolation must work before the first domain model, sync envelope, database schema, audit log, evidence model or mobile outbox is created.

Tenant isolation cannot be deferred because it affects:

- entity identifiers
- audit records
- sync events
- evidence ownership
- mobile local state
- edge server deployment
- cloud aggregation
- future billing and licensing
- future multi-terminal administration

---

## Decision

Use a hybrid tenant isolation model:

1. Edge Local Server is single-tenant per terminal in the initial architecture.
2. Cloud SaaS Control Plane is multi-tenant in the future.
3. Mobile Offline Apps operate within one active tenant and terminal context at a time.
4. All tenant-aware operational data must carry tenant identity from the first schema design.
5. Tenant context must be explicit in sync, audit, evidence, measurement and operational events.
6. Cloud tenant isolation implementation is deferred, but the domain model must not make tenant identity optional.

---

## Definitions

### Organization

A customer or company using the platform.

Initial example:

- Cooper/T. Smith

Future examples:

- port operator
- cement company
- mining company
- steel company
- recycling operation
- heavy logistics yard

### Terminal

A physical industrial operation belonging to an organization.

Example:

- Cooper/T. Smith Altamira Terminal

### Yard

A defined operating area within a terminal.

Examples:

- Muelle 1
- Muelle 2
- Patios de almacenaje
- Bodega
- Placa de concreto
- Espuela de ferrocarril

### Tenant

For this product, a tenant represents the isolated operational and commercial boundary of a customer deployment.

Initial interpretation:

tenant = organization + terminal deployment boundary

The exact commercial model may evolve, but the technical model must support tenant-level isolation from the beginning.

---

## Edge Tenant Model

### Decision

One edge server instance serves exactly one tenant terminal in the initial architecture.

### Rationale

Industrial yards may operate without internet and require local autonomy.

A single-tenant edge server simplifies:

- local deployment
- local network trust
- local evidence storage
- local operational database
- local sync reconciliation
- local troubleshooting
- customer ownership
- isolation between customers

### Consequences

The edge server does not need to host multiple unrelated customers.

The edge database may still include tenant_id in tenant-aware tables because:

- the same schema may be reused in cloud
- sync payloads need tenant context
- audit logs need explicit tenant provenance
- future migration to multi-tenant edge remains possible
- backups and exports remain self-describing

### Explicit Non-Goal

The initial edge server does not support multiple tenants in one physical edge deployment.

A future customer may request multi-terminal on one edge server, but that requires a future ADR.

---

## Cloud Tenant Model

### Decision

The future cloud control plane must be multi-tenant.

### Responsibilities

The cloud layer may eventually handle:

- tenant administration
- licensing
- billing
- configuration distribution
- analytics aggregation
- backups
- model management
- multi-terminal dashboards
- SaaS owner operations

### Deferred Implementation Decision

This ADR does not choose between:

- schema-per-tenant
- row-level security
- database-per-tenant
- hybrid tenant isolation
- separate cloud projects per enterprise customer

That choice is deferred until cloud persistence is designed.

### Current Constraint

Even though cloud implementation is deferred, all tenant-aware data must already carry enough tenant context to support future cloud aggregation and isolation.

---

## Mobile Tenant Model

### Decision

A mobile device operates within one active tenant and terminal context at a time.

### Rationale

Field operators work in a specific terminal and operational environment.

The app must not allow ambiguous writes without tenant context.

### Requirements

Mobile-created events must include:

- tenant identifier
- terminal identifier where applicable
- user identifier
- device identifier
- local timestamp
- sync metadata
- validation status
- source runtime

### Offline Behavior

If the mobile app is offline, it must still preserve tenant context in local storage and outbox events.

A mobile device must not create tenant-less operational events.

If the mobile app supports switching tenants in the future, tenant switching must require explicit context change and must not mix local outboxes.

---

## Tenant-Aware Data

The following categories are tenant-aware:

- operational events
- movements
- stockpiles
- yards
- zones
- tenant-configured materials
- equipment
- infrastructure
- evidence
- measurement sessions
- audit records
- recommendations
- scenarios
- KPI snapshots
- sync events
- devices registered to a tenant
- users assigned to a tenant

The following may be global, tenant-specific, or hybrid depending on future design:

- material master catalog
- measurement source types
- default roles
- default permissions
- default KPI definitions
- default scenario templates
- default map styles
- default validation states
- default confidence levels

Rule:

If an entity can affect a customer's operational data, it must either:

1. carry tenant_id
2. be explicitly classified as global immutable reference data
3. be copied into tenant-specific configuration before operational use

No entity should accidentally become global.

---

## Tenant Context Propagation

Tenant context must propagate through:

- API requests
- sync envelopes
- audit records
- evidence metadata
- measurement sessions
- domain events
- background jobs
- imports
- exports
- KPIs
- recommendations
- scenario simulations

A future implementation may use:

- request context
- authenticated session context
- explicit DTO field
- database policy
- service context
- sync envelope metadata

This ADR does not choose the mechanism. It establishes that tenant context must exist and must be enforceable.

---

## Sync and Tenant Isolation

All sync events must include tenant context.

### Mobile to Edge

Mobile-to-edge sync must reject events whose tenant context does not match the edge server tenant.

### Edge to Cloud

Edge-to-cloud sync must include tenant and terminal identifiers so the cloud can aggregate data safely.

### Cloud to Edge

Cloud-to-edge configuration updates must be scoped to the target tenant and terminal.

### Cross-Tenant Sync

Cross-tenant sync is not allowed.

Any event crossing tenant boundaries is a security defect unless explicitly modeled as an aggregate, anonymized, platform-level analytics record.

---

## Audit and Tenant Isolation

Audit records must include tenant context for tenant-aware operations.

Audit logs must support questions such as:

- Which tenant did this action affect?
- Which terminal did this action affect?
- Which user performed the action?
- Which device performed the action?
- Which runtime produced the action?
- Was the action mobile, edge, cloud or external ingestion?

Tenant-less audit records are only acceptable for platform-level SaaS administration events.

---

## Evidence and Tenant Isolation

Evidence files must be tenant-scoped unless explicitly classified as global reference assets.

Tenant-scoped evidence includes:

- photos
- field documents
- GeoJSON imports
- GeoTIFF imports
- future point clouds
- future scale tickets
- future drone outputs
- measurement files
- incident files

A future file storage design must prevent tenant data from being mixed in the same logical namespace without tenant scoping.

---

## User and Role Tenant Model

Users may eventually belong to multiple tenants.

Initial implementation may keep this simple, but the model must support:

- user identity
- tenant membership
- terminal membership
- role assignment per tenant or terminal
- device registration per tenant or terminal

Roles are not globally authoritative unless bound to a tenant or platform scope.

Example:

- A user may be Operator in one terminal.
- The same user may be Viewer in another terminal.
- A SaaS owner may have platform-level access but not operational write access to tenant data by default.

---

## Seed Data and Simulated Data

Cooper/T. Smith data used in early development is tenant-scoped seed data.

It must be marked as:

- seed
- simulated
- configurable
- not confirmed unless explicitly verified

Cooper-specific data must not be hardcoded into UI components.

It must live in one of:

- seed files
- configuration files
- database seed scripts
- tenant configuration
- mock API responses clearly marked as simulated

---

## Out of Scope

This ADR does not decide:

- PostgreSQL tenant isolation implementation
- row-level security
- schema-per-tenant
- database-per-tenant
- ORM
- authentication mechanism
- authorization engine
- role-permission matrix
- billing model
- SaaS pricing model
- cloud database design
- edge database implementation
- mobile SQLite schema
- sync wire format
- data residency policy
- encryption strategy

---

## Positive Consequences

- Tenant context is required before the first schema is designed.
- Edge and cloud responsibilities remain clearly separated.
- Mobile outbox events cannot be tenant-ambiguous.
- Audit records remain useful for enterprise review.
- Evidence files can be scoped correctly from the start.
- Future cloud SaaS aggregation remains possible.
- Cooper/T. Smith seed data can be separated from product logic.
- Multi-tenant expansion remains possible without rewriting the domain model.

---

## Negative Consequences

- More metadata is required in events and entities.
- Some tables may carry tenant_id even in single-tenant edge deployments.
- Developers must understand tenant context early.
- Additional care is required to avoid tenant leakage in mock data.
- Cloud implementation remains partially unresolved until a future ADR.
- Tenant scoping may feel heavy before multiple tenants exist.

---

## Risks

- Tenant ID may be added inconsistently across models.
- Cooper seed data may accidentally be hardcoded into UI.
- Future cloud isolation choice may conflict with early schema assumptions.
- Mobile outbox may mix tenant contexts if tenant switching is added too early.
- Edge single-tenant assumption may fail for a large customer.
- Global catalogs may accidentally mutate tenant behavior.
- Audit records may become useless if tenant context is missing.

Mitigations:

- Define TenantId in packages/kernel.
- Keep seed and configuration separate from UI components.
- Keep ADR-0003 implementation-neutral.
- Initially allow only one active tenant context per mobile device.
- Create a future ADR for multi-terminal edge deployments if required.
- Copy global templates into tenant configuration before operational use.
- Require tenant context for tenant-aware audit records.

---

## Decisions Conditioned or Blocked by this ADR

### ADR-0004 - Tooling / TypeScript / Package Manager

Must support shared tenant-aware primitives.

TenantId must be part of the first kernel package.

### ADR-0005 - Sync Protocol / IDs / Clocks / Outbox

Sync envelopes must include tenant context.

Mobile outbox must not mix tenant contexts.

Edge must reject tenant-mismatched sync events.

### packages/kernel

Must include TenantId and base tenant-aware metadata types.

### packages/domain

Domain entities that affect operational data must either carry tenant identity or explicitly reference tenant-scoped configuration.

### packages/db

Database schema must support tenant-aware data from the first migration.

### apps/edge

Edge runtime must be configured for exactly one active tenant terminal in the initial design.

### apps/api

Future cloud API must be designed as multi-tenant.

### apps/mobile

Mobile app must maintain one active tenant and terminal context when creating offline events.

---

## Criteria for Future Revision

This ADR should be reviewed and possibly superseded when:

- The first cloud persistence design is created.
- A second real tenant is onboarded.
- A customer requests multiple terminals on a single edge server.
- The billing model requires a different tenant definition.
- Cooper/T. Smith operational hierarchy does not match organization, terminal and site assumptions.
- Mobile app needs multi-tenant switching.
- Cloud analytics require anonymized cross-tenant aggregation.
- Legal or compliance requirements introduce data residency constraints.
