
begin;

create table if not exists public.profile_themes (
  profile_id uuid primary key
    references public.profiles(id) on delete cascade,
  preset text not null default 'classic',
  accent text not null default '#BDF806',
  button_style text not null default 'rounded',
  updated_at timestamptz not null default now(),

  constraint valid_theme_preset check (
    preset in (
      'classic',
      'midnight',
      'ice',
      'peach',
      'lavender',
      'minimal'
    )
  ),

  constraint valid_theme_accent check (
    accent in (
      '#BDF806',
      '#C8E6FF',
      '#FFBFAE',
      '#D9C4FF',
      '#FFFFFF',
      '#FFDF70'
    )
  ),

  constraint valid_button_style check (
    button_style in (
      'rounded',
      'pill',
      'square'
    )
  )
);

alter table public.profile_themes
  enable row level security;

revoke all on public.profile_themes
  from anon, authenticated;

grant select, insert on public.profile_themes
  to authenticated;

grant update (
  preset,
  accent,
  button_style
) on public.profile_themes
  to authenticated;

create policy themes_select_owner
on public.profile_themes
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy themes_insert_owner
on public.profile_themes
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
  )
);

create policy themes_update_owner
on public.profile_themes
for update
to authenticated
using (
  profile_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
  )
)
with check (
  profile_id = (select auth.uid())
);

-- Only intentionally public fields are returned.
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
begin
  select
    p.id,
    p.username,
    p.display_name,
    p.bio
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
      order by l.position, l.created_at, l.id
    ),
    '[]'::jsonb
  )
  into v_links
  from public.links l
  where l.profile_id = v_profile.id
    and l.is_active = true;

  return jsonb_build_object(
    'username', v_profile.username,
    'displayName', v_profile.display_name,
    'bio', v_profile.bio,
    'theme', jsonb_build_object(
      'preset', coalesce(v_theme.preset, 'classic'),
      'accent', coalesce(v_theme.accent, '#BDF806'),
      'buttonStyle', coalesce(v_theme.button_style, 'rounded')
    ),
    'links', v_links
  );
end;
$$;

revoke all on function public.get_public_profile(text)
  from public;

grant execute on function public.get_public_profile(text)
  to anon, authenticated;

commit;