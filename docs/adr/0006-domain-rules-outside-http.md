# ADR 0006: Domain rules outside HTTP

## Status

Accepted.

## Context

Stockpile lifecycle rules should not be hardcoded only inside API routes or React components.

HTTP and UI layers should call domain rules, not own them.

## Decision

Stockpile lifecycle rules live in packages/domain.

The API and web layers consume lifecycle metadata through shared contracts and API endpoints.

## Consequences

Positive:

- cleaner business rule ownership
- easier tests
- fewer duplicated status rules
- safer future mobile integration

Tradeoffs:

- domain package must remain dependency-light
- route handlers need to adapt domain output to HTTP contracts