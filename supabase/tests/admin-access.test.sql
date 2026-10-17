
-- HEYBIO ↗
-- ADMIN ACCESS SECURITY TEST
-- A product of DIPO LABS
--
-- Run against a disposable/staging
-- database after all migrations.
--
-- Does not create/modify admin roles.

begin;

do $$
declare
  owner_policy_exists boolean;
  identity_trigger_exists boolean;
begin

  -- Administrator records MUST have RLS.
  if not (
    select relrowsecurity
    from pg_class
    where oid = 'public.admin_roles'::regclass
  ) then

    raise exception
      'admin_roles must have row-level security enabled';

  end if;

  -- Normal authenticated users cannot
  -- assign, update or delete admin roles.
  if
    has_table_privilege(
      'authenticated',
      'public.admin_roles',
      'INSERT'
    )
    or
    has_table_privilege(
      'authenticated',
      'public.admin_roles',
      'UPDATE'
    )
    or
    has_table_privilege(
      'authenticated',
      'public.admin_roles',
      'DELETE'
    )
  then

    raise exception
      'authenticated users must not modify admin roles';

  end if;

  -- Anonymous visitors must not read
  -- administrator role information.
  if has_table_privilege(
    'anon',
    'public.admin_roles',
    'SELECT'
  ) then

    raise exception
      'anonymous users must not read admin roles';

  end if;

  -- Verify owner-scoped role policy.
  select exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_roles'
      and policyname = 'admin_roles_read_own'
      and cmd = 'SELECT'
  )
  into owner_policy_exists;

  if not owner_policy_exists then

    raise exception
      'Missing owner-scoped admin role SELECT policy';

  end if;

  -- Verify trusted identity validation
  -- is attached to the admin_roles table.
  select exists (
    select 1
    from pg_trigger
    where tgrelid =
      'public.admin_roles'::regclass
      and tgname =
        'validate_admin_role_identity_trigger'
      and not tgisinternal
  )
  into identity_trigger_exists;

  if not identity_trigger_exists then

    raise exception
      'Missing verified-admin identity trigger';

  end if;

  -- Users must not call the privileged
  -- role identity function directly.
  if has_function_privilege(
    'authenticated',
    'public.validate_admin_role_identity()',
    'EXECUTE'
  ) then

    raise exception
      'Authenticated callers must not execute role validation function';

  end if;

  raise notice
    'PASS: admin role RLS, grants, owner policy and validation trigger';

end;
$$;

rollback;