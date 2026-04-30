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

create or replace function public.aplomo_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.aplomo_data_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  asset_name text not null,
  asset_type text not null default 'source_table'
    check (asset_type in ('source_table','derived_table','view','report','dashboard','export','api','pipeline','ai_context','manual')),
  source_system text not null default 'supabase',
  table_name text not null default '',
  domain_area text not null default 'platform',
  owner_role text not null default 'aplomo_admin',
  sensitivity text not null default 'internal'
    check (sensitivity in ('public','internal','confidential','restricted')),
  quality_tier text not null default 'bronze'
    check (quality_tier in ('bronze','silver','gold','platinum')),
  is_ai_ready boolean not null default false,
  is_bi_ready boolean not null default false,
  is_active boolean not null default true,
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_data_quality_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  asset_key text not null references public.aplomo_data_assets(asset_key) on update cascade on delete restrict,
  rule_name text not null,
  rule_type text not null default 'custom'
    check (rule_type in ('not_null','unique','valid_enum','range','non_negative','freshness','referential_integrity','custom')),
  dimension text not null default 'validity'
    check (dimension in ('completeness','validity','uniqueness','consistency','timeliness','accuracy','governance')),
  severity text not null default 'medium'
    check (severity in ('info','low','medium','high','critical')),
  expectation text not null default '',
  sql_check text not null default '',
  threshold numeric(7,4) not null default 1,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_data_quality_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  rule_key text not null references public.aplomo_data_quality_rules(rule_key) on update cascade on delete restrict,
  asset_key text not null references public.aplomo_data_assets(asset_key) on update cascade on delete restrict,
  status text not null default 'queued'
    check (status in ('queued','running','passed','warning','failed','error','skipped')),
  score numeric(6,2) not null default 0 check (score >= 0 and score <= 100),
  checked_count integer not null default 0 check (checked_count >= 0),
  passed_count integer not null default 0 check (passed_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  executed_by uuid,
  message text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aplomo_data_lineage_edges (
  id uuid primary key default gen_random_uuid(),
  edge_key text not null unique,
  source_asset_key text not null references public.aplomo_data_assets(asset_key) on update cascade on delete restrict,
  target_asset_key text not null references public.aplomo_data_assets(asset_key) on update cascade on delete restrict,
  lineage_type text not null default 'derived_from'
    check (lineage_type in ('derived_from','feeds','exports_to','governs','observes','enriches','audits')),
  transformation_kind text not null default 'logical'
    check (transformation_kind in ('logical','sql','repository','ui','export','analytics','ai_context','manual')),
  confidence numeric(5,2) not null default 100 check (confidence >= 0 and confidence <= 100),
  is_active boolean not null default true,
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aplomo_data_assets_asset_type_idx on public.aplomo_data_assets(asset_type);
create index if not exists aplomo_data_assets_domain_area_idx on public.aplomo_data_assets(domain_area);
create index if not exists aplomo_data_assets_ai_bi_idx on public.aplomo_data_assets(is_ai_ready, is_bi_ready);

create index if not exists aplomo_data_quality_rules_asset_key_idx on public.aplomo_data_quality_rules(asset_key);
create index if not exists aplomo_data_quality_rules_active_idx on public.aplomo_data_quality_rules(is_active);

create index if not exists aplomo_data_quality_runs_asset_key_idx on public.aplomo_data_quality_runs(asset_key);
create index if not exists aplomo_data_quality_runs_status_idx on public.aplomo_data_quality_runs(status);
create index if not exists aplomo_data_quality_runs_started_at_idx on public.aplomo_data_quality_runs(started_at desc);

create index if not exists aplomo_data_lineage_edges_source_idx on public.aplomo_data_lineage_edges(source_asset_key);
create index if not exists aplomo_data_lineage_edges_target_idx on public.aplomo_data_lineage_edges(target_asset_key);

drop trigger if exists aplomo_data_assets_touch_updated_at on public.aplomo_data_assets;
create trigger aplomo_data_assets_touch_updated_at
before update on public.aplomo_data_assets
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_data_quality_rules_touch_updated_at on public.aplomo_data_quality_rules;
create trigger aplomo_data_quality_rules_touch_updated_at
before update on public.aplomo_data_quality_rules
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_data_quality_runs_touch_updated_at on public.aplomo_data_quality_runs;
create trigger aplomo_data_quality_runs_touch_updated_at
before update on public.aplomo_data_quality_runs
for each row execute function public.aplomo_touch_updated_at();

drop trigger if exists aplomo_data_lineage_edges_touch_updated_at on public.aplomo_data_lineage_edges;
create trigger aplomo_data_lineage_edges_touch_updated_at
before update on public.aplomo_data_lineage_edges
for each row execute function public.aplomo_touch_updated_at();

alter table public.aplomo_data_assets enable row level security;
alter table public.aplomo_data_quality_rules enable row level security;
alter table public.aplomo_data_quality_runs enable row level security;
alter table public.aplomo_data_lineage_edges enable row level security;

drop policy if exists aplomo_data_assets_select_platform on public.aplomo_data_assets;
create policy aplomo_data_assets_select_platform
on public.aplomo_data_assets
for select
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support','aplomo_viewer']));

drop policy if exists aplomo_data_assets_insert_platform on public.aplomo_data_assets;
create policy aplomo_data_assets_insert_platform
on public.aplomo_data_assets
for insert
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support']));

drop policy if exists aplomo_data_assets_update_platform on public.aplomo_data_assets;
create policy aplomo_data_assets_update_platform
on public.aplomo_data_assets
for update
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support']))
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support']));

drop policy if exists aplomo_data_quality_rules_select_platform on public.aplomo_data_quality_rules;
create policy aplomo_data_quality_rules_select_platform
on public.aplomo_data_quality_rules
for select
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support','aplomo_viewer']));

drop policy if exists aplomo_data_quality_rules_insert_platform on public.aplomo_data_quality_rules;
create policy aplomo_data_quality_rules_insert_platform
on public.aplomo_data_quality_rules
for insert
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support']));

drop policy if exists aplomo_data_quality_rules_update_platform on public.aplomo_data_quality_rules;
create policy aplomo_data_quality_rules_update_platform
on public.aplomo_data_quality_rules
for update
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin']))
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin']));

drop policy if exists aplomo_data_quality_runs_select_platform on public.aplomo_data_quality_runs;
create policy aplomo_data_quality_runs_select_platform
on public.aplomo_data_quality_runs
for select
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support','aplomo_viewer']));

drop policy if exists aplomo_data_quality_runs_insert_platform on public.aplomo_data_quality_runs;
create policy aplomo_data_quality_runs_insert_platform
on public.aplomo_data_quality_runs
for insert
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support']));

drop policy if exists aplomo_data_quality_runs_update_platform on public.aplomo_data_quality_runs;
create policy aplomo_data_quality_runs_update_platform
on public.aplomo_data_quality_runs
for update
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support']))
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support']));

drop policy if exists aplomo_data_lineage_edges_select_platform on public.aplomo_data_lineage_edges;
create policy aplomo_data_lineage_edges_select_platform
on public.aplomo_data_lineage_edges
for select
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support','aplomo_viewer']));

drop policy if exists aplomo_data_lineage_edges_insert_platform on public.aplomo_data_lineage_edges;
create policy aplomo_data_lineage_edges_insert_platform
on public.aplomo_data_lineage_edges
for insert
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin','aplomo_support']));

drop policy if exists aplomo_data_lineage_edges_update_platform on public.aplomo_data_lineage_edges;
create policy aplomo_data_lineage_edges_update_platform
on public.aplomo_data_lineage_edges
for update
using (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin']))
with check (public.aplomo_has_platform_role(array['aplomo_owner','aplomo_admin']));

grant select, insert, update on public.aplomo_data_assets to authenticated;
grant select, insert, update on public.aplomo_data_quality_rules to authenticated;
grant select, insert, update on public.aplomo_data_quality_runs to authenticated;
grant select, insert, update on public.aplomo_data_lineage_edges to authenticated;

insert into public.aplomo_data_assets (
  asset_key,
  asset_name,
  asset_type,
  source_system,
  table_name,
  domain_area,
  owner_role,
  sensitivity,
  quality_tier,
  is_ai_ready,
  is_bi_ready,
  description
)
values
  ('core.companies','Companies','source_table','supabase','aplomo_companies','core_saas','aplomo_admin','internal','gold',true,true,'Tenant company master data.'),
  ('core.profiles','Profiles','source_table','supabase','aplomo_profiles','identity','aplomo_admin','confidential','gold',false,true,'Platform user profile records.'),
  ('core.memberships','Company Memberships','source_table','supabase','aplomo_company_memberships','identity','aplomo_admin','confidential','gold',false,true,'Tenant RBAC memberships.'),
  ('ops.sites','Sites','source_table','supabase','aplomo_sites','operations','operations_manager','internal','gold',true,true,'Industrial sites, yards and patios.'),
  ('ops.devices','Devices','source_table','supabase','aplomo_devices','operations','operations_manager','internal','gold',true,true,'GPS, phone, gateway and drone fleet records.'),
  ('ops.device_sessions','Device Sessions','source_table','supabase','aplomo_device_sessions','telemetry','operations_manager','internal','silver',true,true,'Device operating sessions.'),
  ('ops.device_connections','Device Connections','source_table','supabase','aplomo_device_connections','telemetry','operations_manager','internal','silver',true,true,'Device connectivity and protocol records.'),
  ('catalog.material_types','Material Types','source_table','supabase','aplomo_material_types','material_catalog','operations_manager','internal','silver',true,true,'Material catalog and density metadata.'),
  ('ops.stockpiles','Stockpiles','source_table','supabase','aplomo_stockpiles','operations','operations_manager','internal','gold',true,true,'Stockpile operational inventory records.'),
  ('ops.gps_captures','GPS Captures','source_table','supabase','aplomo_gps_captures','telemetry','site_supervisor','internal','silver',true,true,'Point-in-time GPS captures from operators and devices.'),
  ('ops.latest_device_positions','Latest Device Positions','derived_table','supabase','aplomo_latest_device_positions','telemetry','site_supervisor','internal','silver',true,true,'Latest known device position surface.'),
  ('ops.operational_alerts','Operational Alerts','source_table','supabase','aplomo_operational_alerts','operations','operations_manager','internal','silver',true,true,'Operational alert and risk events.'),
  ('data.data_exports','Data Exports','export','supabase','aplomo_data_exports','data_platform','aplomo_admin','internal','silver',false,true,'Export history and export readiness records.'),
  ('governance.audit_logs','Audit Logs','source_table','supabase','aplomo_audit_logs','governance','aplomo_admin','restricted','gold',false,true,'Audit trail for critical platform events.'),
  ('cs.customer_health_snapshots','Customer Health Snapshots','derived_table','supabase','aplomo_customer_health_snapshots','customer_success','aplomo_support','internal','silver',true,true,'Customer health score history.'),
  ('cs.support_workflows','Support Workflows','source_table','supabase','aplomo_platform_support_workflows','customer_success','aplomo_support','internal','silver',true,true,'Support and customer success workflow records.'),
  ('analytics.support_health_crosswalk','Support Health Crosswalk','report','supabase','virtual_support_health_crosswalk','customer_success','aplomo_support','internal','silver',true,true,'Derived crosswalk between customer health and support workflows.'),
  ('ai.ai_readiness_packets','AI Readiness Packets','ai_context','supabase','aplomo_ai_readiness_packets','ai_governance','aplomo_admin','restricted','gold',true,false,'Governed packets for future AI use.'),
  ('ai.ai_prompt_registry','AI Prompt Registry','source_table','supabase','aplomo_ai_prompt_registry','ai_governance','aplomo_admin','restricted','gold',true,false,'Versioned prompt registry.'),
  ('ai.ai_governance_events','AI Governance Events','source_table','supabase','aplomo_ai_governance_events','ai_governance','aplomo_admin','restricted','gold',true,true,'AI governance event log.'),
  ('schema.schema_migration_ledger','Schema Migration Ledger','source_table','supabase','aplomo_schema_migration_ledger','schema_governance','aplomo_admin','internal','gold',true,true,'Manual and future CI/CD schema migration ledger.'),
  ('schema.schema_audit_findings','Schema Audit Findings','source_table','supabase','aplomo_schema_audit_findings','schema_governance','aplomo_admin','internal','gold',true,true,'Schema audit findings and remediation work.'),
  ('schema.schema_capability_status','Schema Capability Status','derived_table','supabase','aplomo_schema_capability_status','schema_governance','aplomo_admin','internal','gold',true,true,'Capability completion status across backend surfaces.')
on conflict (asset_key) do update set
  asset_name = excluded.asset_name,
  asset_type = excluded.asset_type,
  source_system = excluded.source_system,
  table_name = excluded.table_name,
  domain_area = excluded.domain_area,
  owner_role = excluded.owner_role,
  sensitivity = excluded.sensitivity,
  quality_tier = excluded.quality_tier,
  is_ai_ready = excluded.is_ai_ready,
  is_bi_ready = excluded.is_bi_ready,
  description = excluded.description,
  updated_at = now();

insert into public.aplomo_data_quality_rules (
  rule_key,
  asset_key,
  rule_name,
  rule_type,
  dimension,
  severity,
  expectation,
  sql_check,
  threshold,
  is_active
)
values
  ('company_slug_required','core.companies','Company slug required','not_null','completeness','critical','Every tenant company must have a stable slug.','slug is not null and length(trim(slug)) > 0',1,true),
  ('company_name_required','core.companies','Company name required','not_null','completeness','critical','Every tenant company must have a display name.','name is not null and length(trim(name)) > 0',1,true),
  ('profile_platform_role_valid','core.profiles','Profile platform role valid','valid_enum','validity','high','Platform role must be approved.','platform_role in (''aplomo_owner'',''aplomo_admin'',''aplomo_support'',''aplomo_viewer'',''none'')',1,true),
  ('membership_role_valid','core.memberships','Membership role valid','valid_enum','validity','high','Tenant membership role must be approved.','role in (''tenant_owner'',''tenant_admin'',''operations_manager'',''site_supervisor'',''capture_operator'',''machine_operator'',''viewer'')',1,true),
  ('device_name_required','ops.devices','Device name required','not_null','completeness','medium','Every device must have a readable name.','name is not null and length(trim(name)) > 0',1,true),
  ('device_type_valid','ops.devices','Device type valid','valid_enum','validity','high','Device type must be approved.','type in (''phone'',''iot_gateway'',''drone'',''rtk_base'',''sensor'',''vehicle'',''unknown'')',1,true),
  ('latitude_range','ops.gps_captures','Latitude range','range','validity','critical','Latitude must be between -90 and 90.','latitude between -90 and 90',1,true),
  ('longitude_range','ops.gps_captures','Longitude range','range','validity','critical','Longitude must be between -180 and 180.','longitude between -180 and 180',1,true),
  ('stockpile_volume_non_negative','ops.stockpiles','Stockpile volume non-negative','non_negative','validity','high','Stockpile volume cannot be negative.','coalesce(volume_m3, 0) >= 0',1,true),
  ('stockpile_weight_non_negative','ops.stockpiles','Stockpile weight non-negative','non_negative','validity','high','Stockpile estimated weight cannot be negative.','coalesce(weight_tons, 0) >= 0',1,true),
  ('health_score_range','cs.customer_health_snapshots','Customer health score range','range','validity','medium','Customer health score must remain between 0 and 100.','health_score between 0 and 100',1,true),
  ('ai_packet_has_purpose','ai.ai_readiness_packets','AI packet has purpose','not_null','governance','critical','Every AI readiness packet must state a purpose.','purpose is not null and length(trim(purpose)) > 0',1,true),
  ('prompt_key_required','ai.ai_prompt_registry','Prompt key required','not_null','governance','critical','Every prompt registry entry must have a stable prompt key.','prompt_key is not null and length(trim(prompt_key)) > 0',1,true),
  ('migration_key_unique','schema.schema_migration_ledger','Migration key unique','unique','uniqueness','critical','Every schema migration ledger entry must have a unique migration key.','migration_key is unique',1,true)
on conflict (rule_key) do update set
  asset_key = excluded.asset_key,
  rule_name = excluded.rule_name,
  rule_type = excluded.rule_type,
  dimension = excluded.dimension,
  severity = excluded.severity,
  expectation = excluded.expectation,
  sql_check = excluded.sql_check,
  threshold = excluded.threshold,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.aplomo_data_lineage_edges (
  edge_key,
  source_asset_key,
  target_asset_key,
  lineage_type,
  transformation_kind,
  confidence,
  description
)
values
  ('devices_to_latest_positions','ops.devices','ops.latest_device_positions','feeds','repository',95,'Device fleet records feed latest known positions.'),
  ('devices_to_device_sessions','ops.devices','ops.device_sessions','feeds','repository',95,'Devices produce operating sessions.'),
  ('devices_to_device_connections','ops.devices','ops.device_connections','feeds','repository',95,'Devices produce connectivity records.'),
  ('devices_to_gps_captures','ops.devices','ops.gps_captures','feeds','repository',95,'Devices generate GPS capture records.'),
  ('material_types_to_stockpiles','catalog.material_types','ops.stockpiles','enriches','logical',90,'Material density metadata enriches stockpile analytics.'),
  ('companies_to_customer_health','core.companies','cs.customer_health_snapshots','feeds','analytics',90,'Tenant records feed customer health scoring.'),
  ('customer_health_to_crosswalk','cs.customer_health_snapshots','analytics.support_health_crosswalk','feeds','analytics',90,'Customer health snapshots feed support-health crosswalk.'),
  ('support_workflows_to_crosswalk','cs.support_workflows','analytics.support_health_crosswalk','feeds','analytics',90,'Support workflows feed support-health crosswalk.'),
  ('ai_packets_to_governance_events','ai.ai_readiness_packets','ai.ai_governance_events','governs','ai_context',90,'Approved AI readiness packets produce governance evidence.'),
  ('prompt_registry_to_governance_events','ai.ai_prompt_registry','ai.ai_governance_events','governs','ai_context',90,'Prompt registry lifecycle emits governance events.'),
  ('migration_ledger_to_capability_status','schema.schema_migration_ledger','schema.schema_capability_status','feeds','analytics',90,'Migration ledger informs backend capability status.'),
  ('schema_findings_to_capability_status','schema.schema_audit_findings','schema.schema_capability_status','audits','analytics',90,'Schema audit findings update capability completeness posture.')
on conflict (edge_key) do update set
  source_asset_key = excluded.source_asset_key,
  target_asset_key = excluded.target_asset_key,
  lineage_type = excluded.lineage_type,
  transformation_kind = excluded.transformation_kind,
  confidence = excluded.confidence,
  description = excluded.description,
  updated_at = now();

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'aplomo_data_assets',
    'aplomo_data_quality_rules',
    'aplomo_data_quality_runs',
    'aplomo_data_lineage_edges'
  )
order by table_name;