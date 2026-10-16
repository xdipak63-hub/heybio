
-- HEYBIO ↗ / 005 / Private image metadata and bucket registration.
-- Storage object policies are installed by 018_storage_policies.sql.
begin;

create table if not exists public.profile_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  media_type text not null,
  mime_type text not null,
  byte_size bigint not null,
  alt_text text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now(),

  constraint unique_media_path unique (storage_path),
  constraint media_type_valid check (media_type in ('avatar', 'gallery')),
  constraint mime_type_valid check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint byte_size_valid check (byte_size between 1 and 2097152),
  constraint media_alt_length check (char_length(alt_text) <= 200),
  constraint media_path_owner check (
    length(storage_path) <= 512
    and storage_path like user_id::text || '/%'
    and storage_path !~ '[[:cntrl:]]'
  ),
  constraint media_position_valid check (position >= 0)
);

create unique index if not exists one_avatar_per_user
  on public.profile_media(user_id) where media_type = 'avatar';
create index if not exists profile_media_owner_idx
  on public.profile_media(user_id, position);

alter table public.profile_media enable row level security;
revoke all on public.profile_media from public, anon, authenticated;
grant select, insert, delete on public.profile_media to authenticated;

drop policy if exists "Published media metadata is public" on public.profile_media;
drop policy if exists "Owner reads media metadata" on public.profile_media;
drop policy if exists "Owner adds media metadata" on public.profile_media;
drop policy if exists "Owner deletes media metadata" on public.profile_media;

drop policy if exists profile_media_read_own on public.profile_media;
create policy profile_media_read_own on public.profile_media
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists profile_media_insert_own on public.profile_media;
create policy profile_media_insert_own on public.profile_media
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.account_status = 'active'
    )
  );

drop policy if exists profile_media_delete_own on public.profile_media;
create policy profile_media_delete_own on public.profile_media
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.account_status = 'active'
    )
  );

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) values (
  'heybio-media', 'heybio-media', false, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

commit;
