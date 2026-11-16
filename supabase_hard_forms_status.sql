alter table public.hard_form_submissions
 add column status text not null default 'new' check (status in ('new','contacted','closed')),
 add column status_history jsonb not null default '[]'::jsonb;
grant update (status) on public.hard_form_submissions to authenticated;
create policy hard_forms_admin_update on public.hard_form_submissions for update to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin');
create function hard_migration.record_form_status_change() returns trigger language plpgsql set search_path = '' as $$
begin
 if old.status is distinct from new.status then
  new.status_history := old.status_history || jsonb_build_array(jsonb_build_object('at',now(),'by',auth.uid(),'from',old.status,'to',new.status));
 end if;
 return new;
end;
$$;
revoke all on function hard_migration.record_form_status_change() from public, anon, authenticated;
create trigger hard_forms_status_history before update of status on public.hard_form_submissions for each row execute function hard_migration.record_form_status_change();
