alter table public.aplomo_profiles
add column if not exists platform_role text not null default 'none';

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

create table if not exists public.aplomo_ai_prompt_registry (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.aplomo_profiles(id) on delete restrict,
  prompt_key text not null,
  version integer not null default 1 check (version >= 1),
  status text not null default 'draft' check (
    status in ('draft', 'approved', 'deprecated', 'archived')
  ),
  surface text not null default 'aplomo_super_admin' check (
    surface in (
      'aplomo_super_admin',
      'tenant_admin',
      'tenant_operations',
      'tenant_capture',
      'tenant_data_hub',
      'internal_dev_tools',
      'external_agent'
    )
  ),
  sensitivity text not null default 'internal' check (
    sensitivity in ('public', 'internal', 'confidential', 'restricted')
  ),
  title text not null,
  description text not null default '',
  system_prompt text not null,
  user_prompt_template text not null,
  required_context jsonb not null default '{}'::jsonb,
  allowed_model_families text[] not null default array[]::text[],
  governance_tags text[] not null default array[]::text[],
  approval_notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(prompt_key, version)
);

alter table public.aplomo_ai_prompt_registry enable row level security;

create index if not exists aplomo_ai_prompt_registry_key_idx
on public.aplomo_ai_prompt_registry(prompt_key, version desc);

create index if not exists aplomo_ai_prompt_registry_status_idx
on public.aplomo_ai_prompt_registry(status);

create index if not exists aplomo_ai_prompt_registry_surface_idx
on public.aplomo_ai_prompt_registry(surface);

create index if not exists aplomo_ai_prompt_registry_sensitivity_idx
on public.aplomo_ai_prompt_registry(sensitivity);

drop policy if exists aplomo_ai_prompt_registry_select_platform on public.aplomo_ai_prompt_registry;
create policy aplomo_ai_prompt_registry_select_platform
on public.aplomo_ai_prompt_registry
for select
to authenticated
using (
  public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support',
    'aplomo_viewer'
  ])
);

drop policy if exists aplomo_ai_prompt_registry_insert_platform on public.aplomo_ai_prompt_registry;
create policy aplomo_ai_prompt_registry_insert_platform
on public.aplomo_ai_prompt_registry
for insert
to authenticated
with check (
  owner_profile_id = auth.uid()
  and public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support'
  ])
);

drop policy if exists aplomo_ai_prompt_registry_update_platform on public.aplomo_ai_prompt_registry;
create policy aplomo_ai_prompt_registry_update_platform
on public.aplomo_ai_prompt_registry
for update
to authenticated
using (
  public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin'
  ])
)
with check (
  public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin'
  ])
);

create table if not exists public.aplomo_ai_governance_events (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid not null references public.aplomo_profiles(id) on delete restrict,
  company_id uuid references public.aplomo_companies(id) on delete cascade,
  readiness_packet_id uuid references public.aplomo_ai_readiness_packets(id) on delete set null,
  prompt_registry_id uuid references public.aplomo_ai_prompt_registry(id) on delete set null,
  event_type text not null check (
    event_type in (
      'prompt_created',
      'prompt_approved',
      'prompt_deprecated',
      'packet_created',
      'packet_approved',
      'context_exported',
      'governance_review',
      'risk_flagged',
      'manual_note'
    )
  ),
  risk_level text not null default 'none' check (
    risk_level in ('none', 'watch', 'risk', 'critical')
  ),
  event_summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.aplomo_ai_governance_events enable row level security;

create index if not exists aplomo_ai_governance_events_created_idx
on public.aplomo_ai_governance_events(created_at desc);

create index if not exists aplomo_ai_governance_events_type_idx
on public.aplomo_ai_governance_events(event_type);

create index if not exists aplomo_ai_governance_events_company_idx
on public.aplomo_ai_governance_events(company_id, created_at desc);

drop policy if exists aplomo_ai_governance_events_select_platform on public.aplomo_ai_governance_events;
create policy aplomo_ai_governance_events_select_platform
on public.aplomo_ai_governance_events
for select
to authenticated
using (
  public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support',
    'aplomo_viewer'
  ])
);

drop policy if exists aplomo_ai_governance_events_insert_platform on public.aplomo_ai_governance_events;
create policy aplomo_ai_governance_events_insert_platform
on public.aplomo_ai_governance_events
for insert
to authenticated
with check (
  actor_profile_id = auth.uid()
  and public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support'
  ])
);

notify pgrst, 'reload schema';
