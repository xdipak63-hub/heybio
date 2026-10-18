begin;

-- The API caps a page at 100 links, but a user can talk to PostgREST directly.
-- Enforce the cap in the database so no client path can bypass it.
create or replace function public.enforce_link_limit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  -- Serialise concurrent inserts for the same profile so parallel requests
  -- cannot slip past the limit together.
  perform pg_advisory_xact_lock(hashtextextended('links:' || new.profile_id::text, 0));

  select count(*) into v_count
  from public.links
  where profile_id = new.profile_id;

  if v_count >= 100 then
    raise exception 'LINK_LIMIT_REACHED: maximum 100 links per profile'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_link_limit() from public, anon, authenticated;

drop trigger if exists enforce_links_limit on public.links;
create trigger enforce_links_limit
before insert on public.links
for each row execute function public.enforce_link_limit();

commit;
