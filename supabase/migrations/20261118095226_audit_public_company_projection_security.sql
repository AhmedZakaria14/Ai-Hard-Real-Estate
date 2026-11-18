create table public.hard_company_public_content (
 kind text not null, id text not null, body jsonb not null, primary key(kind,id)
);
alter table public.hard_company_public_content enable row level security;
revoke all on public.hard_company_public_content from anon,authenticated;
grant select on public.hard_company_public_content to anon,authenticated;
grant insert,update,delete on public.hard_company_public_content to authenticated;
create policy hard_company_projection_read on public.hard_company_public_content for select to anon,authenticated using(true);
create policy hard_company_projection_admin on public.hard_company_public_content for all to authenticated
using((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
insert into public.hard_company_public_content select kind,id,body from public.hard_public_company_content;
create or replace view public.hard_public_company_content with(security_invoker=true) as
 select kind,id,body from public.hard_company_public_content;
create function public.hard_sync_public_company_content() returns trigger
language plpgsql security invoker set search_path='' as $$
declare allowed text[]; projected jsonb;
begin
 if tg_op='DELETE' then
  delete from public.hard_company_public_content where kind=old.kind and id=old.id;
  return old;
 end if;
 if new.kind <> 'stories' and coalesce(new.body->>'status','') <> 'published' then
  delete from public.hard_company_public_content where kind=new.kind and id=new.id;
  return new;
 end if;
 allowed := case new.kind
 when 'team' then array['id','name','role','avatar','sector','order']
 when 'offices' then array['id','name','city','address','image','sector','order']
 when 'statistics' then array['id','value','label','description','sector','order']
 when 'partners' then array['id','name','logoUrl','category','sector','order']
 when 'faqs' then array['id','question','answer','category','sector','order','status']
 when 'certifications' then array['id','title','issuer','issueDate','expiryDate','credentialId','credentialUrl','image','sector','order','status']
 when 'enhanced_testimonials' then array['id','name','role','location','avatar','rating','quote','dealHighlight','category','sector','order','featured','status','date']
 when 'stories' then array['id','name','role','location','avatar','rating','quote','dealHighlight','category','featured']
 else array[]::text[] end;
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into projected from jsonb_each(new.body) where key=any(allowed);
 insert into public.hard_company_public_content(kind,id,body) values(new.kind,new.id,projected)
 on conflict(kind,id) do update set body=excluded.body;
 return new;
end;
$$;
revoke all on function public.hard_sync_public_company_content() from public,anon,authenticated;
create trigger hard_company_public_projection_sync after insert or update or delete on public.hard_company_content
for each row execute function public.hard_sync_public_company_content();
