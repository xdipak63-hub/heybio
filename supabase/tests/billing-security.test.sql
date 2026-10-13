begin;

-- ==================================================
-- HEYBIO BILLING SECURITY REGRESSION TESTS
-- Requires migrations 007-023.
-- Run in isolated development/test database.
-- ==================================================

do $$
declare
  v_count integer;
begin
  -- Required billing tables exist.
  select count(*)
  into v_count
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (
      'plans',
      'subscriptions',
      'payments',
      'razorpay_event_inbox'
    );

  if v_count <> 4 then
    raise exception
      'Required billing tables missing';
  end if;

  -- RLS must be enabled.
  select count(*)
  into v_count
  from pg_class c
  join pg_namespace n
    on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'subscriptions',
      'payments',
      'razorpay_event_inbox'
    )
    and c.relrowsecurity = true;

  if v_count <> 3 then
    raise exception
      'Billing RLS not enabled';
  end if;

  -- Anonymous and authenticated users
  -- must not insert payment records.
  if has_table_privilege(
    'anon',
    'public.payments',
    'INSERT'
  ) then
    raise exception
      'Anon can insert payments';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.payments',
    'INSERT'
  ) then
    raise exception
      'Authenticated users can insert payments';
  end if;

  -- Browser roles cannot write webhook inbox.
  if has_table_privilege(
    'anon',
    'public.razorpay_event_inbox',
    'INSERT'
  ) then
    raise exception
      'Anon can insert webhook events';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.razorpay_event_inbox',
    'INSERT'
  ) then
    raise exception
      'Authenticated users can insert webhook events';
  end if;

  -- Protected webhook RPC cannot be
  -- executed by browser roles.
  if has_function_privilege(
    'authenticated',
    'public.enqueue_razorpay_event(text,text,jsonb)',
    'EXECUTE'
  ) then
    raise exception
      'Authenticated user can enqueue webhook';
  end if;

  if has_function_privilege(
    'anon',
    'public.enqueue_razorpay_event(text,text,jsonb)',
    'EXECUTE'
  ) then
    raise exception
      'Anonymous user can enqueue webhook';
  end if;

  -- Prices are stored in paise.
  if (
    select price_paise
    from public.plans
    where id = 'premium'
  ) <> 24900 then
    raise exception
      'Premium plan price mismatch';
  end if;

  raise notice
    'HEYBIO billing security checks passed';
end;
$$;

rollback;