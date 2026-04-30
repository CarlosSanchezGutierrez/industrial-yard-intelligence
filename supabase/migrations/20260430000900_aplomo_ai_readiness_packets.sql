create table if not exists public.aplomo_ai_readiness_packets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.aplomo_companies(id) on delete cascade,
  created_by_profile_id uuid not null references public.aplomo_profiles(id) on delete restrict,
  packet_kind text not null default 'customer_success_context' check (
    packet_kind in (
      'customer_success_context',
      'support_triage_context',
      'operations_summary_context',
      'data_readiness_context',
      'investor_summary_context',
      'internal_agent_context'
    )
  ),
  status text not null default 'draft' check (
    status in ('draft', 'approved', 'archived')
  ),
  sensitivity text not null default 'internal' check (
    sensitivity in ('public', 'internal', 'confidential', 'restricted')
  ),
  title text not null,
  purpose text not null,
  prompt_context text not null,
  data_summary jsonb not null default '{}'::jsonb,
  governance_tags text[] not null default array[]::text[],
  allowed_model_families text[] not null default array[]::text[],
  redaction_notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.aplomo_ai_readiness_packets enable row level security;

create index if not exists aplomo_ai_packets_company_idx
on public.aplomo_ai_readiness_packets(company_id, created_at desc);

create index if not exists aplomo_ai_packets_kind_status_idx
on public.aplomo_ai_readiness_packets(packet_kind, status);

create index if not exists aplomo_ai_packets_sensitivity_idx
on public.aplomo_ai_readiness_packets(sensitivity);

drop policy if exists aplomo_ai_packets_select_platform on public.aplomo_ai_readiness_packets;
create policy aplomo_ai_packets_select_platform
on public.aplomo_ai_readiness_packets
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

drop policy if exists aplomo_ai_packets_insert_platform on public.aplomo_ai_readiness_packets;
create policy aplomo_ai_packets_insert_platform
on public.aplomo_ai_readiness_packets
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

drop policy if exists aplomo_ai_packets_update_platform on public.aplomo_ai_readiness_packets;
create policy aplomo_ai_packets_update_platform
on public.aplomo_ai_readiness_packets
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

notify pgrst, 'reload schema';
