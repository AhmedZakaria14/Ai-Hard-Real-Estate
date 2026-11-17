grant insert (collection, id, content) on public.hard_sector_catalog to authenticated;
create policy hard_sector_catalog_hvac_admin_insert on public.hard_sector_catalog
for insert to authenticated with check (
  collection = 'hvac_services' and archived_at is null
  and (select auth.uid()) is not null
  and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin'
  and content->>'id' = id
);