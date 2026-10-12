-- HEYBIO / 004 / Social links

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id) on delete cascade,
  platform text not null,
  url text not null,
  position integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),

  constraint social_platform_valid check (
    platform in (
      'instagram', 'youtube', 'tiktok', 'facebook',
      'x', 'linkedin', 'github', 'threads',
      'pinterest', 'snapchat', 'twitch', 'website'
    )
  ),
  constraint social_url_valid check (
    char_length(url) between 10 and 2048
    and url ~* '^https://[^[:space:]]+$'
  ),
  constraint social_position_valid check (position >= 0),
  constraint unique_social_platform unique(user_id, platform)
);

create index if not exists social_links_owner_idx
on public.social_links(user_id, position);

alter table public.social_links enable row level security;

create policy "Public can see visible social links"
on public.social_links
for select to anon, authenticated
using (
  is_visible = true
  and exists (
    select 1 from public.profiles p
    where p.id = user_id
      and p.is_published = true
      and p.is_suspended = false
  )
);

create policy "Owner reads social links"
on public.social_links
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Owner adds social links"
on public.social_links
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.profiles p
    where p.id = user_id and p.is_suspended = false
  )
);

create policy "Owner edits social links"
on public.social_links
for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.profiles p
    where p.id = user_id and p.is_suspended = false
  )
);

create policy "Owner removes social links"
on public.social_links
for delete to authenticated
using ((select auth.uid()) = user_id);