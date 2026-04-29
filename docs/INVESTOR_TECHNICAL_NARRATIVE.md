# Investor technical narrative

## One-line technical thesis

Industrial Yard Intelligence turns physical stockpile operations into auditable, local-first, cloud-ready operational intelligence.

## Problem

Bulk material yards operate with physical complexity:

- distributed stockpiles
- changing material states
- manual supervision
- evidence gaps
- connectivity constraints
- limited traceability
- hard-to-audit status changes

## Technical solution

The system uses a local-first architecture:

- edge runtime for yard operation
- cloud API skeleton for future SaaS backend
- web cockpit for supervisors
- shared DB model
- shared HTTP contracts
- domain rules
- mutation audit
- sync preview pipeline

## Why local-first matters

A port/yard environment cannot assume perfect connectivity.

The edge runtime allows future field operation to continue close to the physical yard.

## Why SaaS-ready matters

The architecture can evolve from one Cooper/T. Smith prototype into a repeatable SaaS platform for industrial yards.

Future SaaS expansion can support:

- multiple tenants
- multiple terminals
- multiple yards
- role-based workflows
- cloud dashboards
- edge-cloud sync
- historical audit analytics

## Why audit matters

Industrial operations need accountability.

The current skeleton already models mutation audit for:

- stockpile creation
- stockpile status updates
- stockpile-specific history

## Why sync preview matters

The project does not blindly apply edge data to cloud.

It first exports packages from edge and previews them in the Cloud API.

Apply mode remains intentionally disabled until conflict rules and persistence rules are ready.

## Current technical moat

The early moat is architecture discipline:

- contract-first boundaries
- local-first runtime split
- domain-owned lifecycle rules
- auditable mutations
- safe sync design
- smoke-tested local stack

## Current limitation

This is not production-ready yet.

Missing production layers include:

- authentication
- authorization
- Postgres adapter
- real sync apply mode
- deployment pipeline
- mobile capture app
- advanced geospatial UI
- production media/evidence storage

## Why this is investable as a prototype

The project already demonstrates the right foundation:

- clear operating problem
- clear architecture boundary
- prototype cockpit
- local runtime
- cloud backend skeleton
- auditability
- sync path planning
- scalable SaaS direction

## Next technical milestones

1. UI demo polish.
2. Auth and role model.
3. Real sync ingest design.
4. Postgres adapter.
5. Mobile capture prototype.
6. Deployment pipeline.
7. Geospatial map workflow.
8. Evidence hardening.