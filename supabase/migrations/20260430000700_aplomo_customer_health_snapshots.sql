create table if not exists public.aplomo_customer_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aplomo_companies(id) on delete cascade,
  computed_by_profile_id uuid not null references public.aplomo_profiles(id) on delete restrict,
  score_total integer not null check (score_total >= 0 and score_total <= 100),
  band text not null check (band in ('excellent', 'healthy', 'watch', 'risk')),
  adoption_score integer not null check (adoption_score >= 0 and adoption_score <= 100),
  operations_score integer not null check (operations_score >= 0 and operations_score <= 100),
  gps_quality_score integer not null check (gps_quality_score >= 0 and gps_quality_score <= 100),
  data_readiness_score integer not null check (data_readiness_score >= 0 and data_readiness_score <= 100),
  activity_score integer not null check (activity_score >= 0 and activity_score <= 100),
  risk_factors jsonb not null default '[]'::jsonb,
  recommended_actions jsonb not null default '[]'::jsonb,
  raw_snapshot jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.aplomo_customer_health_snapshots enable row level security;

create index if not exists aplomo_health_snapshots_company_computed_idx
on public.aplomo_customer_health_snapshots(company_id, computed_at desc);

create index if not exists aplomo_health_snapshots_band_idx
on public.aplomo_customer_health_snapshots(band);

create index if not exists aplomo_health_snapshots_score_idx
on public.aplomo_customer_health_snapshots(score_total);

drop policy if exists aplomo_health_snapshots_select_platform on public.aplomo_customer_health_snapshots;
create policy aplomo_health_snapshots_select_platform
on public.aplomo_customer_health_snapshots
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

drop policy if exists aplomo_health_snapshots_insert_platform on public.aplomo_customer_health_snapshots;
create policy aplomo_health_snapshots_insert_platform
on public.aplomo_customer_health_snapshots
for insert
to authenticated
with check (
  computed_by_profile_id = auth.uid()
  and public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin'
  ])
);

notify pgrst, 'reload schema';
