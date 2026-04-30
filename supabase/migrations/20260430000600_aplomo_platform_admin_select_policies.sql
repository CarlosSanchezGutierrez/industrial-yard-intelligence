drop policy if exists aplomo_companies_select_platform on public.aplomo_companies;
create policy aplomo_companies_select_platform
on public.aplomo_companies
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

drop policy if exists aplomo_profiles_select_platform on public.aplomo_profiles;
create policy aplomo_profiles_select_platform
on public.aplomo_profiles
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

drop policy if exists aplomo_memberships_select_platform on public.aplomo_company_memberships;
create policy aplomo_memberships_select_platform
on public.aplomo_company_memberships
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

drop policy if exists aplomo_sites_select_platform on public.aplomo_sites;
create policy aplomo_sites_select_platform
on public.aplomo_sites
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

drop policy if exists aplomo_devices_select_platform on public.aplomo_devices;
create policy aplomo_devices_select_platform
on public.aplomo_devices
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

drop policy if exists aplomo_sessions_select_platform on public.aplomo_device_sessions;
create policy aplomo_sessions_select_platform
on public.aplomo_device_sessions
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

drop policy if exists aplomo_connections_select_platform on public.aplomo_device_connections;
create policy aplomo_connections_select_platform
on public.aplomo_device_connections
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

drop policy if exists aplomo_materials_select_platform on public.aplomo_material_types;
create policy aplomo_materials_select_platform
on public.aplomo_material_types
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

drop policy if exists aplomo_stockpiles_select_platform on public.aplomo_stockpiles;
create policy aplomo_stockpiles_select_platform
on public.aplomo_stockpiles
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

drop policy if exists aplomo_gps_captures_select_platform on public.aplomo_gps_captures;
create policy aplomo_gps_captures_select_platform
on public.aplomo_gps_captures
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

drop policy if exists aplomo_latest_positions_select_platform on public.aplomo_latest_device_positions;
create policy aplomo_latest_positions_select_platform
on public.aplomo_latest_device_positions
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

drop policy if exists aplomo_alerts_select_platform on public.aplomo_operational_alerts;
create policy aplomo_alerts_select_platform
on public.aplomo_operational_alerts
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

drop policy if exists aplomo_exports_select_platform on public.aplomo_data_exports;
create policy aplomo_exports_select_platform
on public.aplomo_data_exports
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

drop policy if exists aplomo_audit_logs_select_platform on public.aplomo_audit_logs;
create policy aplomo_audit_logs_select_platform
on public.aplomo_audit_logs
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

notify pgrst, 'reload schema';
