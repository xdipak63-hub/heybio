begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key
    references auth.users(id) on delete cascade,

  username text unique,
  display_name text not null default '',
  bio text not null default '',
  avatar_path text,
  account_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_username_format check (
    username is null or
    (
      username ~ '^[a-z][a-z0-9_]{2,29}$'
      and username not in (
        'admin', 'administrator', 'api',
        'auth', 'billing', 'dashboard',
        'dipolabs', 'heybio', 'help',
        'hypedrop', 'login', 'logout',
        'me', 'pricing', 'privacy',
        'root', 'settings', 'signup',
        'support', 'system', 'www'
      )
    )
  ),

  constraint profiles_display_name_length
    check (char_length(display_name) <= 80),

  constraint profiles_bio_length
    check (char_length(bio) <= 500),

  constraint profiles_account_status_valid
    check (
      account_status in (
        'active',
        'suspended',
        'deleted'
      )
    )
);

create index if not exists profiles_status_idx
  on public.profiles(account_status);

create index if not exists profiles_created_at_idx
  on public.profiles(created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name
  )
  values (
    new.id,
    left(
      coalesce(
        new.raw_user_meta_data ->> 'display_name',
        ''
      ),
      80
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created
  on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at
  on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure
  public.set_profile_updated_at();

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.account_status is distinct from old.account_status
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Protected profile fields cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profiles_columns
  on public.profiles;

create trigger protect_profiles_columns
before update on public.profiles
for each row execute procedure
  public.protect_profile_columns();

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;

grant select, insert on table public.profiles
  to authenticated;

grant update (
  username,
  display_name,
  bio,
  avatar_path
) on table public.profiles
  to authenticated;

drop policy if exists profiles_select_own
  on public.profiles;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
);

drop policy if exists profiles_insert_own
  on public.profiles;

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
  and account_status = 'active'
);

drop policy if exists profiles_update_own
  on public.profiles;

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
  and account_status = 'active'
)
with check (
  (select auth.uid()) = id
  and account_status = 'active'
);

commit;