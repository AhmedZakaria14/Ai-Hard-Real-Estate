create policy hard_sector_catalog_construction_admin_insert on public.hard_sector_catalog
for insert to authenticated with check (
  collection = 'construction_projects' and archived_at is null
  and (select auth.uid()) is not null
  and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin'
  and content->>'id' = id
);
