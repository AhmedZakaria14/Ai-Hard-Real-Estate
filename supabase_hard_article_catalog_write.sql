create policy hard_catalog_admin_insert_article on public.hard_catalog
for insert to authenticated
with check (
  collection = 'blog_posts'
  and archived_at is null
  and (select auth.uid()) is not null
  and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin'
  and content->>'id' = id
  and content->>'status' = 'published'
);
