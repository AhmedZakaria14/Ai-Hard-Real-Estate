create table public.hard_sector_sections (
 sector text not null check (sector in ('construction','hvac')),
 section_key text not null,
 body jsonb not null check (jsonb_typeof(body) in ('object','array') and octet_length(body::text)<=131072),
 updated_at timestamptz not null default now(),
 primary key(sector,section_key),
 check ((sector='construction' and section_key in ('hero','company','stages','offices'))
 or (sector='hvac' and section_key in ('hero','hours_contact','booking_copy','service_areas')))
);
alter table public.hard_sector_sections enable row level security;
revoke all on public.hard_sector_sections from public, anon, authenticated;
grant select on public.hard_sector_sections to anon, authenticated;
grant insert, update on public.hard_sector_sections to authenticated;
create policy hard_sector_sections_read on public.hard_sector_sections for select to anon, authenticated using (true);
create policy hard_sector_sections_admin on public.hard_sector_sections for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
