# ADR 0002: Shared contracts over duplicated HTTP types

## Status

Accepted.

## Context

The project has multiple runtimes:

- web cockpit
- cloud API
- edge runtime

Duplicating payload types across these runtimes would create drift.

## Decision

HTTP payload and route contracts live in packages/api-contracts.

Runtime packages import shared contracts instead of redefining payloads.

## Consequences

Positive:

- fewer contract mismatches
- safer refactors
- better build-time validation
- cleaner SaaS evolution path

Tradeoffs:

- contracts must remain stable
- runtime-specific details should not leak into shared types