# ADR 0004: Audit before production sync

## Status

Accepted.

## Context

Industrial systems require traceability.

Sync without audit would make it difficult to explain who changed what, when and from which runtime.

## Decision

Mutation audit is added before real sync apply mode.

The Cloud API records mutation audit entries for important stockpile operations and exposes audit query endpoints.

## Consequences

Positive:

- traceability exists before real sync
- future conflict resolution can reference audit history
- cockpit can show accountability
- investor demo has a stronger industrial narrative

Tradeoffs:

- audit storage is still JSON-based in v1
- hash-chain hardening can come later
- actor identity is not real until auth exists