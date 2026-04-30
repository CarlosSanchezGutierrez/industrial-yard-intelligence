create extension if not exists pgcrypto;

alter table public.aplomo_profiles
add column if not exists platform_role text not null default 'none';

create table if not exists public.aplomo_demo_role_accounts (
  id uuid primary key default gen_random_uuid(),
  account_key text not null unique,
  email text not null unique,
  display_name text not null,
  account_scope text not null default 'tenant' check (
    account_scope in ('platform', 'tenant')
  ),
  platform_role text not null default 'none' check (
    platform_role in ('aplomo_owner', 'aplomo_admin', 'aplomo_support', 'aplomo_viewer', 'none')
  ),
  tenant_role text not null default 'viewer' check (
    tenant_role in (
      'tenant_owner',
      'tenant_admin',
      'operations_manager',
      'site_supervisor',
      'capture_operator',
      'machine_operator',
      'viewer'
    )
  ),
  company_slug text not null default 'aplomo-systems',
  intended_entrypoint text not null default '/aplomo-admin',
  demo_notes text not null default '',
  auth_user_id uuid,
  is_required_for_demo boolean not null default true,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.aplomo_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists aplomo_demo_role_accounts_touch_updated_at on public.aplomo_demo_role_accounts;

create trigger aplomo_demo_role_accounts_touch_updated_at
before update on public.aplomo_demo_role_accounts
for each row execute function public.aplomo_touch_updated_at();

insert into public.aplomo_demo_role_accounts (
  account_key,
  email,
  display_name,
  account_scope,
  platform_role,
  tenant_role,
  company_slug,
  intended_entrypoint,
  demo_notes,
  metadata
)
values
  (
    'platform_aplomo_owner',
    'demo+aplomo-owner@aplomodemo.test',
    'Demo Aplomo Owner',
    'platform',
    'aplomo_owner',
    'tenant_owner',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo para mostrar control total de plataforma Aplomo.',
    '{"demoOrder": 1, "canSeeAllCompanies": true, "canManagePlatform": true}'::jsonb
  ),
  (
    'platform_aplomo_admin',
    'demo+aplomo-admin@aplomodemo.test',
    'Demo Aplomo Admin',
    'platform',
    'aplomo_admin',
    'tenant_admin',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo para administración interna de plataforma.',
    '{"demoOrder": 2, "canManagePlatform": true}'::jsonb
  ),
  (
    'platform_aplomo_support',
    'demo+aplomo-support@aplomodemo.test',
    'Demo Aplomo Support',
    'platform',
    'aplomo_support',
    'viewer',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo para soporte/customer success.',
    '{"demoOrder": 3, "canManageSupport": true}'::jsonb
  ),
  (
    'platform_aplomo_viewer',
    'demo+aplomo-viewer@aplomodemo.test',
    'Demo Aplomo Viewer',
    'platform',
    'aplomo_viewer',
    'viewer',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo de solo lectura para plataforma.',
    '{"demoOrder": 4, "readOnly": true}'::jsonb
  ),
  (
    'tenant_owner',
    'demo+tenant-owner@aplomodemo.test',
    'Demo Tenant Owner',
    'tenant',
    'none',
    'tenant_owner',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo del dueño de empresa cliente.',
    '{"demoOrder": 5, "tenantAdmin": true}'::jsonb
  ),
  (
    'tenant_admin',
    'demo+tenant-admin@aplomodemo.test',
    'Demo Tenant Admin',
    'tenant',
    'none',
    'tenant_admin',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo de administrador de empresa cliente.',
    '{"demoOrder": 6, "tenantAdmin": true}'::jsonb
  ),
  (
    'operations_manager',
    'demo+operations-manager@aplomodemo.test',
    'Demo Operations Manager',
    'tenant',
    'none',
    'operations_manager',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo para gerente de operaciones.',
    '{"demoOrder": 7, "operations": true}'::jsonb
  ),
  (
    'site_supervisor',
    'demo+site-supervisor@aplomodemo.test',
    'Demo Site Supervisor',
    'tenant',
    'none',
    'site_supervisor',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo para supervisor de patio/site.',
    '{"demoOrder": 8, "siteOperations": true}'::jsonb
  ),
  (
    'capture_operator',
    'demo+capture-operator@aplomodemo.test',
    'Demo Capture Operator',
    'tenant',
    'none',
    'capture_operator',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo para capturista con GPS/celular.',
    '{"demoOrder": 9, "gpsCapture": true}'::jsonb
  ),
  (
    'machine_operator',
    'demo+machine-operator@aplomodemo.test',
    'Demo Machine Operator',
    'tenant',
    'none',
    'machine_operator',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo para operador de maquinaria.',
    '{"demoOrder": 10, "machineOps": true}'::jsonb
  ),
  (
    'viewer',
    'demo+viewer@aplomodemo.test',
    'Demo Viewer',
    'tenant',
    'none',
    'viewer',
    'aplomo-systems',
    '/aplomo-admin',
    'Cuenta demo de solo lectura tenant.',
    '{"demoOrder": 11, "readOnly": true}'::jsonb
  )
on conflict (account_key) do update set
  email = excluded.email,
  display_name = excluded.display_name,
  account_scope = excluded.account_scope,
  platform_role = excluded.platform_role,
  tenant_role = excluded.tenant_role,
  company_slug = excluded.company_slug,
  intended_entrypoint = excluded.intended_entrypoint,
  demo_notes = excluded.demo_notes,
  metadata = excluded.metadata,
  is_required_for_demo = excluded.is_required_for_demo,
  is_active = excluded.is_active,
  updated_at = now();

update public.aplomo_demo_role_accounts dra
set
  auth_user_id = au.id,
  updated_at = now()
from auth.users au
where lower(au.email) = lower(dra.email);

create or replace view public.aplomo_demo_role_account_status as
select
  dra.account_key,
  dra.email,
  dra.display_name,
  dra.account_scope,
  dra.platform_role,
  dra.tenant_role,
  dra.company_slug,
  dra.intended_entrypoint,
  dra.auth_user_id,
  case when au.id is null then false else true end as auth_user_exists,
  case when p.id is null then false else true end as profile_exists,
  p.platform_role as actual_platform_role,
  dra.is_active,
  dra.demo_notes,
  dra.metadata,
  dra.created_at,
  dra.updated_at
from public.aplomo_demo_role_accounts dra
left join auth.users au
  on lower(au.email) = lower(dra.email)
left join public.aplomo_profiles p
  on p.id = au.id;

create or replace function public.aplomo_sync_demo_platform_roles()
returns table (
  account_key text,
  email text,
  auth_user_exists boolean,
  profile_exists boolean,
  intended_platform_role text,
  actual_platform_role text,
  sync_status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  account record;
begin
  for account in
    select
      dra.account_key,
      dra.email,
      dra.platform_role,
      au.id as auth_user_id,
      p.id as profile_id
    from public.aplomo_demo_role_accounts dra
    left join auth.users au
      on lower(au.email) = lower(dra.email)
    left join public.aplomo_profiles p
      on p.id = au.id
    where dra.is_active = true
  loop
    if account.auth_user_id is null then
      account_key := account.account_key;
      email := account.email;
      auth_user_exists := false;
      profile_exists := false;
      intended_platform_role := account.platform_role;
      actual_platform_role := null;
      sync_status := 'missing_auth_user_create_it_in_supabase_auth_first';
      return next;
    elsif account.profile_id is null then
      account_key := account.account_key;
      email := account.email;
      auth_user_exists := true;
      profile_exists := false;
      intended_platform_role := account.platform_role;
      actual_platform_role := null;
      sync_status := 'missing_profile_profile_trigger_or_profile_seed_needed';
      return next;
    else
      update public.aplomo_profiles
      set platform_role = account.platform_role
      where id = account.auth_user_id;

      account_key := account.account_key;
      email := account.email;
      auth_user_exists := true;
      profile_exists := true;
      intended_platform_role := account.platform_role;
      actual_platform_role := account.platform_role;
      sync_status := 'synced';
      return next;
    end if;
  end loop;
end;
$$;

alter table public.aplomo_demo_role_accounts enable row level security;

drop policy if exists aplomo_demo_role_accounts_select_platform on public.aplomo_demo_role_accounts;
create policy aplomo_demo_role_accounts_select_platform
on public.aplomo_demo_role_accounts
for select
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support','aplomo_viewer']));

drop policy if exists aplomo_demo_role_accounts_insert_platform on public.aplomo_demo_role_accounts;
create policy aplomo_demo_role_accounts_insert_platform
on public.aplomo_demo_role_accounts
for insert
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin']));

drop policy if exists aplomo_demo_role_accounts_update_platform on public.aplomo_demo_role_accounts;
create policy aplomo_demo_role_accounts_update_platform
on public.aplomo_demo_role_accounts
for update
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin']))
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin']));

grant select, insert, update on public.aplomo_demo_role_accounts to authenticated;
grant select on public.aplomo_demo_role_account_status to authenticated;
grant execute on function public.aplomo_sync_demo_platform_roles() to authenticated;

select
  account_key,
  email,
  display_name,
  account_scope,
  platform_role,
  tenant_role
from public.aplomo_demo_role_accounts
order by (metadata->>'demoOrder')::int;