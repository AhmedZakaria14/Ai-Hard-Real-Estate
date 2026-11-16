create table public.hard_system_logs (
 id uuid primary key default gen_random_uuid(),
 body jsonb not null check (jsonb_typeof(body)='object' and octet_length(body::text)<=32768),
 created_at timestamptz not null default now()
);
alter table public.hard_system_logs enable row level security;
revoke all on public.hard_system_logs from public, anon, authenticated;
grant select, insert (body) on public.hard_system_logs to authenticated;
create policy hard_system_logs_admin_read on public.hard_system_logs for select to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create policy hard_system_logs_admin_write on public.hard_system_logs for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create index hard_system_logs_recent on public.hard_system_logs(created_at desc,id);
