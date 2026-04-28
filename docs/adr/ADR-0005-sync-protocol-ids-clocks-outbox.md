# ADR-0005 - Sync Protocol / IDs / Clocks / Outbox

**Status:** Proposed  
**Date:** 2026-04-28  
**Authors:** Carlos Sanchez Gutierrez  
**Deciders:** Carlos Sanchez Gutierrez  

---

## Context

Industrial Yard Intelligence is a local-first and offline-first industrial SaaS platform.

The system must support:

- offline mobile field capture
- local edge server operation
- synchronization without internet through a local network
- future edge-to-cloud synchronization
- spatial operational events
- evidence
- audit logs
- tenant-aware data
- future professional measurement sources

ADR-0001 defined trust boundaries.

ADR-0002 defined the monorepo strategy.

ADR-0003 defined tenant isolation.

ADR-0004 defined the TypeScript and package manager baseline.

This ADR defines the conceptual sync protocol, ID strategy, clock strategy, outbox pattern and conflict principles.

This ADR does not implement synchronization. It defines the rules that future packages and apps must respect.

---

## Decision

Use an event-based local-first synchronization model based on the Local Event Outbox pattern.

Initial decisions:

- Mobile apps create pending events locally.
- Pending events are stored in a local outbox.
- Edge server is the resolver and primary operational source of truth for its terminal.
- Sync events must include tenant, terminal, user and device context.
- IDs should use UUIDv7.
- Clock strategy should be Hybrid Logical Clock or equivalent logical timestamp mechanism.
- Sync must be idempotent.
- Conflicts must be explicit.
- Spatial operational aggregates should not use CRDT auto-merge.
- Edge-to-cloud sync is future work and should prefer edge-initiated synchronization.

---

## Core Sync Model

### Mobile to Edge

Mobile apps may operate without access to the edge server.

When offline, a mobile app must:

1. Save local changes.
2. Create a pending event.
3. Store the event in a local outbox.
4. Preserve tenant context.
5. Preserve user and device context.
6. Preserve local ordering metadata.
7. Mark the event as pending sync.

When the edge server becomes reachable, the mobile app sends pending events to the edge server.

The edge server then:

1. Validates tenant context.
2. Validates user and device context.
3. Validates event shape.
4. Applies domain rules.
5. Detects conflicts.
6. Accepts, rejects, supersedes or flags the event.
7. Returns sync results to the mobile app.

Mobile is not the source of resolved truth.

Mobile is a source of pending operational events.

---

### Edge as Resolver

The edge server is the local authority for operational state.

It resolves:

- event acceptance
- conflict detection
- validation state changes
- audit creation
- evidence association
- operational state projection
- sync acknowledgement

The edge server must not silently overwrite validated or more recent operational data.

When conflict cannot be resolved automatically by defined rules, it must be surfaced for supervisor review.

---

### Edge to Cloud

Edge-to-cloud sync is future work.

Initial rule:

- edge-initiated outbound sync is preferred
- cloud-initiated sync requires a future ADR
- cloud must not silently overwrite edge operational records
- cloud may distribute versioned configuration and policy updates
- edge must apply cloud configuration through auditable sync events

---

## ID Strategy

Use UUIDv7 as the default identifier strategy for new entities and events.

### Why UUIDv7

UUIDv7 is preferred because it provides:

- globally unique identifiers
- approximate time ordering
- compatibility with distributed systems
- better database locality than random UUIDv4
- suitability for offline-created records
- no central ID generator requirement

### Where IDs are required

IDs are required for:

- organizations
- tenants
- terminals
- yards
- zones
- assets
- stockpiles
- equipment
- infrastructure
- materials
- users
- devices
- events
- evidence
- measurement sessions
- sync envelopes
- audit entries
- recommendations
- scenarios
- KPI snapshots

### Deferred

This ADR does not choose a UUIDv7 library.

Library selection happens when packages/kernel is implemented.

---

## Clock Strategy

Use a logical timestamp strategy compatible with offline operation.

Preferred conceptual model:

- Hybrid Logical Clock, or equivalent.

### Why logical clocks

Wall-clock timestamps alone are insufficient because:

- mobile devices can have wrong clocks
- devices may be offline for long periods
- multiple devices may create events concurrently
- conflict detection needs ordering hints
- audit logs need both user-visible time and causal ordering metadata

### Required time metadata

Future sync events should include:

- client recorded timestamp
- server received timestamp when synced
- logical timestamp
- device sequence number or local event counter
- timezone or normalized UTC timestamp for display/audit
- sync attempt timestamps where useful

### Deferred

This ADR does not implement Hybrid Logical Clock.

ADR-0005 only establishes that wall-clock timestamps alone are not enough.

---

## Event Envelope

Every sync event must eventually be wrapped in a versioned event envelope.

Required conceptual fields:

- event_id
- event_type
- event_version
- tenant_id
- terminal_id where applicable
- user_id
- device_id
- source_runtime
- created_at_client
- received_at_edge
- logical_timestamp
- local_sequence
- idempotency_key
- aggregate_type
- aggregate_id
- validation_state
- confidence_level where applicable
- payload
- evidence_refs where applicable
- previous_event_refs where applicable

### Source runtime values

Possible source runtimes:

- mobile
- edge
- cloud
- external_ingestion

### Event result values

Possible sync results:

- accepted
- rejected
- conflict
- superseded
- duplicate
- invalid
- pending_review

---

## Idempotency

Sync must be idempotent.

If the same event is delivered multiple times, the result must be the same as if it were delivered once.

Required future mechanisms:

- stable event_id
- stable idempotency_key
- local_sequence
- device_id
- tenant_id
- aggregate_id
- event_version

The exact idempotency implementation is deferred.

---

## Local Outbox

