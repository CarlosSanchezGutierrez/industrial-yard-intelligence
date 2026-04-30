# Aplomo Super Admin Panel MVP

## Goal

Create the first internal cross-tenant platform admin surface for Aplomo.

## Files

- supabase/migrations/20260430000600_aplomo_platform_admin_select_policies.sql
- apps/web/src/integrations/aplomoSupabasePlatformAdminRepository.ts
- apps/web/src/internal/AplomoSuperAdminPanel.tsx

## What it shows

- Companies
- Memberships/users
- Admin counts
- Sites
- Devices
- Latest positions
- High precision position count
- Stockpiles
- Estimated volume and weight
- Last activity by company

## Who can use it

Users with platform_role:

- aplomo_owner
- aplomo_admin
- aplomo_support
- aplomo_viewer

## Important

This is read-only MVP.

Future platform admin modules should add:

- subscription/billing status
- customer health score
- support diagnostics
- audit logs
- safe support workflows
- no unsafe impersonation
