alter table public.hard_sector_sections drop constraint hard_sector_sections_body_check,
add constraint hard_sector_sections_body_check check (
  jsonb_typeof(body) in ('object','array') and octet_length(body::text) <=
  case when section_key='site_text' then 4194304 else 131072 end
);
