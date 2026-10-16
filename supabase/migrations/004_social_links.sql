
-- HEYBIO ↗ / 004 / Creator social links with strict owner-only RLS.
-- Public delivery will use an explicitly reviewed RPC, not broad SELECT.
begin;

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  url text not null,
  position integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),

  constraint social_platform_valid check (
    platform in (
      'instagram', 'youtube', 'tiktok', 'facebook', 'x',
      'linkedin', 'github', 'threads', 'pinterest',
      'snapchat', 'twitch', 'website'
    )
  ),
  constraint social_url_valid check (
    char_length(url) between 10 and 2048
    and url ~* '^https://[^[:space:]]+$'
  ),
  constraint social_position_valid check (position >= 0),
  constraint unique_social_platform unique (user_id, platform)
);

create index if not exists social_links_owner_idx
  on public.social_links(user_id, position);

alter table public.social_links enable row level security;
revoke all on public.social_links from public, anon, authenticated;
grant select, insert, delete on public.social_links to authenticated;
grant update (platform, url, position, is_visible)
  on public.social_links to authenticated;

-- Remove incompatible legacy policies, including undefined is_suspended.
drop policy if exists "Public can see visible social links" on public.social_links;
drop policy if exists "Owner reads social links" on public.social_links;
drop policy if exists "Owner adds social links" on public.social_links;
drop policy if exists "Owner edits social links" on public.social_links;
drop policy if exists "Owner removes social links" on public.social_links;

drop policy if exists social_links_owner_select on public.social_links;
create policy social_links_owner_select on public.social_links
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists social_links_owner_insert on public.social_links;
create policy social_links_owner_insert on public.social_links
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.account_status = 'active'
    )
  );

drop policy if exists social_links_owner_update on public.social_links;
create policy social_links_owner_update on public.social_links
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.account_status = 'active'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.account_status = 'active'
    )
  );

drop policy if exists social_links_owner_delete on public.social_links;
create policy social_links_owner_delete on public.social_links
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.account_status = 'active'
    )
  );

commit;
