alter table public.hard_form_submissions
  drop constraint hard_form_submissions_payload_check,
  add constraint hard_form_submissions_payload_check check (
    jsonb_typeof(payload) = 'object'
    and octet_length(payload::text) <= 65536
    and (
      (
        coalesce(payload ->> 'email', '') ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
        and char_length(payload ->> 'email') <= 254
      )
      or (
        coalesce(payload ->> 'email', '') = ''
        and (
          (form_type = 'hvac_service' and sector = 'hvac')
          or (form_type in ('property_inquiry', 'book_viewing') and sector = 'realestate')
          or (
            form_type = 'project_inquiry' and sector = 'realestate'
            and (payload #>> '{details,requestType}') is distinct from 'brochure'
            and coalesce(payload ->> 'phone', '') ~ '^[0-9+().[:space:]-]+$'
          )
        )
        and char_length(regexp_replace(coalesce(payload ->> 'phone', ''), '[^0-9]', '', 'g')) between 7 and 20
      )
    )
  );
