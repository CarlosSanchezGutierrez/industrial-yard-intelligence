# Schema Migration Ledger + Schema Audit Findings MVP

## Goal

Stop guessing what exists in Supabase.

This module creates a schema governance foundation for:

- migration ledger
- applied/expected migration tracking
- schema audit findings
- legacy column findings
- policy gaps
- missing tables/columns
- capability readiness status
- backend completion tracking

## Tables

- public.aplomo_schema_migration_ledger
- public.aplomo_schema_audit_findings
- public.aplomo_schema_capability_status

## Why this matters

Aplomo has already gone through manual Supabase migrations and compatibility repairs.

Without a ledger, schema drift becomes invisible.

This module makes schema state auditable, visible and productized.

## Route

/aplomo-admin

## UI panel

AplomoSchemaMigrationLedgerPanel

## Next step

Data Quality + Lineage Core.

That module will introduce:

- aplomo_data_assets
- aplomo_data_quality_rules
- aplomo_data_quality_runs
- aplomo_data_lineage_edges
