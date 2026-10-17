begin;
-- Cap direct Supabase client uploads as well as the HEYBIO application route.
-- SECURITY DEFINER is required to count storage rows without recursive RLS.
create or replace function public.heybio_storage_has_room()
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and (
    select count(*) from storage.objects o
    where o.bucket_id = 'heybio-media'
      and starts_with(o.name, (select auth.uid())::text || '/')
  ) < 30;
$$;
revoke all on function public.heybio_storage_has_room() from public, anon;
grant execute on function public.heybio_storage_has_room() to authenticated;
drop policy if exists heybio_objects_insert_own on storage.objects;
create policy heybio_objects_insert_own on storage.objects
for insert to authenticated with check (
  bucket_id = 'heybio-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.heybio_storage_has_room()
  and exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
    and p.account_status = 'active'
  )
);
commit;
