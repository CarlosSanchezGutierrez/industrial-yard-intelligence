# Phase 2 demo runtime smoke

## Purpose

This smoke validates that the running local stack supports the Phase 2 cockpit demo panels.

## Start stack

pnpm dev:stack:windows

## Command

pnpm phase2:runtime

## What it validates

- Cloud API health
- Edge health
- optional Cloud API demo reset
- Cloud API stockpiles
- Cloud API audit mutations
- Cloud API sync status
- Edge DB projection sync export
- Cloud API sync preview
- Cloud API sync ingest apply blocked

## Optional skip reset

pnpm phase2:runtime -- -SkipReset

## Meaning

If this passes, the live local stack supports the Phase 2 cockpit demo flow.

Status:

PHASE_2_DEMO_RUNTIME_READY
## Static status

Before runtime validation, run:

pnpm phase2:status -- -CheckOnly

This confirms the cockpit polish layer is structurally complete before hitting live endpoints.
## Presenter flow after runtime smoke

After runtime smoke passes, run:

pnpm phase2:presenter

Then follow:

docs/PHASE_2_DEMO_PRESENTER_SCRIPT.md
## Static closure before runtime smoke

Before running this runtime smoke, validate static closure:

pnpm phase2:close -- -CheckOnly
## Runtime note

`phase2:runtime` accepts empty CLI base URL arguments and falls back to:

- Cloud API: `http://localhost:8788`
- Edge: `http://localhost:8787`

If either service is offline, start the stack first:

`pnpm dev:stack:windows`
## Audit route note

`GET /audit/mutations` is intentionally skipped by default in `phase2:runtime`.

Reason:

The Phase 2 baseline validates the demo runtime path for health, reset, stockpiles and sync. Audit backend hardening moves to the next backend phase.

To include audit manually:

`pnpm phase2:runtime -- -IncludeAudit`