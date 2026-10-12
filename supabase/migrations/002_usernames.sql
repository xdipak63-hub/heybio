-- HEYBIO / 002 / Usernames

create table if not exists public.usernames (
  user_id uuid primary key
    references public.profiles(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now(),

  constraint valid_username check (
    username ~ '^[a-z][a-z0-9_]{2,24}$'
  )
);

create table if not exists public.reserved_usernames (
  username text primary key
);

insert into public.reserved_usernames (username)
values
  ('admin'), ('administrator'), ('api'), ('app'),
  ('auth'), ('billing'), ('dashboard'), ('help'),
  ('heybio'), ('dipolabs'), ('dipo_labs'),
  ('login'), ('logout'), ('signup'), ('register'),
  ('pricing'), ('explore'), ('support'), ('security'),
  ('settings'), ('terms'), ('privacy'), ('www'),
  ('root'), ('system'), ('official'), ('staff')
on conflict do nothing;

create or replace function public.validate_username()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.username := lower(trim(new.username));

  if exists (
    select 1 from public.reserved_usernames
    where username = new.username
  ) then
    raise exception 'Username is reserved';
  end if;

  return new;
end;
$$;

create trigger usernames_validate
before insert or update on public.usernames
for each row execute function public.validate_username();

alter table public.usernames enable row level security;
alter table public.reserved_usernames enable row level security;

create policy "Public can resolve usernames"
on public.usernames
for select to anon, authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = user_id
      and p.is_published = true
      and p.is_suspended = false
  )
);

create policy "Owner can read username"
on public.usernames
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Owner can claim username"
on public.usernames
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and not exists (
    select 1 from public.profiles p
    where p.id = user_id and p.is_suspended = true
  )
);

-- Username changes and releases will be handled
-- through controlled functions in a future batch.
revoke update, delete on public.usernames
from anon, authenticated;