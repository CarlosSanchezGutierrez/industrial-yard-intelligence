# ADR 0001: Local-first edge architecture

## Status

Accepted.

## Context

Industrial yards can have unstable connectivity, operational latency constraints and local evidence capture requirements.

The system must keep yard operations available even when cloud connectivity is not guaranteed.

## Decision

The system uses a local-first architecture.

apps/edge owns the local runtime path.

apps/api represents the future cloud/principal backend.

apps/web can consume both edge and cloud endpoints.

## Consequences

Positive:

- yard operations are not blocked by cloud availability
- local demos are easier
- future SaaS cloud architecture remains possible
- sync can be introduced incrementally

Tradeoffs:

- sync boundaries must be explicit
- conflict handling must be designed carefully
- local and cloud API contracts must stay aligned