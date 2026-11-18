alter table public.hard_sector_sections drop constraint hard_sector_sections_check,
 add constraint hard_sector_sections_check check (
 (sector='portal' and section_key='landing')
 or (sector='construction' and section_key in ('hero','company','stages','offices','services'))
 or (sector='hvac' and section_key in ('hero','hours_contact','booking_copy','service_areas','work_gallery','gallery_categories','maintenance_guide','reviews','faq'))
 or (sector='realestate' and section_key in ('hero','service_media','property_types','site_text','page_media'))
);
create table public.hard_public_form_templates (
 form_type text primary key check(form_type in ('general_contact','property_inquiry','list_property','valuation_request','book_viewing','project_inquiry','construction_quote','hvac_service','newsletter_signup')),
 body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text)<=131072),
 updated_at timestamptz not null default now()
);
alter table public.hard_public_form_templates enable row level security;
revoke all on public.hard_public_form_templates from anon,authenticated;
grant select on public.hard_public_form_templates to anon,authenticated;
grant insert,update,delete on public.hard_public_form_templates to authenticated;
create policy hard_form_templates_public_read on public.hard_public_form_templates for select to anon,authenticated using(true);
create policy hard_form_templates_admin on public.hard_public_form_templates for all to authenticated
 using((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
 with check((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create function public.hard_sync_public_form_template() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if new.kind='form' then
  insert into public.hard_public_form_templates(form_type,body,updated_at)
  values(new.key,new.body - 'workflowSettings' - 'updatedBy',now())
  on conflict(form_type) do update set body=excluded.body,updated_at=excluded.updated_at;
 end if;
 return new;
end;
$$;
revoke all on function public.hard_sync_public_form_template() from public,anon,authenticated;
create trigger hard_runtime_form_template_sync after insert or update on public.hard_runtime_config
 for each row execute function public.hard_sync_public_form_template();
insert into public.hard_public_form_templates(form_type,body)
 select key,body-'workflowSettings'-'updatedBy' from public.hard_runtime_config where kind='form';

