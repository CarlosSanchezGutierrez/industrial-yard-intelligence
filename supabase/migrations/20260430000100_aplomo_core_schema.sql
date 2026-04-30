create extension if not exists pgcrypto;

create or replace function public.aplomo_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.aplomo_companies (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  legal_name text,
  slug text unique not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_company_memberships (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  user_id uuid not null,
  profile_id text,
  role text not null default 'viewer',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, user_id)
);

create table if not exists public.aplomo_sites (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  name text not null,
  kind text not null default 'industrial_yard',
  status text not null default 'active',
  timezone text not null default 'America/Monterrey',
  location jsonb not null default '{}'::jsonb,
  boundaries_geojson jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_devices (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  site_id text references public.aplomo_sites(id) on delete set null,
  name text not null,
  type text not null,
  status text not null default 'active',
  capabilities text[] not null default array[]::text[],
  serial_number text,
  external_identifier text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_device_sessions (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  device_id text not null references public.aplomo_devices(id) on delete cascade,
  profile_id text,
  status text not null default 'active',
  ip_address text,
  user_agent text,
  app_version text,
  platform text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_device_connections (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  device_id text not null references public.aplomo_devices(id) on delete cascade,
  session_id text references public.aplomo_device_sessions(id) on delete set null,
  connection_type text not null,
  role text not null,
  status text not null default 'online',
  protocol text,
  remote_address text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_telemetry_events (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  device_id text not null references public.aplomo_devices(id) on delete cascade,
  session_id text references public.aplomo_device_sessions(id) on delete set null,
  event_type text not null default 'gps_position',
  source text not null,
  position jsonb,
  quality jsonb,
  raw_payload jsonb,
  captured_at timestamptz not null default now(),
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.aplomo_latest_device_positions (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  device_id text not null references public.aplomo_devices(id) on delete cascade,
  source text not null,
  status text not null default 'fresh',
  position jsonb not null,
  quality jsonb,
  telemetry_event_id text references public.aplomo_telemetry_events(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique(company_id, device_id)
);

create table if not exists public.aplomo_governed_events (
  id text primary key,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  device_id text references public.aplomo_devices(id) on delete set null,
  event_name text not null,
  event_version text not null,
  domain text not null,
  producer text not null,
  occurred_at timestamptz not null,
  ingested_at timestamptz,
  data_contract_id text not null,
  sensitivity text not null,
  tier text not null,
  ai_usage_policy text not null,
  quality jsonb not null default '[]'::jsonb,
  lineage jsonb not null default '[]'::jsonb,
  retention_days integer not null default 730,
  tags text[] not null default array[]::text[],
  payload jsonb not null,
  envelope jsonb not null,
  persisted_at timestamptz not null default now()
);

create table if not exists public.aplomo_operational_alerts (
  id text primary key,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  device_id text references public.aplomo_devices(id) on delete set null,
  severity text not null,
  category text not null,
  title text not null,
  message text not null,
  detected_at timestamptz not null,
  source text not null default 'rule_engine',
  recommended_action text not null,
  data_quality_impact text not null,
  ai_readiness_impact text not null,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.aplomo_operational_score_snapshots (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  site_id text references public.aplomo_sites(id) on delete set null,
  generated_at timestamptz not null,
  site_score jsonb not null,
  device_scores jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.aplomo_data_products (
  id text primary key,
  company_id text references public.aplomo_companies(id) on delete cascade,
  name text not null,
  description text not null,
  domains text[] not null default array[]::text[],
  tier text not null,
  status text not null default 'active',
  sensitivity text not null,
  ai_usage_policy text not null,
  supported_formats text[] not null default array[]::text[],
  supported_delivery_modes text[] not null default array[]::text[],
  target_consumers text[] not null default array[]::text[],
  requires_lineage boolean not null default true,
  requires_quality_score boolean not null default true,
  requires_redaction boolean not null default true,
  minimum_quality_score numeric not null default 0.8,
  owner_team text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_export_jobs (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  data_product_id text not null references public.aplomo_data_products(id) on delete restrict,
  requested_by_profile_id text,
  target text not null,
  format text not null,
  delivery_mode text not null,
  status text not null default 'queued',
  include_lineage boolean not null default true,
  include_quality_metrics boolean not null default true,
  include_ai_policy boolean not null default true,
  redact_sensitive_fields boolean not null default true,
  filters jsonb not null default '{}'::jsonb,
  row_count integer,
  file_name text,
  signed_url text,
  expires_at timestamptz,
  completed_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_external_connectors (
  id text primary key default gen_random_uuid()::text,
  company_id text not null references public.aplomo_companies(id) on delete cascade,
  name text not null,
  kind text not null,
  target text not null,
  status text not null default 'active',
  data_product_ids text[] not null default array[]::text[],
  delivery_mode text not null,
  supported_formats text[] not null default array[]::text[],
  credentials_ref text,
  configuration jsonb not null default '{}'::jsonb,
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_llm_tools (
  id text primary key,
  company_id text references public.aplomo_companies(id) on delete cascade,
  name text not null,
  description text not null,
  provider_family text not null,
  status text not null default 'draft',
  allowed_data_product_ids text[] not null default array[]::text[],
  allowed_domains text[] not null default array[]::text[],
  input_schema jsonb not null default '{}'::jsonb,
  output_schema jsonb not null default '{}'::jsonb,
  requires_human_approval boolean not null default true,
  requires_redaction boolean not null default true,
  max_sensitivity_allowed text not null default 'confidential',
  risk_level text not null default 'medium',
  audit_required boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aplomo_memberships_user_idx on public.aplomo_company_memberships(user_id);
create index if not exists aplomo_sites_company_idx on public.aplomo_sites(company_id);
create index if not exists aplomo_devices_company_idx on public.aplomo_devices(company_id);
create index if not exists aplomo_devices_site_idx on public.aplomo_devices(site_id);
create index if not exists aplomo_sessions_company_device_idx on public.aplomo_device_sessions(company_id, device_id);
create index if not exists aplomo_connections_company_device_idx on public.aplomo_device_connections(company_id, device_id);
create index if not exists aplomo_telemetry_company_device_captured_idx on public.aplomo_telemetry_events(company_id, device_id, captured_at desc);
create index if not exists aplomo_latest_positions_company_idx on public.aplomo_latest_device_positions(company_id);
create index if not exists aplomo_governed_events_company_device_time_idx on public.aplomo_governed_events(company_id, device_id, occurred_at desc);
create index if not exists aplomo_alerts_company_device_idx on public.aplomo_operational_alerts(company_id, device_id);
create index if not exists aplomo_scores_company_site_time_idx on public.aplomo_operational_score_snapshots(company_id, site_id, generated_at desc);
create index if not exists aplomo_exports_company_status_idx on public.aplomo_export_jobs(company_id, status);
create index if not exists aplomo_connectors_company_target_idx on public.aplomo_external_connectors(company_id, target);

drop trigger if exists aplomo_companies_touch_updated_at on public.aplomo_companies;
create trigger aplomo_companies_touch_updated_at
before update on public.aplomo_companies
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_company_memberships_touch_updated_at on public.aplomo_company_memberships;
create trigger aplomo_company_memberships_touch_updated_at
before update on public.aplomo_company_memberships
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_sites_touch_updated_at on public.aplomo_sites;
create trigger aplomo_sites_touch_updated_at
before update on public.aplomo_sites
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_devices_touch_updated_at on public.aplomo_devices;
create trigger aplomo_devices_touch_updated_at
before update on public.aplomo_devices
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_sessions_touch_updated_at on public.aplomo_device_sessions;
create trigger aplomo_sessions_touch_updated_at
before update on public.aplomo_device_sessions
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_connections_touch_updated_at on public.aplomo_device_connections;
create trigger aplomo_connections_touch_updated_at
before update on public.aplomo_device_connections
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_data_products_touch_updated_at on public.aplomo_data_products;
create trigger aplomo_data_products_touch_updated_at
before update on public.aplomo_data_products
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_exports_touch_updated_at on public.aplomo_export_jobs;
create trigger aplomo_exports_touch_updated_at
before update on public.aplomo_export_jobs
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_connectors_touch_updated_at on public.aplomo_external_connectors;
create trigger aplomo_connectors_touch_updated_at
before update on public.aplomo_external_connectors
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_llm_tools_touch_updated_at on public.aplomo_llm_tools;
create trigger aplomo_llm_tools_touch_updated_at
before update on public.aplomo_llm_tools
for each row execute function public.aplomo_touch_updated_at();

create or replace function public.aplomo_is_company_member(target_company_id text)
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
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

alter table public.aplomo_companies enable row level security;
alter table public.aplomo_company_memberships enable row level security;
alter table public.aplomo_sites enable row level security;
alter table public.aplomo_devices enable row level security;
alter table public.aplomo_device_sessions enable row level security;
alter table public.aplomo_device_connections enable row level security;
alter table public.aplomo_telemetry_events enable row level security;
alter table public.aplomo_latest_device_positions enable row level security;
alter table public.aplomo_governed_events enable row level security;
alter table public.aplomo_operational_alerts enable row level security;
alter table public.aplomo_operational_score_snapshots enable row level security;
alter table public.aplomo_data_products enable row level security;
alter table public.aplomo_export_jobs enable row level security;
alter table public.aplomo_external_connectors enable row level security;
alter table public.aplomo_llm_tools enable row level security;

drop policy if exists aplomo_companies_select_member on public.aplomo_companies;
create policy aplomo_companies_select_member
on public.aplomo_companies
for select
to authenticated
using (public.aplomo_is_company_member(id));

drop policy if exists aplomo_memberships_select_own on public.aplomo_company_memberships;
create policy aplomo_memberships_select_own
on public.aplomo_company_memberships
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists aplomo_sites_select_member on public.aplomo_sites;
create policy aplomo_sites_select_member
on public.aplomo_sites
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_devices_select_member on public.aplomo_devices;
create policy aplomo_devices_select_member
on public.aplomo_devices
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_sessions_select_member on public.aplomo_device_sessions;
create policy aplomo_sessions_select_member
on public.aplomo_device_sessions
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_connections_select_member on public.aplomo_device_connections;
create policy aplomo_connections_select_member
on public.aplomo_device_connections
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_telemetry_select_member on public.aplomo_telemetry_events;
create policy aplomo_telemetry_select_member
on public.aplomo_telemetry_events
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_latest_positions_select_member on public.aplomo_latest_device_positions;
create policy aplomo_latest_positions_select_member
on public.aplomo_latest_device_positions
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_governed_events_select_member on public.aplomo_governed_events;
create policy aplomo_governed_events_select_member
on public.aplomo_governed_events
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_alerts_select_member on public.aplomo_operational_alerts;
create policy aplomo_alerts_select_member
on public.aplomo_operational_alerts
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_scores_select_member on public.aplomo_operational_score_snapshots;
create policy aplomo_scores_select_member
on public.aplomo_operational_score_snapshots
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_data_products_select_member on public.aplomo_data_products;
create policy aplomo_data_products_select_member
on public.aplomo_data_products
for select
to authenticated
using (company_id is null or public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_exports_select_member on public.aplomo_export_jobs;
create policy aplomo_exports_select_member
on public.aplomo_export_jobs
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_connectors_select_member on public.aplomo_external_connectors;
create policy aplomo_connectors_select_member
on public.aplomo_external_connectors
for select
to authenticated
using (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_llm_tools_select_member on public.aplomo_llm_tools;
create policy aplomo_llm_tools_select_member
on public.aplomo_llm_tools
for select
to authenticated
using (company_id is null or public.aplomo_is_company_member(company_id));
