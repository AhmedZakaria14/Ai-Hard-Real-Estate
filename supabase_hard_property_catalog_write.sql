grant insert (collection, id, content) on public.hard_catalog to authenticated;

create policy hard_catalog_admin_insert_property on public.hard_catalog
for insert to authenticated
with check (
  collection = 'properties'
  and archived_at is null
  and (select auth.uid()) is not null
  and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin'
  and not (content ? 'agent')
  and content->>'id' = id
);

update public.hard_catalog
set content = jsonb_set(content, '{location,city,ar}', to_jsonb('الخبر'::text)),
    updated_at = now()
where collection = 'properties'
  and content#>>'{location,city,ar}' in ('الخُبر', 'ال ُخبر', 'الخُبَر', 'الْخُبَر');
