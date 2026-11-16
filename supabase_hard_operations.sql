alter table public.hard_form_submissions add column archived_at timestamptz;
grant update (archived_at) on public.hard_form_submissions to authenticated;
create table public.hard_operation_events (
 submission_id text primary key references public.hard_form_submissions(id) on delete cascade,
 tracking_code text not null,
 sector text not null,
 form_type text not null,
 occurred_at timestamptz not null default now(),
 seen_at timestamptz
);
alter table public.hard_operation_events enable row level security;
revoke all on public.hard_operation_events from public, anon, authenticated;
grant select, update (seen_at) on public.hard_operation_events to authenticated;
create policy hard_operation_events_admin_select on public.hard_operation_events for select to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create policy hard_operation_events_admin_ack on public.hard_operation_events for update to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create function hard_migration.record_hard_inbox_event() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.form_type <> 'newsletter_signup' then
  insert into public.hard_operation_events(submission_id,tracking_code,sector,form_type,occurred_at)
  values(new.id,new.tracking_code,new.sector,new.form_type,new.received_at);
 end if;
 return new;
end;
$$;
revoke all on function hard_migration.record_hard_inbox_event() from public,anon,authenticated;
create trigger hard_inbox_event_after_insert after insert on public.hard_form_submissions
for each row execute function hard_migration.record_hard_inbox_event();
insert into public.hard_operation_events(submission_id,tracking_code,sector,form_type,occurred_at)
select id,tracking_code,sector,form_type,received_at from public.hard_form_submissions where form_type <> 'newsletter_signup'
on conflict(submission_id) do nothing;
create function public.hard_operations_report(p_days integer default 30) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object(
 'requests',count(*) filter(where form_type <> 'newsletter_signup'),
 'pending',count(*) filter(where archived_at is null and status='new' and form_type <> 'newsletter_signup'),
 'appointments',count(*) filter(where form_type='book_viewing' or (form_type='hvac_service' and payload->'details'->>'date' is not null)),
 'archived',count(*) filter(where archived_at is not null and form_type <> 'newsletter_signup'),
 'subscribers',count(*) filter(where form_type='newsletter_signup'))
 from public.hard_form_submissions
 where received_at >= now()-make_interval(days=>greatest(1,least(365,coalesce(p_days,30))))
$$;
revoke all on function public.hard_operations_report(integer) from public,anon,authenticated;
grant execute on function public.hard_operations_report(integer) to authenticated;
