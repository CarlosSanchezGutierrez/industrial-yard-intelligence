# ADR 0003: JSON DB before Postgres

## Status

Accepted.

## Context

The current stage is architecture skeleton and prototype validation.

Adding Postgres too early would increase setup complexity before repository boundaries and contracts are stable.

## Decision

The v1 skeleton uses a shared DB package and JSON file persistence first.

Postgres is deferred until after:

- contracts stabilize
- repositories stabilize
- smoke/runtime flows stabilize
- sync semantics are clearer

## Consequences

Positive:

- easier local setup
- faster iteration
- easier student/demo delivery
- repository interfaces can mature first

Tradeoffs:

- not production-grade storage
- no transactional guarantees equivalent to Postgres
- migration planning is still required later