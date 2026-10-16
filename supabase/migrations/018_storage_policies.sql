
-- HEYBIO ↗ / 018 / Private, owner-scoped Supabase Storage policies.
-- Authenticated creators can read their files; only active ones can write.
begin;

-- Never convert this private bucket into a public image CDN.
update storage.buckets
set public = false,
    file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'heybio-media';

do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'heybio-media'
  ) then
    raise exception 'Missing heybio-media bucket from 005_media.sql';
  end if;
end;
$$;

-- Clean up older policies if 005 was already used in a dev project.
drop policy if exists "Owner uploads private media" on storage.objects;
drop policy if exists "Owner reads private media" on storage.objects;
drop policy if exists "Owner deletes private media" on storage.objects;

drop policy if exists heybio_objects_insert_own on storage.objects;
create policy heybio_objects_insert_own
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'heybio-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
  )
);

drop policy if exists heybio_objects_select_own on storage.objects;
create policy heybio_objects_select_own
on storage.objects
for select to authenticated
using (
  bucket_id = 'heybio-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists heybio_objects_delete_own on storage.objects;
create policy heybio_objects_delete_own
on storage.objects
for delete to authenticated
using (
  bucket_id = 'heybio-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
  )
);

-- No direct UPDATE policy: avatar files are immutable UUID-named objects.
-- Signing a private URL still requires SELECT authorization.
commit;
