create table public.hard_catalog (
 collection text not null check (collection in ('properties','projects','blog_posts')),
 id text not null,
 content jsonb not null check (jsonb_typeof(content) = 'object' and content->>'id' = id and octet_length(content::text) <= 524288),
 updated_at timestamptz not null default now(),
 primary key (collection,id)
);
alter table public.hard_catalog enable row level security;
revoke all on public.hard_catalog from public, anon, authenticated;
grant select on public.hard_catalog to anon, authenticated;
grant update (content,updated_at) on public.hard_catalog to authenticated;
create policy hard_catalog_public_read on public.hard_catalog for select to anon, authenticated using (true);
create policy hard_catalog_admin_update on public.hard_catalog for update to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values ('hard-public-catalog','hard-public-catalog',true,15728640,array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
 on conflict (id) do nothing;
create policy hard_catalog_image_upload on storage.objects for insert to authenticated
with check (bucket_id = 'hard-public-catalog' and (select auth.uid()) is not null
  and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin'
  and (storage.foldername(name))[1] in ('properties','projects','blog_posts'));
