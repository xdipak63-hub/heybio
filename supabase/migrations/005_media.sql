-- HEYBIO / 005 / Media metadata
-- Storage objects use a private bucket.
-- Signed URLs are generated only after access checks.

create table if not exists public.profile_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles(id) on delete cascade,
  storage_path text not null,
  media_type text not null,
  mime_type text not null,
  byte_size bigint not null,
  alt_text text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now(),

  constraint unique_media_path unique(storage_path),
  constraint media_type_valid check (
    media_type in ('avatar', 'gallery')
  ),
  constraint mime_type_valid check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp')
  ),
  constraint byte_size_valid check (
    byte_size between 1 and 5242880
  ),
  constraint media_alt_length check (
    char_length(alt_text) <= 200
  ),
  constraint media_path_owner check (
    storage_path like user_id::text || '/%'
  )
);

create unique index if not exists one_avatar_per_user
on public.profile_media(user_id)
where media_type = 'avatar';

create index if not exists profile_media_owner_idx
on public.profile_media(user_id, position);

alter table public.profile_media enable row level security;

create policy "Published media metadata is public"
on public.profile_media
for select to anon, authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = user_id
      and p.is_published = true
      and p.is_suspended = false
  )
);

create policy "Owner reads media metadata"
on public.profile_media
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Owner adds media metadata"
on public.profile_media
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.profiles p
    where p.id = user_id and p.is_suspended = false
  )
);

create policy "Owner deletes media metadata"
on public.profile_media
for delete to authenticated
using ((select auth.uid()) = user_id);

-- Private Storage bucket
insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'heybio-media',
  'heybio-media',
  false,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;

-- Users can only upload inside their own UUID prefix.
create policy "Owner uploads private media"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'heybio-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.is_suspended = false
  )
);

create policy "Owner reads private media"
on storage.objects
for select to authenticated
using (
  bucket_id = 'heybio-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Owner deletes private media"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'heybio-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);