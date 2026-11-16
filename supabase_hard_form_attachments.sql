create table public.hard_attachment_uploads (
 id uuid primary key,
 ticket uuid not null,
 path text not null unique,
 filename text not null,
 mime_type text not null,
 byte_size integer not null check (byte_size between 1 and 10485760),
 client_hash text not null,
 state text not null default 'reserved' check (state in ('reserved','uploaded','linked','removed')),
 submission_id text,
 created_at timestamptz not null default now()
);
alter table public.hard_attachment_uploads enable row level security;
revoke all on public.hard_attachment_uploads from public, anon, authenticated;
grant select, insert, update on public.hard_attachment_uploads to service_role;
create index hard_attachment_uploads_created_idx on public.hard_attachment_uploads(created_at desc);
create function public.hard_reserve_attachment(p_id uuid, p_ticket uuid, p_path text, p_filename text, p_mime text, p_size int, p_client text)
returns boolean language plpgsql set search_path='' as $$
begin
  perform pg_advisory_xact_lock(403871427);
  if (select count(*) from public.hard_attachment_uploads where created_at > now() - interval '1 hour') >= 80
     or (select count(*) from public.hard_attachment_uploads where created_at > now() - interval '1 hour' and client_hash=p_client) >= 20
     or (select coalesce(sum(byte_size),0) from public.hard_attachment_uploads where created_at > now() - interval '24 hours') + p_size > 500 * 1024 * 1024 then
    return false;
  end if;
  insert into public.hard_attachment_uploads(id,ticket,path,filename,mime_type,byte_size,client_hash)
  values (p_id,p_ticket,p_path,p_filename,p_mime,p_size,p_client);
  return true;
end;
$$;
revoke all on function public.hard_reserve_attachment(uuid,uuid,text,text,text,int,text) from public, anon, authenticated;
grant execute on function public.hard_reserve_attachment(uuid,uuid,text,text,text,int,text) to service_role;
create function hard_migration.hard_attach_uploads() returns trigger language plpgsql security definer set search_path='' as $$
declare item jsonb; files jsonb := '[]'::jsonb; upload public.hard_attachment_uploads;
begin
  if not (new.payload ? 'attachments') or new.payload->'attachments' = 'null'::jsonb then return new; end if;
  if jsonb_typeof(new.payload->'attachments') <> 'array' or jsonb_array_length(new.payload->'attachments') > 5 then
    raise exception 'Invalid attachments';
  end if;
  for item in select value from jsonb_array_elements(new.payload->'attachments') loop
    if item->>'backend' <> 'supabase' or item->>'backend' is null then
      continue;
    end if;
    update public.hard_attachment_uploads
    set state='linked', submission_id=new.id
    where id=(item->>'id')::uuid and ticket=(item->>'downloadToken')::uuid and state='uploaded' and created_at > now() - interval '2 hours'
    returning * into upload;
    if not found then raise exception 'Attachment could not be confirmed'; end if;
    files := files || jsonb_build_array(jsonb_build_object('backend','supabase','id',upload.id,'fileName',upload.filename,'storagePath',upload.path,'mimeType',upload.mime_type,'fileSizeBytes',upload.byte_size));
  end loop;
  new.payload := jsonb_set(new.payload,'{attachments}',files,true);
  return new;
end;
$$;
revoke all on function hard_migration.hard_attach_uploads() from public, anon, authenticated;
create trigger hard_forms_link_private_uploads before insert on public.hard_form_submissions for each row execute function hard_migration.hard_attach_uploads();
create policy hard_form_private_attachment_read on storage.objects for select to authenticated
using (bucket_id='hard-form-attachments' and (storage.foldername(name))[1]='submissions'
 and (select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');

create or replace function hard_migration.hard_attach_uploads() returns trigger language plpgsql security definer set search_path='' as $$
declare item jsonb; files jsonb := '[]'::jsonb; upload public.hard_attachment_uploads;
begin
  if not (new.payload ? 'attachments') or new.payload->'attachments' = 'null'::jsonb then return new; end if;
  if jsonb_typeof(new.payload->'attachments') <> 'array' or jsonb_array_length(new.payload->'attachments') > 5 then
    raise exception 'Invalid attachments';
  end if;
  for item in select value from jsonb_array_elements(new.payload->'attachments') loop
    if item->>'backend' <> 'supabase' or item->>'backend' is null then
      continue;
    end if;
    update public.hard_attachment_uploads
    set state='linked', submission_id=new.id
    where id=(item->>'id')::uuid and ticket=(item->>'downloadToken')::uuid and ((state='uploaded' and created_at > now() - interval '2 hours') or (state='linked' and submission_id=new.id))
    returning * into upload;
    if not found then raise exception 'Attachment could not be confirmed'; end if;
    files := files || jsonb_build_array(jsonb_build_object('backend','supabase','id',upload.id,'fileName',upload.filename,'storagePath',upload.path,'mimeType',upload.mime_type,'fileSizeBytes',upload.byte_size));
  end loop;
  new.payload := jsonb_set(new.payload,'{attachments}',files,true);
  return new;
end;
$$;

