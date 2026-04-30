drop policy if exists aplomo_gps_captures_insert_member on public.aplomo_gps_captures;
create policy aplomo_gps_captures_insert_member
on public.aplomo_gps_captures
for insert
to authenticated
with check (
  public.aplomo_is_company_member(company_id)
  and (
    captured_by_profile_id is null
    or captured_by_profile_id = auth.uid()
  )
);

drop policy if exists aplomo_gps_captures_update_member on public.aplomo_gps_captures;
create policy aplomo_gps_captures_update_member
on public.aplomo_gps_captures
for update
to authenticated
using (public.aplomo_is_company_member(company_id))
with check (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_latest_positions_insert_member on public.aplomo_latest_device_positions;
create policy aplomo_latest_positions_insert_member
on public.aplomo_latest_device_positions
for insert
to authenticated
with check (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_latest_positions_update_member on public.aplomo_latest_device_positions;
create policy aplomo_latest_positions_update_member
on public.aplomo_latest_device_positions
for update
to authenticated
using (public.aplomo_is_company_member(company_id))
with check (public.aplomo_is_company_member(company_id));

drop policy if exists aplomo_audit_logs_insert_member on public.aplomo_audit_logs;
create policy aplomo_audit_logs_insert_member
on public.aplomo_audit_logs
for insert
to authenticated
with check (
  company_id is null
  or public.aplomo_is_company_member(company_id)
);

notify pgrst, 'reload schema';
