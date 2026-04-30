# Tenant Admin Panel MVP

## Goal

Create the first customer-facing admin surface for each tenant company.

## Files

- apps/web/src/integrations/aplomoSupabaseTenantAdminRepository.ts
- apps/web/src/internal/AplomoTenantAdminPanel.tsx
- supabase/migrations/20260430000500_aplomo_tenant_admin_self_service_policies.sql

## What this enables

Customer company admins can manage their own operational catalog:

- memberships and roles for existing users
- sites
- devices
- material types
- stockpiles

## Important limitation

Creating brand-new Auth users or sending real invitations should not be done from the frontend with anon key.

That requires a backend/service-role flow.

This MVP supports managing existing memberships and operational entities through authenticated RLS.

## Next step

Add service-role backend flow for real user invitations.
