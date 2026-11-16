create table public.hard_navigation (
 id text not null check (id ~ '^(header|footer|sector_bar)_(portal|realestate|construction|hvac)$'),
 visibility text not null check (visibility in ('admin','published')),
 menu jsonb not null check (jsonb_typeof(menu)='object' and octet_length(menu::text)<=65536 and menu->>'id'=id),
 primary key(id,visibility),
 check (visibility <> 'published' or not (menu ? 'updatedBy'))
);
alter table public.hard_navigation enable row level security;
revoke all on public.hard_navigation from public, anon, authenticated;
grant select on public.hard_navigation to anon, authenticated;
grant insert, update on public.hard_navigation to authenticated;
create policy hard_navigation_public_read on public.hard_navigation for select to anon, authenticated using (visibility='published');
create policy hard_navigation_admin on public.hard_navigation for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create table public.hard_redirect_rules (
 id text primary key,
 source_path text not null unique check (source_path ~ '^/[a-z0-9][a-z0-9/-]*$' and source_path not like '%//%'),
 target_path text not null check (target_path ~ '^/[a-z0-9][a-z0-9/-]*$' and target_path not like '%//%' and source_path <> target_path),
 sector text not null check (sector in ('portal','realestate','construction','hvac')),
 status_code integer not null check (status_code in (301,302)),
 created_at timestamptz not null default now(),
 check (source_path !~ '^/(admin|login|api|static|_next)(/|$)' and target_path !~ '^/(admin|login|api|static|_next)(/|$)'
 and source_path !~ '^/(realestate|construction|hvac)/(admin|cms)(/|$)' and target_path !~ '^/(realestate|construction|hvac)/(admin|cms)(/|$)')
);
alter table public.hard_redirect_rules enable row level security;
revoke all on public.hard_redirect_rules from public, anon, authenticated;
grant select, insert, delete on public.hard_redirect_rules to authenticated;
create policy hard_redirect_admin on public.hard_redirect_rules for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
