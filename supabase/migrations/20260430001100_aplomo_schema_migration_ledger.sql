begin;

create extension if not exists pgcrypto;

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

create table if not exists public.aplomo_schema_migration_ledger (
  id uuid primary key default gen_random_uuid(),
  migration_key text not null unique,
  name text not null,
  status text not null default 'expected' check (
    status in ('expected', 'applied', 'failed', 'deprecated', 'superseded')
  ),
  source text not null default 'manual_sql' check (
    source in ('manual_sql', 'supabase_sql_editor', 'local_file', 'ci_cd', 'system_seed', 'unknown')
  ),
  checksum text,
  description text not null default '',
  applied_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.aplomo_schema_migration_ledger enable row level security;

create index if not exists aplomo_schema_migration_ledger_status_idx
on public.aplomo_schema_migration_ledger(status);

create index if not exists aplomo_schema_migration_ledger_source_idx
on public.aplomo_schema_migration_ledger(source);

create index if not exists aplomo_schema_migration_ledger_applied_idx
on public.aplomo_schema_migration_ledger(applied_at desc);

create table if not exists public.aplomo_schema_audit_findings (
  id uuid primary key default gen_random_uuid(),
  capability_id text not null,
  finding_kind text not null check (
    finding_kind in (
      'missing_table',
      'missing_column',
      'missing_policy',
      'missing_index',
      'legacy_column',
      'not_null_without_default',
      'rls_disabled',
      'contract_gap',
      'repository_gap',
      'ui_gap',
      'data_quality_gap',
      'cloud_readiness_gap',
      'manual_note'
    )
  ),
  severity text not null default 'medium' check (
    severity in ('info', 'low', 'medium', 'high', 'critical')
  ),
  object_type text not null default 'unknown' check (
    object_type in ('table', 'column', 'policy', 'index', 'function', 'contract', 'repository', 'ui', 'service', 'data_quality', 'cloud', 'unknown')
  ),
  object_name text not null,
  expected_state jsonb not null default '{}'::jsonb,
  actual_state jsonb not null default '{}'::jsonb,
  recommendation text not null default '',
  status text not null default 'open' check (
    status in ('open', 'in_progress', 'resolved', 'accepted_risk', 'ignored')
  ),
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.aplomo_schema_audit_findings enable row level security;

create index if not exists aplomo_schema_audit_findings_capability_idx
on public.aplomo_schema_audit_findings(capability_id);

create index if not exists aplomo_schema_audit_findings_status_idx
on public.aplomo_schema_audit_findings(status);

create index if not exists aplomo_schema_audit_findings_severity_idx
on public.aplomo_schema_audit_findings(severity);

create index if not exists aplomo_schema_audit_findings_kind_idx
on public.aplomo_schema_audit_findings(finding_kind);

create table if not exists public.aplomo_schema_capability_status (
  id uuid primary key default gen_random_uuid(),
  capability_id text not null unique,
  capability_name text not null,
  criticality text not null default 'medium' check (
    criticality in ('core', 'high', 'medium', 'low')
  ),
  domain_status text not null default 'missing',
  contracts_status text not null default 'missing',
  database_status text not null default 'missing',
  rls_status text not null default 'missing',
  repository_status text not null default 'missing',
  service_status text not null default 'missing',
  audit_status text not null default 'missing',
  export_status text not null default 'missing',
  analytics_status text not null default 'missing',
  data_quality_status text not null default 'missing',
  ui_status text not null default 'missing',
  ai_governance_status text not null default 'missing',
  cloud_readiness_status text not null default 'missing',
  readiness_score integer not null default 0 check (
    readiness_score >= 0 and readiness_score <= 100
  ),
  blockers jsonb not null default '[]'::jsonb,
  next_actions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.aplomo_schema_capability_status enable row level security;

create index if not exists aplomo_schema_capability_status_criticality_idx
on public.aplomo_schema_capability_status(criticality);

create index if not exists aplomo_schema_capability_status_score_idx
on public.aplomo_schema_capability_status(readiness_score desc);

drop policy if exists aplomo_schema_migration_ledger_select_platform on public.aplomo_schema_migration_ledger;
create policy aplomo_schema_migration_ledger_select_platform
on public.aplomo_schema_migration_ledger
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

drop policy if exists aplomo_schema_migration_ledger_insert_platform on public.aplomo_schema_migration_ledger;
create policy aplomo_schema_migration_ledger_insert_platform
on public.aplomo_schema_migration_ledger
for insert
to authenticated
with check (
  public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support'
  ])
);

drop policy if exists aplomo_schema_migration_ledger_update_platform on public.aplomo_schema_migration_ledger;
create policy aplomo_schema_migration_ledger_update_platform
on public.aplomo_schema_migration_ledger
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

drop policy if exists aplomo_schema_audit_findings_select_platform on public.aplomo_schema_audit_findings;
create policy aplomo_schema_audit_findings_select_platform
on public.aplomo_schema_audit_findings
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

drop policy if exists aplomo_schema_audit_findings_insert_platform on public.aplomo_schema_audit_findings;
create policy aplomo_schema_audit_findings_insert_platform
on public.aplomo_schema_audit_findings
for insert
to authenticated
with check (
  public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support'
  ])
);

drop policy if exists aplomo_schema_audit_findings_update_platform on public.aplomo_schema_audit_findings;
create policy aplomo_schema_audit_findings_update_platform
on public.aplomo_schema_audit_findings
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

drop policy if exists aplomo_schema_capability_status_select_platform on public.aplomo_schema_capability_status;
create policy aplomo_schema_capability_status_select_platform
on public.aplomo_schema_capability_status
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

drop policy if exists aplomo_schema_capability_status_insert_platform on public.aplomo_schema_capability_status;
create policy aplomo_schema_capability_status_insert_platform
on public.aplomo_schema_capability_status
for insert
to authenticated
with check (
  public.aplomo_has_platform_role(array[
    'aplomo_owner',
    'aplomo_admin',
    'aplomo_support'
  ])
);

drop policy if exists aplomo_schema_capability_status_update_platform on public.aplomo_schema_capability_status;
create policy aplomo_schema_capability_status_update_platform
on public.aplomo_schema_capability_status
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

insert into public.aplomo_schema_migration_ledger (
  migration_key,
  name,
  status,
  source,
  description,
  applied_at,
  metadata
)
values
  (
    '20260430000000_manual_consolidated_base',
    'Manual consolidated Supabase base',
    'applied',
    'supabase_sql_editor',
    'Consolidated manual base migration for Aplomo SaaS MVP tables, policies and compatibility repairs.',
    now(),
    '{"seeded": true, "program": "backend_completion"}'::jsonb
  ),
  (
    '20260430001100_schema_migration_ledger',
    'Schema Migration Ledger + Schema Audit Findings',
    'applied',
    'supabase_sql_editor',
    'Creates migration ledger, schema audit findings and capability status tracking.',
    now(),
    '{"seeded": true, "program": "backend_completion"}'::jsonb
  )
on conflict (migration_key)
do update set
  name = excluded.name,
  status = excluded.status,
  source = excluded.source,
  description = excluded.description,
  applied_at = coalesce(public.aplomo_schema_migration_ledger.applied_at, excluded.applied_at),
  metadata = excluded.metadata,
  updated_at = now();

notify pgrst, 'reload schema';

commit;
