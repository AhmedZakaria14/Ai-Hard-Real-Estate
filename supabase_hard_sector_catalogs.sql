create table public.hard_sector_catalog (
 collection text not null check (collection in ('construction_projects','hvac_services')),
 id text not null,
 content jsonb not null check (jsonb_typeof(content) = 'object' and content->>'id' = id and octet_length(content::text) <= 524288),
 updated_at timestamptz not null default now(),
 primary key (collection,id)
);
alter table public.hard_sector_catalog enable row level security;
revoke all on public.hard_sector_catalog from public, anon, authenticated;
grant select on public.hard_sector_catalog to anon, authenticated;
grant update (content,updated_at) on public.hard_sector_catalog to authenticated;
create policy hard_sector_catalog_public_read on public.hard_sector_catalog for select to anon, authenticated using (true);
create policy hard_sector_catalog_admin_update on public.hard_sector_catalog for update to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin');
create policy hard_sector_catalog_image_upload on storage.objects for insert to authenticated
with check (bucket_id = 'hard-public-catalog' and (select auth.uid()) is not null
and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin'
and (storage.foldername(name))[1] in ('construction_projects','hvac_services'));

alter table public.hard_form_submissions
 drop constraint hard_form_submissions_payload_check,
 add constraint hard_form_submissions_payload_check check (
 jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 65536
 and (
 (coalesce(payload->>'email','') ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' and char_length(payload->>'email') <= 254)
 or (form_type = 'hvac_service' and sector = 'hvac' and coalesce(payload->>'email','') = ''
 and char_length(regexp_replace(coalesce(payload->>'phone',''), '[^0-9]', '', 'g')) between 7 and 20)
 ));
