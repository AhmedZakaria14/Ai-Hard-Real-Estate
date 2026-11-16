create table public.hard_runtime_config (
 kind text not null check (kind in ('calculator','form')),
 key text not null check (key ~ '^[a-z][a-z0-9_]{1,79}$'),
 body jsonb not null check (jsonb_typeof(body)='object' and octet_length(body::text)<=131072),
 updated_at timestamptz not null default now(),
 primary key(kind,key),
 check (kind <> 'calculator' or key not in ('construction_published','hvac_published') or not (body ? 'publishedBy' or body ? 'updatedBy'))
);
alter table public.hard_runtime_config enable row level security;
revoke all on public.hard_runtime_config from public, anon, authenticated;
grant select on public.hard_runtime_config to anon, authenticated;
grant insert, update on public.hard_runtime_config to authenticated;
create policy hard_calculator_public_config on public.hard_runtime_config for select to anon, authenticated
using (kind='calculator' and key in ('construction_published','hvac_published'));
create policy hard_runtime_config_admin on public.hard_runtime_config for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
