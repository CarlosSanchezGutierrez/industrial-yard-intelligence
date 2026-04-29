# ADR 0005: Sync preview before apply

## Status

Accepted.

## Context

Edge-to-cloud sync can corrupt cloud data if apply mode is introduced before conflict policy, validation and audit rules are mature.

## Decision

The v1 sync path supports:

- edge export package
- cloud sync status
- cloud sync preview
- cloud sync ingest with apply mode disabled

Real apply mode is intentionally blocked.

## Consequences

Positive:

- sync contracts can be tested now
- UI can show sync readiness
- smoke can validate full package flow
- production data mutation remains protected

Tradeoffs:

- sync is not operational yet
- ingest does not persist records yet
- conflict resolution remains future work