create table public.hard_company_content (
  kind text not null check (kind in ('team','offices','statistics','partners','stories')),
  id text not null,
  body jsonb not null check (jsonb_typeof(body) = 'object' and body->>'id' = id and octet_length(body::text) <= 65536),
  primary key (kind,id)
);
alter table public.hard_company_content enable row level security;
revoke all on public.hard_company_content from public, anon, authenticated;
grant select, insert, update, delete on public.hard_company_content to authenticated;
create policy hard_company_admin on public.hard_company_content for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role' = 'superadmin');

create view public.hard_public_company_content as
select kind,id,(
  select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
  from jsonb_each(body)
  where key = any(case kind
    when 'team' then array['id','name','role','avatar','sector','order']
    when 'offices' then array['id','name','city','address','image','sector','order']
    when 'statistics' then array['id','value','label','description','sector','order']
    when 'partners' then array['id','name','logoUrl','category','sector','order']
    when 'stories' then array['id','name','role','location','avatar','rating','quote','dealHighlight','category','featured']
  end)
) as body
from public.hard_company_content
where case kind when 'stories' then true else body->>'status' = 'published' end;
revoke all on public.hard_public_company_content from public, anon, authenticated;
grant select on public.hard_public_company_content to anon, authenticated;
