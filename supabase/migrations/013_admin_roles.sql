begin;

create table if not exists public.admin_roles (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  role text not null default 'super_admin',
  is_active boolean not null default true,

  granted_at timestamptz not null default now(),
  granted_by uuid
    references auth.users(id),

  constraint admin_role_valid check (
    role = 'super_admin'
  )
);

create or replace function
public.validate_admin_role_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_email text;
begin
  select lower(trim(u.email))
  into account_email
  from auth.users u
  where u.id = new.user_id
    and u.email_confirmed_at is not null;

  if account_email is null
     or account_email not in (
       'xdipak63@gmail.com',
       'dipak7rabari@gmail.com'
     )
  then
    raise exception
      'Admin role requires an approved verified identity';
  end if;

  return new;
end;
$$;

create trigger validate_admin_role_identity_trigger
before insert or update
on public.admin_roles
for each row
execute function
public.validate_admin_role_identity();

alter table public.admin_roles
enable row level security;

revoke all on public.admin_roles
from anon, authenticated;

grant select on public.admin_roles
to authenticated;

create policy admin_roles_read_own
on public.admin_roles
for select
to authenticated
using (
  user_id = (select auth.uid())
);

commit;