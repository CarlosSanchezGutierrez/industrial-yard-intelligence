# Platform Customer Health Trends Panel

## Goal

Analyze customer health trends and deltas over time.

## Route

/aplomo-admin

## What it shows

- latest score
- previous score
- delta
- trend direction
- snapshot count
- sparkline per company
- improving companies
- declining companies
- flat companies
- companies without enough history

## Why this matters

Aplomo needs to understand not just current customer health, but whether each account is improving or deteriorating.

This supports:

- customer success
- onboarding follow-up
- churn-risk detection
- support prioritization
- operational maturity tracking
- investor-grade SaaS reporting

## Files

- apps/web/src/internal/AplomoPlatformHealthTrendsPanel.tsx
- apps/web/src/internal/mountAplomoInternalTools.tsx

## Next step

Add platform support workflow: notes, follow-ups, risk owners and next-touch date per customer.
