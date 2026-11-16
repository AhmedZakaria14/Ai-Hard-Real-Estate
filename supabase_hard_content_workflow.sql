create table public.hard_cms_workspaces (
 entity_type text not null check(entity_type in ('page_document','form_schema')),
 entity_id text not null check(entity_id ~ '^[a-z0-9_-]{1,120}$'),
 draft jsonb,
 revision integer not null default 0,
 release jsonb,
 release_version integer not null default 0,
 updated_at timestamptz not null default now(),
 primary key(entity_type,entity_id),
 check(octet_length(coalesce(draft::text,'')) <= 524288),
 check(octet_length(coalesce(release::text,'')) <= 524288)
);
create table public.hard_cms_revisions (
 id uuid primary key default gen_random_uuid(),
 entity_type text not null,
 entity_id text not null,
 version integer not null,
 body jsonb not null check(octet_length(body::text)<=524288),
 changed_at timestamptz not null default now(),
 unique(entity_type,entity_id,version)
);
alter table public.hard_cms_workspaces enable row level security;
alter table public.hard_cms_revisions enable row level security;
revoke all on public.hard_cms_workspaces,public.hard_cms_revisions from public,anon,authenticated;
grant select,insert,update on public.hard_cms_workspaces to authenticated;
grant select,insert on public.hard_cms_revisions to authenticated;
create policy hard_workspaces_admin on public.hard_cms_workspaces for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create policy hard_revisions_admin on public.hard_cms_revisions for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');
create function public.hard_save_cms_draft(p_type text,p_id text,p_expected integer,p_record jsonb,p_force boolean default false)
returns jsonb language plpgsql set search_path='' as $$
declare current_row public.hard_cms_workspaces; next_record jsonb;
begin
 insert into public.hard_cms_workspaces(entity_type,entity_id) values(p_type,p_id) on conflict do nothing;
 select * into current_row from public.hard_cms_workspaces where entity_type=p_type and entity_id=p_id for update;
 if not p_force and current_row.revision<>p_expected then
  return jsonb_build_object('conflict',true,'record',current_row.draft,'revision',current_row.revision);
 end if;
 next_record := p_record || jsonb_build_object('revision',current_row.revision+1,'updatedAt',now(),'updatedByEmail',auth.jwt()->>'email');
 update public.hard_cms_workspaces set draft=next_record,revision=current_row.revision+1,updated_at=now()
 where entity_type=p_type and entity_id=p_id;
 return jsonb_build_object('conflict',false,'record',next_record);
end;$$;
create function public.hard_publish_cms(p_type text,p_id text,p_sector text,p_body jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare current_row public.hard_cms_workspaces; next_version integer; next_history integer; event_id uuid; ts timestamptz:=now(); result_body jsonb;
begin
 insert into public.hard_cms_workspaces(entity_type,entity_id) values(p_type,p_id) on conflict do nothing;
 select * into current_row from public.hard_cms_workspaces where entity_type=p_type and entity_id=p_id for update;
 next_version:=current_row.release_version+1;
 select coalesce(max(version),0)+1 into next_history from public.hard_cms_revisions where entity_type=p_type and entity_id=p_id;
 result_body:=p_body || jsonb_build_object('publicationVersion',next_version,'publishedAt',ts);
 if p_type='form_schema' then
  result_body:=result_body || jsonb_build_object('schemaVersion',next_version::text,'updatedAt',ts);
  insert into public.hard_runtime_config(kind,key,body) values ('form',p_id,result_body)
  on conflict(kind,key) do update set body=excluded.body,updated_at=ts;
 end if;
 insert into public.hard_cms_revisions(entity_type,entity_id,version,body)
 values(p_type,p_id,next_history,jsonb_build_object('entityType',p_type,'entityId',p_id,'sector',p_sector,'version',next_history,'snapshotData',p_body,'changedBy',auth.jwt()->>'email','changedAt',ts,'changeType','published_release'))
 returning id into event_id;
 update public.hard_cms_workspaces set release=result_body,release_version=next_version,
 draft=coalesce(current_row.draft,'{}'::jsonb) || jsonb_build_object('status','published','data',p_body,'publishedVersion',next_version),
 updated_at=ts where entity_type=p_type and entity_id=p_id;
 return jsonb_build_object('version',next_version,'eventId',event_id,'publishedAt',ts);
end;$$;
revoke all on function public.hard_save_cms_draft(text,text,integer,jsonb,boolean),public.hard_publish_cms(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.hard_save_cms_draft(text,text,integer,jsonb,boolean),public.hard_publish_cms(text,text,text,jsonb) to authenticated;

create function public.hard_save_cms_revision(p_type text,p_id text,p_body jsonb)
returns jsonb language plpgsql set search_path='' as $$
declare next_version integer; uid uuid; stored jsonb;
begin
 insert into public.hard_cms_workspaces(entity_type,entity_id) values(p_type,p_id) on conflict do nothing;
 perform 1 from public.hard_cms_workspaces where entity_type=p_type and entity_id=p_id for update;
 select coalesce(max(version),0)+1 into next_version from public.hard_cms_revisions where entity_type=p_type and entity_id=p_id;
 stored:=p_body || jsonb_build_object('entityType',p_type,'entityId',p_id,'version',next_version,'changedBy',auth.jwt()->>'email','changedAt',now());
 insert into public.hard_cms_revisions(entity_type,entity_id,version,body) values(p_type,p_id,next_version,stored) returning id into uid;
 return stored || jsonb_build_object('id',uid);
end;$$;
revoke all on function public.hard_save_cms_revision(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.hard_save_cms_revision(text,text,jsonb) to authenticated;
