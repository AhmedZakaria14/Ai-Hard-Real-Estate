alter table public.hard_sector_sections
  drop constraint hard_sector_sections_check,
  add constraint hard_sector_sections_check check (
    (sector = 'portal' and section_key = 'landing')
    or (sector = 'construction' and section_key in ('hero','company','stages','offices','services'))
    or (sector = 'hvac' and section_key in ('hero','hours_contact','booking_copy','service_areas','work_gallery','maintenance_guide','reviews','faq'))
    or (sector = 'realestate' and section_key in ('hero','service_media','property_types','site_text','page_media'))
  );

create function public.hard_patch_site_text(copy_path text, arabic_value text, english_value text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare saved jsonb;
begin
  if (select auth.uid()) is null or
     (select auth.jwt())->'app_metadata'->>'hard_role' is distinct from 'superadmin' then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if copy_path is null or copy_path !~ '^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+){1,12}$'
     or char_length(copy_path) > 160 or char_length(arabic_value) > 6000 or char_length(english_value) > 6000 then
    raise exception 'Invalid text override' using errcode = '22023';
  end if;
  insert into public.hard_sector_sections (sector, section_key, body)
  values ('realestate', 'site_text', '{"ar":{},"en":{}}')
  on conflict (sector, section_key) do nothing;

  update public.hard_sector_sections
    set body = jsonb_build_object(
      'ar', case when arabic_value is null then (body->'ar') - copy_path
                 else coalesce(body->'ar','{}'::jsonb) || jsonb_build_object(copy_path, arabic_value) end,
      'en', case when english_value is null then (body->'en') - copy_path
                 else coalesce(body->'en','{}'::jsonb) || jsonb_build_object(copy_path, english_value) end
    ), updated_at = now()
    where sector = 'realestate' and section_key = 'site_text'
    returning body into saved;
  return saved;
end;
$$;
revoke all on function public.hard_patch_site_text(text,text,text) from public, anon, authenticated;
grant execute on function public.hard_patch_site_text(text,text,text) to authenticated;
