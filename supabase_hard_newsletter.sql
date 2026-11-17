alter table public.hard_form_submissions
  add column newsletter_notes text
  check (newsletter_notes is null or (form_type = 'newsletter_signup' and char_length(newsletter_notes) <= 4000));

grant update (newsletter_notes) on public.hard_form_submissions to authenticated;

create unique index hard_newsletter_active_email_idx
  on public.hard_form_submissions ((lower(btrim(payload->>'email'))))
  where form_type = 'newsletter_signup' and archived_at is null;
