alter table public.aplomo_profiles
add column if not exists platform_role text not null default 'none';

alter table public.aplomo_company_memberships
add column if not exists permissions_override text[] not null default array[]::text[];

alter table public.aplomo_company_memberships
add column if not exists scope jsonb not null default '{}'::jsonb;

create index if not exists aplomo_profiles_platform_role_idx
on public.aplomo_profiles(platform_role);

create index if not exists aplomo_memberships_company_role_idx
on public.aplomo_company_memberships(company_id, role);

create or replace function public.aplomo_has_platform_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.aplomo_profiles p
    where p.id = auth.uid()
      and p.platform_role = any(allowed_roles)
  );
$$;

create or replace function public.aplomo_has_company_role(
  target_company_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.aplomo_company_memberships m
    where m.company_id = target_company_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
      and m.role = any(allowed_roles)
  );
$$;

create or replace function public.aplomo_can_manage_company_users(
  target_company_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.aplomo_has_platform_role(array['aplomo_owner', 'aplomo_admin'])
    or public.aplomo_has_company_role(
      target_company_id,
      array['tenant_owner', 'tenant_admin']
    );
$$;

create or replace function public.aplomo_can_write_operations(
  target_company_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.aplomo_has_platform_role(array['aplomo_owner', 'aplomo_admin'])
    or public.aplomo_has_company_role(
      target_company_id,
      array[
        'tenant_owner',
        'tenant_admin',
        'operations_manager',
        'site_supervisor'
      ]
    );
$$;

create or replace function public.aplomo_can_create_gps_capture(
  target_company_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.aplomo_has_platform_role(array['aplomo_owner', 'aplomo_admin'])
    or public.aplomo_has_company_role(
      target_company_id,
      array[
        'tenant_owner',
        'tenant_admin',
        'operations_manager',
        'site_supervisor',
        'capture_operator',
        'machine_operator'
      ]
    );
$$;

drop policy if exists aplomo_memberships_insert_company_admin on public.aplomo_company_memberships;
create policy aplomo_memberships_insert_company_admin
on public.aplomo_company_memberships
for insert
to authenticated
with check (public.aplomo_can_manage_company_users(company_id));

drop policy if exists aplomo_memberships_update_company_admin on public.aplomo_company_memberships;
create policy aplomo_memberships_update_company_admin
on public.aplomo_company_memberships
for update
to authenticated
using (public.aplomo_can_manage_company_users(company_id))
with check (public.aplomo_can_manage_company_users(company_id));

notify pgrst, 'reload schema';
