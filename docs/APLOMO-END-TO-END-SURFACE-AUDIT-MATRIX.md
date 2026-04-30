# Aplomo End-to-End Surface Audit Matrix MVP

## Goal

Make visible what already exists behind the product.

This audit maps each system area across:

- database tables
- RLS
- domain/contracts
- frontend repositories
- UI visibility
- CRUD maturity
- export maturity
- analytics maturity
- AI readiness
- visible gaps
- next actions

## Why

Aplomo already has significant backend/data/governance work.

If that work is not surfaced visually, administrators, professors, customers, investors and collaborators may not understand the depth of the system.

## Current truth

The current backend is mostly:

- Supabase Postgres
- Supabase REST
- RLS policies
- frontend repositories
- domain/api-contract/sync-core packages

A dedicated server-side API gateway is still pending.

## Key gap

The biggest product gap before LLM Provider Gateway is not another model. It is exposing more of the existing backend/data architecture through UI.

## Recommended next modules

1. Tenant Management Panel
2. User & Role Admin Panel
3. Site Operations Admin Panel
4. Device Fleet Management Panel
5. Material Catalog Panel
6. Stockpile Management + Analytics Panel
7. Operational Alert Center
8. Data Export Center
9. Audit Log Viewer
10. LLM Provider Gateway MVP
