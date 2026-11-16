create table public.hard_media_assets (
 id text primary key,
 bucket text not null check (bucket in ('hard-public-catalog','hard-cms-private-media')),
 path text not null unique check (path like 'cms-media/%'),
 asset jsonb not null check (jsonb_typeof(asset)='object' and asset->>'id'=id),
 created_at timestamptz not null default now()
);
alter table public.hard_media_assets enable row level security;
revoke all on public.hard_media_assets from public, anon, authenticated;
grant select, insert, delete on public.hard_media_assets to authenticated;
create policy hard_media_admin on public.hard_media_assets for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('hard-cms-private-media','hard-cms-private-media',false,15728640,array['image/jpeg','image/png','image/webp','image/gif','image/avif','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;
create policy hard_cms_media_read on storage.objects for select to authenticated
using (bucket_id in ('hard-public-catalog','hard-cms-private-media') and (storage.foldername(name))[1]='cms-media'
and (select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create policy hard_cms_media_write on storage.objects for insert to authenticated
with check (bucket_id in ('hard-public-catalog','hard-cms-private-media') and (storage.foldername(name))[1]='cms-media'
and (select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create policy hard_cms_media_cleanup on storage.objects for delete to authenticated
using (bucket_id in ('hard-public-catalog','hard-cms-private-media') and (storage.foldername(name))[1]='cms-media'
and (select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
