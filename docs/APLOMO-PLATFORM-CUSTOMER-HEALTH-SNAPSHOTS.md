# Platform Customer Health Snapshots

## Goal

Persist customer health scores in Supabase as auditable historical snapshots.

## Table

public.aplomo_customer_health_snapshots

## Route

/aplomo-admin

## Who can read

- aplomo_owner
- aplomo_admin
- aplomo_support
- aplomo_viewer

## Who can insert

- aplomo_owner
- aplomo_admin

## Why this matters

Customer health should not only be a visual calculation.

It must become a durable platform signal for:

- customer success
- onboarding follow-up
- support triage
- expansion risk
- churn risk
- investor-grade SaaS metrics
- internal accountability

## Files

- supabase/migrations/20260430000700_aplomo_customer_health_snapshots.sql
- apps/web/src/integrations/aplomoCustomerHealthSnapshotRepository.ts
- apps/web/src/internal/AplomoPlatformHealthSnapshotsPanel.tsx

## Next step

Add exportable customer health history and trend charts.
