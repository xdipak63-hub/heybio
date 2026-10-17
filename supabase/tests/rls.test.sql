
-- HEYBIO ↗
-- ROW LEVEL SECURITY TEST
-- A product of DIPO LABS
--
-- Structural checks only.
-- Run on local/staging database after
-- all project migrations.
--
-- Real authenticated-user isolation
-- must also be tested separately.

begin;

do $$
declare
  table_name text;

  protected_tables text[] := array[
    'profiles',
    'links',
    'social_links',
    'profile_themes',
    'subscriptions',
    'payments',
    'entitlements',
    'analytics_events',
    'admin_roles',
    'admin_audit_logs',
    'support_tickets',
    'webhook_events'
  ];

begin

  -- Every protected table must exist
  -- and have row-level security enabled.
  foreach table_name
  in array protected_tables
  loop

    if to_regclass(
      format(
        'public.%I',
        table_name
      )
    ) is null then

      raise exception
        'Missing expected table: %',
        table_name;

    end if;

    if not exists (
      select 1
      from pg_class c

      join pg_namespace n
        on n.oid = c.relnamespace

      where n.nspname = 'public'
        and c.relname = table_name
        and c.relrowsecurity = true
    ) then

      raise exception
        'Missing RLS on public.%',
        table_name;

    end if;

  end loop;

  -- Anonymous users cannot directly
  -- read private creator/billing tables.
  if
    has_table_privilege(
      'anon',
      'public.links',
      'SELECT'
    )
    or
    has_table_privilege(
      'anon',
      'public.social_links',
      'SELECT'
    )
    or
    has_table_privilege(
      'anon',
      'public.subscriptions',
      'SELECT'
    )
    or
    has_table_privilege(
      'anon',
      'public.entitlements',
      'SELECT'
    )
  then

    raise exception
      'Raw private creator or billing tables exposed to anon';

  end if;

  -- A creator must never have arbitrary
  -- payment or entitlement write access.
  if
    has_table_privilege(
      'authenticated',
      'public.payments',
      'UPDATE'
    )
    or
    has_table_privilege(
      'authenticated',
      'public.entitlements',
      'INSERT'
    )
    or
    has_table_privilege(
      'authenticated',
      'public.subscriptions',
      'UPDATE'
    )
  then

    raise exception
      'Authenticated users have payment/entitlement write access';

  end if;

  -- Link ownership policy must exist.
  if not exists (
    select 1
    from pg_policies

    where schemaname = 'public'
      and tablename = 'links'
      and policyname = 'links_select_owner'
  ) then

    raise exception
      'Missing owner-only links SELECT policy';

  end if;

  -- Entitlement ownership policy
  -- must exist.
  if not exists (
    select 1
    from pg_policies

    where schemaname = 'public'
      and tablename = 'entitlements'
      and policyname = 'entitlements_read_own'
  ) then

    raise exception
      'Missing owner-only entitlements SELECT policy';

  end if;

  raise notice
    'PASS: protected table RLS, baseline grants and owner policies';

end;
$$;

rollback;