Mobile apps must use a local outbox.

Conceptual outbox fields:

- outbox_id
- event_id
- tenant_id
- terminal_id
- device_id
- user_id
- event_type
- payload
- local_sequence
- status
- retry_count
- last_attempt_at
- created_at_client
- last_error

Possible statuses:

- pending
- syncing
- accepted
- rejected
- conflict
- failed
- superseded

The mobile app must not delete pending events until the edge server acknowledges them.

---

## Conflict Model

Conflicts must be explicit.

The system must not silently auto-merge operational state when doing so could hide a business or spatial conflict.

Initial conflict types:

- geometry_conflict
- status_conflict
- quantity_conflict
- duplicate_asset
- stale_measurement
- validation_conflict
- tenant_mismatch
- device_identity_conflict
- evidence_conflict

### CRDT Decision

CRDTs are rejected for initial spatial operational aggregates.

Reason:

- yard operations need explicit accountability
- geometry conflicts must be visible
- supervisor review is often required
- automatic merge may create false operational truth
- auditability matters more than invisible convergence

CRDTs may be reconsidered later for low-risk collaborative UI state, but not for stockpiles, movements, validations, evidence or measurement sessions.

---

## Validation and Confidence During Sync

Sync must preserve validation and confidence semantics.

A mobile event may create data in:

- draft
- operational
- pending_review

A mobile event must not promote data to:

- validated
- professionally_validated

unless explicitly authorized by a defined workflow.

A supervisor validation action may occur through mobile or web, but it must still be recorded as an auditable event and reconciled by edge.

A measurement confidence level must not be promoted without an explicit validation or processing event.

---

## Tenant and Sync

All sync events must include tenant context.

Rules:

- mobile-to-edge sync must reject tenant mismatch
- edge-to-cloud sync must include tenant and terminal context
- cloud-to-edge configuration sync must be scoped to target tenant and terminal
- mobile outbox must not mix tenant contexts
- cross-tenant sync is not allowed unless explicitly modeled as anonymized platform analytics

---

## Evidence and Sync

Evidence sync may involve files larger than normal event payloads.

Initial conceptual rule:

- events reference evidence
- evidence files are synced or uploaded separately
- evidence metadata is part of the event
- raw files remain immutable
- file transfer protocol is deferred

Future evidence sync must handle:

- photos
- documents
- GeoJSON
- GeoTIFF
- point clouds
- scale tickets
- drone outputs
- measurement files

---

## Audit and Sync

Every accepted, rejected or conflicted sync event must produce audit-relevant information.

The edge server must be able to answer:

- who created the event
- which device created it
- when it was created locally
- when edge received it
- what aggregate it affected
- what result it produced
- whether it created a conflict
- whether it changed validation state
- whether it referenced evidence

---

## Out of Scope

This ADR does not decide:

- SQLite schema
- PostgreSQL schema
- ORM
- backend framework
- API transport
- WebSocket vs HTTP polling
- file upload protocol
- sync batching strategy
- retry backoff algorithm
- compression
- encryption
- authentication
- authorization
- cloud sync implementation
- mobile background sync implementation
- exact HLC algorithm
- UUIDv7 library

---

## Positive Consequences

- Offline behavior is defined before mobile or edge code exists.
- Mobile is correctly treated as a pending event source.
- Edge is correctly treated as resolver.
- Tenant context is required in sync.
- Device and user provenance are required in events.
- Conflicts are explicit.
- Audit and evidence requirements are preserved.
- Future edge-to-cloud sync has a clean conceptual foundation.
- UUIDv7 allows offline-friendly IDs without a central generator.
- Logical clocks prevent overreliance on device wall time.

---

## Negative Consequences

- Sync design becomes more complex than simple CRUD.
- More metadata is required on every event.
- Developers must think in events instead of direct state mutation.
- Conflict handling requires future UI and supervisor workflow.
- Logical clock implementation adds complexity.
- File/evidence sync is deferred and remains a future risk.

---

## Risks

- Event envelopes may become too heavy.
- Mobile implementation may shortcut outbox rules.
- Edge resolver may become too complex.
- Conflicts may overwhelm supervisors if rules are weak.
- UUIDv7 library choice may affect compatibility.
- Logical clock implementation may be misunderstood.
- Evidence files may fail to sync reliably if file transfer is designed too late.
- Background sync limitations on Android or iOS may affect implementation.

Mitigations:

- Start with a minimal event envelope.
- Implement sync-core as pure testable logic.
- Keep file sync separate from event sync.
- Build conflict UI only after real conflict cases exist.
- Add tests for idempotency and replay.
- Keep mobile tenant context simple at first.
- Use supervisor workflow for high-risk conflicts.

---

## Decisions Conditioned by this ADR

### packages/kernel

Must include:

- EventId
- TenantId
- TerminalId
- UserId
- DeviceId
- AggregateId
- ValidationState
- ConfidenceLevel
- ConflictType
- SourceRuntime

### packages/sync-protocol

Must define versioned sync event envelopes.

### packages/sync-core

Must implement pure reconciliation and conflict detection logic.

### apps/mobile

Must use a local outbox.

### apps/edge

Must act as sync resolver.

### apps/edge-worker

May process sync queues and reconciliation tasks.

### packages/audit or domain audit module

Must produce audit-relevant records from sync outcomes.

### packages/media

Must support evidence references in sync events.

---

## Criteria for Future Revision

This ADR should be reviewed when:

- first mobile outbox implementation begins
- first edge sync resolver implementation begins
- evidence file sync design begins
- cloud sync design begins
- real field testing reveals conflict patterns
- mobile background sync limitations force a different strategy
- CRDTs become relevant for low-risk collaborative UI state
- measurement devices require specialized ingestion behavior
