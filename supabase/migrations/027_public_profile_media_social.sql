
-- HEYBIO ↗
-- 027 Public profile media and social links
-- By DIPO LABS
--
-- Does not make private tables or
-- the Storage bucket publicly readable.
--
-- Exposes only:
-- - public profile fields
-- - enabled creator links
-- - visible social accounts
-- - an avatar availability boolean

begin;

create or replace function public.get_public_profile(
  p_username text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile record;
  v_theme record;
  v_links jsonb;
  v_social jsonb;

begin
  if p_username is null
    or length(p_username) > 30
    or p_username !~ '^[a-z][a-z0-9_]{2,29}$'
  then
    return null;
  end if;

  select
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.avatar_path
  into v_profile
  from public.profiles p
  where p.username = lower(p_username)
    and p.account_status = 'active'
  limit 1;

  if not found then
    return null;
  end if;

  select
    t.preset,
    t.accent,
    t.button_style
  into v_theme
  from public.profile_themes t
  where t.profile_id = v_profile.id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', l.id,
        'title', l.title,
        'url', l.url,
        'description', l.description
      )
      order by
        l.position,
        l.created_at,
        l.id
    ),
    '[]'::jsonb
  )
  into v_links
  from public.links l
  where l.profile_id = v_profile.id
    and l.is_active = true;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'platform', s.platform,
        'url', s.url
      )
      order by
        s.position,
        s.created_at,
        s.id
    ),
    '[]'::jsonb
  )
  into v_social
  from public.social_links s
  where s.user_id = v_profile.id
    and s.is_visible = true;

  return jsonb_build_object(
    'username', v_profile.username,
    'displayName', v_profile.display_name,
    'bio', v_profile.bio,

    -- Do not expose the private storage path.
    'hasAvatar',
      (v_profile.avatar_path is not null),

    'theme', jsonb_build_object(
      'preset',
        coalesce(v_theme.preset, 'classic'),

      'accent',
        coalesce(v_theme.accent, '#BDF806'),

      'buttonStyle',
        coalesce(
          v_theme.button_style,
          'rounded'
        )
    ),

    'links', v_links,
    'socialLinks', v_social
  );
end;
$$;

revoke all
on function public.get_public_profile(text)
from public, anon, authenticated;

grant execute
on function public.get_public_profile(text)
to anon, authenticated;

commit;