# Demo operator v1

This is the recommended live demo sequence for Industrial Yard Intelligence / Modelo Namiki.

## Goal

Show that the project is no longer just isolated code.

It now has a coherent architecture skeleton:

- local-first edge runtime
- cloud API skeleton
- web cockpit
- shared contracts
- shared DB model
- domain rules
- audit trail
- sync preview path
- smoke validation
- architecture readiness gate

## Pre-demo preparation

Run:

pnpm install
pnpm architecture:check
pnpm typecheck
pnpm test

Then start the local stack:

pnpm dev:stack:windows

Expected local services:

- Cloud API: http://localhost:8788
- Edge API: http://localhost:8787
- Web cockpit: Vite URL printed by the terminal

## Live demo order

### 1. Architecture readiness

Run:

pnpm architecture:check

Explain:

The project validates the required skeleton pieces automatically before calling the architecture v1-ready.

### 2. Start local stack

Run:

pnpm dev:stack:windows

Explain:

The stack runs local-first edge, cloud API skeleton and web cockpit locally.

### 3. Open web cockpit

Show:

- Cloud API panel
- DB projection panel
- stockpile creation panel
- stockpile status update panel
- audit mutation panel
- stockpile-specific audit history
- Cloud Edge sync readiness panel

### 4. Create stockpile

Use the web cockpit to create a new stockpile.

Explain:

This proves the Cloud API can accept operational yard data and persist it in the JSON DB skeleton.

### 5. Update stockpile status

Move stockpile lifecycle status.

Explain:

Lifecycle rules are not random UI logic. They are domain rules from packages/domain.

### 6. Show mutation audit

Open the audit panel.

Explain:

Every important mutation becomes visible for traceability.

### 7. Show stockpile-specific audit history

Select a stockpile.

Explain:

The system can answer what happened to one specific stockpile.

### 8. Show Cloud Edge sync readiness

Run preview and ingest validation from the cockpit.

Explain:

Sync apply mode is intentionally disabled. The project validates package flow without risking data corruption.

### 9. Run smoke scripts

Run:

pnpm api:smoke
pnpm demo:smoke
pnpm sync:smoke

Explain:

These scripts validate the API, edge and integrated sync runtime paths.

## Technical talking points

### Local-first

The edge service exists because industrial yards cannot depend fully on cloud availability.

### SaaS-ready

The API service exists because the product can become a multi-tenant cloud platform later.

### Contract-first

packages/api-contracts prevents runtime drift between web, edge and cloud.

### Domain-first

packages/domain keeps business rules outside HTTP handlers and UI components.

### Audit-first

Mutation audit comes before real sync apply mode so future sync decisions remain explainable.

### Safe sync

Edge export and cloud preview exist now. Real apply mode is deferred until conflict and persistence rules are mature.

## Closing statement

The v1 skeleton proves a scalable architecture direction, not a finished production system.

It is ready for:

- prototype demo
- technical review
- incubator presentation
- investor architecture explanation
- next-phase planning