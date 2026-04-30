# Aplomo Demo Access + Role Accounts Foundation

This is the first productization step before live device tracking and operational map drawing.

## Purpose

Create a visible, governed demo account catalog for:

- Aplomo Owner
- Aplomo Admin
- Aplomo Support
- Aplomo Viewer
- Tenant Owner
- Tenant Admin
- Operations Manager
- Site Supervisor
- Capture Operator
- Machine Operator
- Viewer

## Manual Supabase Auth step

This migration does not create passwords and does not store passwords in the repo.

After applying the SQL, create the demo users manually in:

Supabase Dashboard -> Authentication -> Users -> Add user

Use the emails inserted into:

`public.aplomo_demo_role_accounts`

Recommended temporary demo password should be managed outside the repo.

## After creating Auth users

Run:

```sql
select * from public.aplomo_sync_demo_platform_roles();
select * from public.aplomo_demo_role_account_status order by (metadata->>'demoOrder')::int;
Next frontend step

After this database foundation is verified, build:

Landing/home page with Aplomo branding.
Login entrypoint.
Demo role cards.
Current role indicator.
Role-aware admin experience.
Then
Live Device Registration + Browser Geolocation.
Operational Map MVP.
Zone/Perimeter Drawing MVP.