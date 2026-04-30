drop policy if exists aplomo_sites_insert_ops_admin on public.aplomo_sites;
create policy aplomo_sites_insert_ops_admin
on public.aplomo_sites
for insert
to authenticated
with check (public.aplomo_can_write_operations(company_id));

drop policy if exists aplomo_sites_update_ops_admin on public.aplomo_sites;
create policy aplomo_sites_update_ops_admin
on public.aplomo_sites
for update
to authenticated
using (public.aplomo_can_write_operations(company_id))
with check (public.aplomo_can_write_operations(company_id));

drop policy if exists aplomo_devices_insert_ops_admin on public.aplomo_devices;
create policy aplomo_devices_insert_ops_admin
on public.aplomo_devices
for insert
to authenticated
with check (public.aplomo_can_write_operations(company_id));

drop policy if exists aplomo_devices_update_ops_admin on public.aplomo_devices;
create policy aplomo_devices_update_ops_admin
on public.aplomo_devices
for update
to authenticated
using (public.aplomo_can_write_operations(company_id))
with check (public.aplomo_can_write_operations(company_id));

drop policy if exists aplomo_material_types_insert_ops_admin on public.aplomo_material_types;
create policy aplomo_material_types_insert_ops_admin
on public.aplomo_material_types
for insert
to authenticated
with check (public.aplomo_can_write_operations(company_id));

drop policy if exists aplomo_material_types_update_ops_admin on public.aplomo_material_types;
create policy aplomo_material_types_update_ops_admin
on public.aplomo_material_types
for update
to authenticated
using (public.aplomo_can_write_operations(company_id))
with check (public.aplomo_can_write_operations(company_id));

drop policy if exists aplomo_stockpiles_insert_ops_admin on public.aplomo_stockpiles;
create policy aplomo_stockpiles_insert_ops_admin
on public.aplomo_stockpiles
for insert
to authenticated
with check (public.aplomo_can_write_operations(company_id));

drop policy if exists aplomo_stockpiles_update_ops_admin on public.aplomo_stockpiles;
create policy aplomo_stockpiles_update_ops_admin
on public.aplomo_stockpiles
for update
to authenticated
using (public.aplomo_can_write_operations(company_id))
with check (public.aplomo_can_write_operations(company_id));

drop policy if exists aplomo_profiles_select_company_admin on public.aplomo_profiles;
create policy aplomo_profiles_select_company_admin
on public.aplomo_profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.aplomo_company_memberships m
    where m.profile_id = public.aplomo_profiles.id
      and public.aplomo_can_manage_company_users(m.company_id)
  )
);

notify pgrst, 'reload schema';
