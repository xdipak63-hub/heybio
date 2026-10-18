
-- ============================================================
-- HEYBIO / 032
-- Social links optimistic concurrency foundation
--
-- Safe staged rollout:
-- - Preserves existing social_links rows
-- - Preserves existing save_my_social_links(jsonb)
-- - Introduces a revision-aware replacement RPC
-- - Does NOT activate conflict protection until API
--   and frontend use the new RPC exclusively
-- ============================================================

begin;

create table if not exists
  public.social_links_revisions (
    user_id uuid primary key
      references auth.users(id)
      on delete cascade,

    revision bigint not null default 0
      check (revision >= 0),

    updated_at timestamptz not null
      default now()
  );

alter table public.social_links_revisions
  enable row level security;

-- No direct client-side INSERT/UPDATE/DELETE policies.
-- The versioned RPC handles revisions atomically.

revoke all on
  public.social_links_revisions
from public, anon, authenticated;

grant select on
  public.social_links_revisions
to authenticated;

drop policy if exists
  social_links_revisions_select_own
on public.social_links_revisions;

create policy
  social_links_revisions_select_own
on public.social_links_revisions
for select
to authenticated
using (
  user_id = (select auth.uid())
);

-- Existing creators can start at revision 0.
-- No social links are modified here.

insert into public.social_links_revisions (
  user_id,
  revision
)
select
  p.id,
  0
from public.profiles as p
where p.account_status = 'active'
on conflict (user_id) do nothing;

create or replace function
  public.save_my_social_links_versioned(
    p_links jsonb,
    p_expected_revision bigint
  )
returns bigint
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := (select auth.uid());
  v_current_revision bigint;
  v_new_revision bigint;
  v_item jsonb;
  v_platform text;
  v_url text;
  v_visible boolean;
  v_index integer := 0;
  v_seen text[] := array[]::text[];
begin
  if v_user is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if p_expected_revision is null
    or p_expected_revision < 0
  then
    raise exception 'Invalid revision'
      using errcode = '22023';
  end if;

  if p_links is null
    or jsonb_typeof(p_links) <> 'array'
    or jsonb_array_length(p_links) > 12
  then
    raise exception 'Invalid social links payload'
      using errcode = '22023';
  end if;

  -- Serialize saves using the creator's profile row.
  -- This matches the lock used by migration 025.

  perform 1
  from public.profiles
  where id = v_user
    and account_status = 'active'
  for update;

  if not found then
    raise exception 'Active profile required'
      using errcode = '42501';
  end if;

  -- Initialize revision if this creator was added
  -- after migration 032.

  insert into public.social_links_revisions (
    user_id,
    revision
  )
  values (
    v_user,
    0
  )
  on conflict (user_id) do nothing;

  select revision
    into v_current_revision
  from public.social_links_revisions
  where user_id = v_user
  for update;

  if v_current_revision is distinct from
     p_expected_revision
  then
    raise exception 'SOCIAL_LINKS_CONFLICT'
      using errcode = 'P0001';
  end if;

  -- Validate every link BEFORE replacing anything.

  for v_item in
    select value
    from jsonb_array_elements(p_links)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or jsonb_typeof(v_item -> 'platform') <> 'string'
      or jsonb_typeof(v_item -> 'url') <> 'string'
      or jsonb_typeof(v_item -> 'is_visible') <> 'boolean'
    then
      raise exception 'Invalid social link'
        using errcode = '22023';
    end if;

    v_platform := v_item ->> 'platform';
    v_url := v_item ->> 'url';

    if v_platform not in (
      'instagram',
      'youtube',
      'tiktok',
      'facebook',
      'x',
      'linkedin',
      'github',
      'threads',
      'pinterest',
      'snapchat',
      'twitch',
      'website'
    ) then
      raise exception 'Unsupported platform'
        using errcode = '22023';
    end if;

    if v_platform = any(v_seen) then
      raise exception 'Duplicate platform'
        using errcode = '22023';
    end if;

    if char_length(v_url) not between 10 and 2048
      or v_url !~* '^https://[^[:space:]]+$'
      or v_url ~ '[[:cntrl:]]'
      or v_url ~ '[\\]'
    then
      raise exception 'Invalid HTTPS URL'
        using errcode = '22023';
    end if;

    v_seen := array_append(
      v_seen,
      v_platform
    );
  end loop;

  -- Atomic replacement begins only after
  -- authentication, revision and validation pass.

  delete from public.social_links
  where user_id = v_user;

  for v_item in
    select value
    from jsonb_array_elements(p_links)
  loop
    v_visible :=
      (v_item ->> 'is_visible')::boolean;

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

  update public.social_links_revisions
  set
    revision = revision + 1,
    updated_at = now()
  where user_id = v_user
  returning revision
    into v_new_revision;

  return v_new_revision;
end;
$function$;

revoke all on function
  public.save_my_social_links_versioned(
    jsonb,
    bigint
  )
from public, anon;

grant execute on function
  public.save_my_social_links_versioned(
    jsonb,
    bigint
  )
to authenticated;

commit;
