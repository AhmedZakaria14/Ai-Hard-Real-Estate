create or replace function public.hard_operations_report(p_days integer default 30) returns jsonb
language sql stable set search_path='' as $$
  select jsonb_build_object(
    'requests', count(*) filter (where form_type <> 'newsletter_signup'),
    'unarchived', count(*) filter (where form_type <> 'newsletter_signup' and archived_at is null),
    'pending', count(*) filter (where form_type <> 'newsletter_signup' and archived_at is null and status = 'new'),
    'appointments', count(*) filter (where archived_at is null and (
      form_type = 'book_viewing' or (form_type = 'hvac_service' and payload->'details'->>'date' is not null)
    )),
    'archived', count(*) filter (where form_type <> 'newsletter_signup' and archived_at is not null),
    'subscribers', count(*) filter (where form_type = 'newsletter_signup' and archived_at is null)
  )
  from public.hard_form_submissions
  where p_days = 0 or received_at >= now() - make_interval(days => greatest(1, least(365, coalesce(p_days, 30))))
$$;
