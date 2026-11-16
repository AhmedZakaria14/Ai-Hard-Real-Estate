create policy hard_catalog_admin_insert_project on public.hard_catalog
for insert to authenticated
with check (
  collection = 'projects'
  and archived_at is null
  and (select auth.uid()) is not null
  and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin'
  and content->>'id' = id
);
