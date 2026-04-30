# Service-role tenant invite flow

## Goal

Add a trusted server-side user invitation flow.

## Why

Supabase Auth Admin methods require the service_role key and must run only on a trusted server. The browser must never receive the service role key.

## Files

- api/tenant-invite-user.ts
- apps/web/src/integrations/aplomoTenantInviteRepository.ts
- apps/web/src/internal/AplomoTenantInvitePanel.tsx

## Environment variables required in Vercel

Server-side:

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

Client-side:

VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY

## Behavior

1. Tenant admin signs in normally from the app.
2. Frontend sends the user's access token to /api/tenant-invite-user.
3. API verifies the user using Supabase Auth.
4. API checks that the caller is:
   - aplomo_owner, or
   - aplomo_admin, or
   - tenant_owner for that company, or
   - tenant_admin for that company.
5. API sends invite using Supabase Auth Admin.
6. API creates aplomo_profiles and aplomo_company_memberships.

## Important

If the invited email already exists in aplomo_profiles, the API does not send an invite. It creates an active membership for the existing profile.

If the email is new, the API sends the email invite and creates membership with status invited.

A tenant admin can later set the membership to active from Tenant Admin MVP.
