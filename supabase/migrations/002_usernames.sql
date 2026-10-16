
-- HEYBIO ↗ / 002 / One canonical username: public.profiles.username
-- public.usernames is maintained as a read-only mirror by a trusted trigger.
begin;

create table if not exists public.usernames (
  user_id uuid primary key
    references public.profiles(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now(),
  constraint valid_username
    check (username ~ '^[a-z][a-z0-9_]{2,29}$')
);

create table if not exists public.reserved_usernames (
  username text primary key,
  constraint reserved_username_normalized
    check (username = lower(trim(username)))
);

insert into public.reserved_usernames(username) values
  ('admin'), ('administrator'), ('api'), ('app'),
  ('auth'), ('billing'), ('callback'), ('contact'),
  ('dashboard'), ('dipolabs'), ('dipo_labs'),
  ('explore'), ('features'), ('faqs'), ('help'),
  ('heybio'), ('hypedrop'), ('login'), ('logout'),
  ('me'), ('news'), ('onboarding'), ('official'),
  ('pricing'), ('privacy'), ('register'), ('root'),
  ('security'), ('settings'), ('signup'), ('staff'),
  ('support'), ('system'), ('templates'), ('terms'),
  ('www'), ('cookies'), ('refund_policy'),
  ('cancellation_policy'), ('community_guidelines'),
  ('getting_started'), ('report_problem'),
  ('about_heybio'), ('about_dipolabs'), ('our_story'),
  ('whats_new'), ('reset_password'), ('verify_email'),
  ('forgot_password'), ('profile'), ('creator')
on conflict (username) do nothing;

-- Lock usernames already claimed before enforcing the new list.
-- An existing reserved username must be resolved manually, never stolen.
do $$
begin
  if exists (
    select 1 from public.profiles p
    join public.reserved_usernames r on r.username = p.username
  ) then
    raise exception 'Reserved username already in use. Resolve before migration.';
  end if;
end;
$$;

create or replace function public.validate_profile_username()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.username is null then
    return new;
  end if;

  new.username := lower(trim(new.username));

  if new.username !~ '^[a-z][a-z0-9_]{2,29}$' then
    raise exception 'Invalid username' using errcode = '23514';
  end if;

  if exists (
    select 1 from public.reserved_usernames r
    where r.username = new.username
  ) then
    raise exception 'Username is reserved' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_validate_username on public.profiles;
create trigger profiles_validate_username
  before insert or update of username on public.profiles
  for each row execute function public.validate_profile_username();

create or replace function public.sync_profile_username()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.username is null then
    delete from public.usernames where user_id = new.id;
  else
    insert into public.usernames(user_id, username)
    values (new.id, new.username)
    on conflict (user_id) do update
      set username = excluded.username;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_username on public.profiles;
create trigger profiles_sync_username
  after insert or update of username on public.profiles
  for each row execute function public.sync_profile_username();

-- Backfill the mirror from canonical profiles, without user-supplied writes.
insert into public.usernames(user_id, username)
select id, username from public.profiles where username is not null
on conflict (user_id) do update set username = excluded.username;

-- Drop the obsolete direct-write validator, if present from an old install.
drop trigger if exists usernames_validate on public.usernames;
drop function if exists public.validate_username();

alter table public.usernames enable row level security;
alter table public.reserved_usernames enable row level security;
revoke all on public.usernames from public, anon, authenticated;
revoke all on public.reserved_usernames from public, anon, authenticated;

drop policy if exists "Public can resolve usernames" on public.usernames;
drop policy if exists "Owner can read username" on public.usernames;
drop policy if exists "Owner can claim username" on public.usernames;
drop policy if exists usernames_read_own on public.usernames;

create policy usernames_read_own on public.usernames
  for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.usernames to authenticated;

-- Public username resolution is handled by get_public_profile RPC.
-- This table and reserved names are never writable from browser clients.
revoke all on function public.validate_profile_username()
  from public, anon, authenticated;
revoke all on function public.sync_profile_username()
  from public, anon, authenticated;

commit;
