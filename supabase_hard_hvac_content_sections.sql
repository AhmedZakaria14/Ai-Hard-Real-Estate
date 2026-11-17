alter table public.hard_sector_sections drop constraint hard_sector_sections_check,
  add constraint hard_sector_sections_check check (
    (sector='construction' and section_key in ('hero','company','stages','offices'))
    or (sector='hvac' and section_key in ('hero','hours_contact','booking_copy','service_areas','work_gallery','maintenance_guide','reviews'))
    or (sector='realestate' and section_key in ('hero','service_media'))
  );
