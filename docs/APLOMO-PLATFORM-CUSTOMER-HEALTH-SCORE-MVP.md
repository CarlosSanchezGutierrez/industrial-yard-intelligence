# Platform Customer Health Score MVP

## Goal

Add an internal Aplomo customer health scoring layer to the platform admin route.

## Route

/aplomo-admin

## Score dimensions

- Adoption
- Operations
- GPS quality
- Data readiness
- Recent activity

## Why it matters

This gives Aplomo an internal system for:

- onboarding prioritization
- customer success
- support triage
- expansion signals
- churn risk detection
- technical health monitoring

## Files

- apps/web/src/internal/AplomoPlatformCustomerHealthPanel.tsx
- apps/web/src/internal/mountAplomoInternalTools.tsx

## Next step

Add customer health score persistence and audit snapshots in Supabase.
