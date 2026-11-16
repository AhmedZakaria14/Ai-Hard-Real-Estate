create table public.hard_form_submissions (
  id text primary key check (id ~ '^lead-[0-9]{13}-[a-z0-9]{5}$'),
  tracking_code text not null check (char_length(tracking_code) between 1 and 100),
  form_type text not null check (form_type in ('general_contact','property_inquiry','list_property','valuation_request','book_viewing','project_inquiry','construction_quote','hvac_service','newsletter_signup')),
  sector text not null check (sector in ('group','realestate','construction','hvac')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 65536 and coalesce(payload->>'email','') ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' and char_length(payload->>'email') <= 254),
  received_at timestamptz not null default now()
);
alter table public.hard_form_submissions enable row level security;
revoke all on public.hard_form_submissions from public, anon, authenticated;
grant insert (id, tracking_code, form_type, sector, payload) on public.hard_form_submissions to anon, authenticated;
grant select on public.hard_form_submissions to service_role;
create policy hard_forms_insert on public.hard_form_submissions for insert to anon, authenticated with check (true);
create index hard_form_submissions_received_at_idx on public.hard_form_submissions (received_at desc);
alter table public.hard_form_submissions drop constraint hard_form_submissions_id_check, add constraint hard_form_submissions_id_check check (id ~ '^lead-[0-9]{13}-[a-f0-9]{32}$');
