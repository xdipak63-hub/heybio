begin;

create or replace function
public.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Identity and creation time are immutable
  -- for all application-level updates.
  if new.id is distinct from old.id
     or new.created_at is distinct from old.created_at
  then
    raise exception
      'Immutable profile fields cannot be changed';
  end if;

  -- Account status is a privileged field.
  if new.account_status
     is distinct from old.account_status
  then
    if auth.role() is distinct from 'service_role' then
      raise exception
        'Only trusted backend may change account status';
    end if;

    if new.account_status not in (
      'active',
      'suspended',
      'deleted'
    ) then
      raise exception
        'Invalid account status';
    end if;
  end if;

  return new;
end;
$$;

-- Keep the existing protect_profiles_columns
-- trigger installed by 001_profiles.sql.

revoke all on function
public.protect_profile_columns()
from public, anon, authenticated;

commit;