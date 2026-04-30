# Platform Support Workflow MVP

## Goal

Add internal Aplomo support and customer success workflows for each tenant company.

## Route

/aplomo-admin

## Table

public.aplomo_platform_support_workflows

## What it tracks

- company
- status
- priority
- risk level
- assigned internal owner
- next touch date
- last touch date
- notes

## Why it matters

This turns Aplomo Super Admin into an operational platform for customer success, not just a dashboard.

It supports:

- support follow-ups
- onboarding ownership
- churn-risk handling
- customer success operations
- investor-grade SaaS operations
- internal accountability

## Who can read

- aplomo_owner
- aplomo_admin
- aplomo_support
- aplomo_viewer

## Who can write

- aplomo_owner
- aplomo_admin
- aplomo_support

## Files

- supabase/migrations/20260430000800_aplomo_platform_support_workflows.sql
- apps/web/src/integrations/aplomoPlatformSupportWorkflowRepository.ts
- apps/web/src/internal/AplomoPlatformSupportWorkflowPanel.tsx
