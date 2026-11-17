create function public.hard_resolve_redirect(p_path text)
returns table (target_path text, status_code integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_path text := p_path;
  visited text[] := array[]::text[];
  destination text;
  step_status integer;
  result_status integer := 301;
begin
  for depth in 1..16 loop
    if current_path is null or char_length(current_path) > 500
       or current_path !~ '^/[a-z0-9][a-z0-9/-]*$'
       or current_path like '%//%' or current_path like '%/'
       or current_path ~ '^/(admin|login|api|static|assets|cms)(/|$)'
       or current_path ~ '^/(realestate|construction|hvac)/(admin|cms)(/|$)'
       or current_path = any(visited) then
      return;
    end if;

    select rule.target_path, rule.status_code into destination, step_status
    from public.hard_redirect_rules as rule
    where rule.source_path = current_path;

    if not found then
      if cardinality(visited) > 0 then
        return query select current_path, result_status;
      end if;
      return;
    end if;

    if step_status = 302 then result_status := 302; end if;
    visited := array_append(visited, current_path);
    current_path := destination;
  end loop;
end;
$$;

revoke all on function public.hard_resolve_redirect(text) from public, anon, authenticated;
grant execute on function public.hard_resolve_redirect(text) to anon, authenticated;
