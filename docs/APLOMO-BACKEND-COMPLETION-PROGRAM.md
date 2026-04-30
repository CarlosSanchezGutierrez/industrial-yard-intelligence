# Aplomo Backend Completion Program v1

## Executive decision

LLM Provider Gateway is intentionally paused.

Aplomo will first complete backend, data, contracts, RLS, governance, exports, analytics, quality, cloud readiness and UI visibility.

## Why

Aplomo is being built as a SaaS industrial intelligence platform, not a demo.

Before connecting external LLM providers, the system needs:

- canonical domain boundaries
- explicit contracts
- stable database schema
- RLS and role discipline
- CRUD consistency
- audit trails
- export center
- analytics center
- data quality
- lineage
- cloud integration readiness
- visible UI surfaces
- AI governance

## Architecture direction

Aplomo should grow as:

domain
-> contracts
-> database
-> RLS policies
-> repositories
-> services / use cases
-> audit
-> exports
-> analytics
-> data quality
-> cloud connectors
-> UI/UX
-> governed AI

## Completion rule

A capability is not complete unless it covers:

1. Domain
2. Contracts
3. Database
4. RLS
5. Repository
6. Service/use case
7. Audit
8. Export
9. Analytics
10. Data quality
11. UI
12. AI governance
13. Cloud readiness

## Created files

- packages/domain/src/aplomoPlatformCapabilityRegistry.ts
- packages/api-contracts/src/aplomoPlatformCapabilityContracts.ts

## Current program stages

1. Backend Capability Registry
2. Schema Migration Ledger
3. Data Quality and Lineage Core
4. Canonical CRUD Completion
5. Export and Analytics Center
6. Cloud Integration Readiness
7. UI Productization
8. LLM Provider Gateway

## Strategic value

This makes Aplomo easier to:

- scale technically
- sell as enterprise SaaS
- explain to investors
- audit for due diligence
- integrate with AWS, Azure and Google Cloud
- connect to Snowflake, Databricks, Power BI and Excel
- govern future AI/LLM workflows
- survive technical review from a serious acquirer

## Immediate next module

Schema Migration Ledger + Schema Audit Findings.
