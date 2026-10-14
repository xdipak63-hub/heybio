
-- HEYBIO / 025 / Atomic creator social links
begin;

create or replace function public.save_my_social_links(
  p_links jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_item jsonb;
  v_platform text;
  v_url text;
  v_visible boolean;
  v_index integer := 0;
  v_seen text[] := array[]::text[];
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  if p_links is null
    or jsonb_typeof(p_links) <> 'array'
    or jsonb_array_length(p_links) > 12
  then
    raise exception 'Invalid social links payload';
  end if;

  -- Serialize concurrent saves for this creator.
  perform 1
  from public.profiles
  where id = v_user
    and account_status = 'active'
  for update;

  if not found then
    raise exception 'Active profile required';
  end if;

  -- Validate the entire payload before deletion.
  for v_item in
    select value
    from jsonb_array_elements(p_links)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or jsonb_typeof(v_item -> 'platform') <> 'string'
      or jsonb_typeof(v_item -> 'url') <> 'string'
      or (
        v_item ? 'is_visible'
        and jsonb_typeof(v_item -> 'is_visible') <> 'boolean'
      )
    then
      raise exception 'Invalid social link';
    end if;

    v_platform := v_item ->> 'platform';
    v_url := v_item ->> 'url';

    if v_platform not in (
      'instagram', 'youtube', 'tiktok',
      'facebook', 'x', 'linkedin',
      'github', 'threads', 'pinterest',
      'snapchat', 'twitch', 'website'
    ) then
      raise exception 'Unsupported platform';
    end if;

    if v_platform = any(v_seen) then
      raise exception 'Duplicate platform';
    end if;

    if char_length(v_url) not between 10 and 2048
      or v_url !~* '^https://[^[:space:]]+$'
    then
      raise exception 'Invalid HTTPS URL';
    end if;

    v_seen := array_append(v_seen, v_platform);
  end loop;

  delete from public.social_links
  where user_id = v_user;

  for v_item in
    select value
    from jsonb_array_elements(p_links)
  loop
    v_visible := coalesce(
      (v_item ->> 'is_visible')::boolean,
      true
    );

    insert into public.social_links (
      user_id,
      platform,
      url,
      position,
      is_visible
    )
    values (
      v_user,
      v_item ->> 'platform',
      v_item ->> 'url',
      v_index,
      v_visible
    );

    v_index := v_index + 1;
  end loop;
end;
$$;

revoke all on function
  public.save_my_social_links(jsonb)
from public, anon;

grant execute on function
  public.save_my_social_links(jsonb)
to authenticated;

commit;
