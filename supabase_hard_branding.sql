create table public.hard_site_branding (
 sector text not null check (sector in ('portal','realestate','construction','hvac')),
 visibility text not null check (visibility in ('draft','published')),
 settings jsonb not null check (jsonb_typeof(settings)='object' and octet_length(settings::text)<=65536 and not (settings ? 'updatedBy') and settings->>'sector'=sector and settings->>'publicationStatus'=visibility),
 updated_at timestamptz not null default now(),
 primary key(sector,visibility)
);
alter table public.hard_site_branding enable row level security;
revoke all on public.hard_site_branding from public, anon, authenticated;
grant select on public.hard_site_branding to anon, authenticated;
grant insert, update on public.hard_site_branding to authenticated;
create policy hard_branding_published_read on public.hard_site_branding for select to anon, authenticated using (visibility='published');
create policy hard_branding_admin on public.hard_site_branding for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
