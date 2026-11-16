create table public.hard_web_page_sections (
 page_id text primary key check(page_id in ('page_portal','page_realestate','page_realestate_about','page_construction','page_hvac')),
 sections jsonb not null check(jsonb_typeof(sections)='array' and octet_length(sections::text)<=524288),
 version integer not null,
 published_at timestamptz not null default now()
);
alter table public.hard_web_page_sections enable row level security;
revoke all on public.hard_web_page_sections from public,anon,authenticated;
grant select on public.hard_web_page_sections to anon,authenticated;
grant insert,update on public.hard_web_page_sections to authenticated;
create policy hard_web_pages_public_read on public.hard_web_page_sections for select to anon,authenticated using (true);
create policy hard_web_pages_admin_write on public.hard_web_page_sections for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create function hard_migration.project_visible_page_sections() returns trigger
language plpgsql set search_path='' as $$
declare visible jsonb;
begin
 if new.entity_type <> 'page_document' or new.release_version=old.release_version
 or new.entity_id not in ('page_portal','page_realestate','page_realestate_about','page_construction','page_hvac') then return new; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
 'id',section->>'id','type',section->>'type','order',ord,'isVisible',true,'content',
 case section->>'type' when 'hero' then jsonb_build_object(
 'title',jsonb_build_object('ar',section#>>'{content,title,ar}','en',section#>>'{content,title,en}'),
 'subtitle',jsonb_build_object('ar',section#>>'{content,subtitle,ar}','en',section#>>'{content,subtitle,en}'),
 'bgImageUrl',section#>>'{content,bgImageUrl}',
 'primaryCtaText',jsonb_build_object('ar',section#>>'{content,primaryCtaText,ar}','en',section#>>'{content,primaryCtaText,en}'),
 'primaryCtaUrl',section#>>'{content,primaryCtaUrl}',
 'secondaryCtaText',jsonb_build_object('ar',section#>>'{content,secondaryCtaText,ar}','en',section#>>'{content,secondaryCtaText,en}'),
 'secondaryCtaUrl',section#>>'{content,secondaryCtaUrl}')
 when 'text_block' then jsonb_build_object(
 'heading',jsonb_build_object('ar',section#>>'{content,heading,ar}','en',section#>>'{content,heading,en}'),
 'subheading',jsonb_build_object('ar',section#>>'{content,subheading,ar}','en',section#>>'{content,subheading,en}'),
 'bodyParagraphs',jsonb_build_object('ar',section#>>'{content,bodyParagraphs,ar}','en',section#>>'{content,bodyParagraphs,en}'),
 'alignment',section#>>'{content,alignment}') end) order by ord),'[]'::jsonb)
 into visible from jsonb_array_elements(case when jsonb_typeof(new.release->'sections')='array' then new.release->'sections' else '[]'::jsonb end) with ordinality s(section,ord)
 where section->>'type' in ('hero','text_block') and section->'isVisible' is distinct from 'false'::jsonb;
 insert into public.hard_web_page_sections(page_id,sections,version)
 values(new.entity_id,visible,new.release_version)
 on conflict(page_id) do update set sections=excluded.sections,version=excluded.version,published_at=now();
 return new;
end;$$;
revoke all on function hard_migration.project_visible_page_sections() from public,anon,authenticated;
create trigger hard_cms_copy_public_page_sections after update of release_version on public.hard_cms_workspaces
for each row execute function hard_migration.project_visible_page_sections();

alter table public.hard_catalog add column archived_at timestamptz;
alter table public.hard_sector_catalog add column archived_at timestamptz;
grant update (archived_at) on public.hard_catalog,public.hard_sector_catalog to authenticated;
create policy hard_catalog_archive_visibility on public.hard_catalog as restrictive for select to anon,authenticated
using (archived_at is null or ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin'));
create policy hard_sector_catalog_archive_visibility on public.hard_sector_catalog as restrictive for select to anon,authenticated
using (archived_at is null or ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin'));
