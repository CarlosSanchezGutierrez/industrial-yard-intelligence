create table if not exists public.aplomo_platform_support_workflows (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aplomo_companies(id) on delete cascade,
  created_by_profile_id uuid not null references public.aplomo_profiles(id) on delete restrict,
  updated_by_profile_id uuid references public.aplomo_profiles(id) on delete set null,
  assigned_to_profile_id uuid references public.aplomo_profiles(id) on delete set null,
  status text not null default 'open' check (
    status in ('open', 'in_progress', 'waiting_customer', 'blocked', 'resolved', 'archived')
  ),
  priority text not null default 'medium' check (
    priority in ('low', 'medium', 'high', 'urgent')
  ),
  risk_level text not null default 'watch' check (
    risk_level in ('none', 'watch', 'risk', 'critical')
  ),
  title text not null,
  notes text not null default '',
  next_touch_at timestamptz,
  last_touch_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.aplomo_platform_support_workflows enable row level security;

create index if not exists aplomo_support_workflows_company_idx
on public.aplomo_platform_support_workflows(company_id);

create index if not exists aplomo_support_workflows_status_priority_idx
on public.aplomo_platform_support_workflows(status, priority);

create index if not exists aplomo_support_workflows_next_touch_idx
on public.aplomo_platform_support_workflows(next_touch_at);

drop policy if exists aplomo_support_workflows_select_platform on public.aplomo_platform_support_workflows;
create policy aplomo_support_workflows_select_platform
on public.aplomo_platform_support_workflows
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

drop policy if exists aplomo_support_workflows_insert_platform on public.aplomo_platform_support_workflows;
create policy aplomo_support_workflows_insert_platform
on public.aplomo_platform_support_workflows
for insert
to authenticated
with check (
  created_by_profile_id = auth.uid()
  and public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support'
  ])
);

drop policy if exists aplomo_support_workflows_update_platform on public.aplomo_platform_support_workflows;
create policy aplomo_support_workflows_update_platform
on public.aplomo_platform_support_workflows
for update
to authenticated
using (
  public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support'
  ])
)
with check (
  public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support'
  ])
);

notify pgrst, 'reload schema';
