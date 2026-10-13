begin;

do $$
declare
  v_count integer;
  v_has_grant boolean;
begin
  -- Required settlement tables.
  select count(*)
  into v_count
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (
      'razorpay_event_inbox',
      'billing_reconciliation_log',
      'subscriptions'
    );

  if v_count <> 3 then
    raise exception
      'Required settlement tables are missing';
  end if;

  -- RLS on reconciliation log.
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'billing_reconciliation_log'
      and c.relrowsecurity
  ) then
    raise exception
      'Reconciliation log RLS missing';
  end if;

  -- Browser users cannot settle subscriptions.
  if has_function_privilege(
    'authenticated',
    'public.settle_razorpay_subscription(text,text,text,timestamptz,timestamptz)',
    'EXECUTE'
  ) then
    raise exception
      'Authenticated role can settle subscriptions';
  end if;

  if has_function_privilege(
    'anon',
    'public.settle_razorpay_subscription(text,text,text,timestamptz,timestamptz)',
    'EXECUTE'
  ) then
    raise exception
      'Anonymous role can settle subscriptions';
  end if;

  -- Service role can run settlement.
  select has_function_privilege(
    'service_role',
    'public.settle_razorpay_subscription(text,text,text,timestamptz,timestamptz)',
    'EXECUTE'
  )
  into v_has_grant;

  if not v_has_grant then
    raise exception
      'Service role settlement permission missing';
  end if;

  -- Browser users cannot claim billing jobs.
  if has_function_privilege(
    'authenticated',
    'public.claim_razorpay_events(integer)',
    'EXECUTE'
  ) then
    raise exception
      'Authenticated role can claim billing jobs';
  end if;

  if has_function_privilege(
    'anon',
    'public.finish_razorpay_event(uuid,uuid,boolean,text)',
    'EXECUTE'
  ) then
    raise exception
      'Anonymous role can finalize billing jobs';
  end if;

  -- Required lease fields exist.
  select count(*)
  into v_count
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'razorpay_event_inbox'
    and column_name in (
      'lease_token',
      'locked_until'
    );

  if v_count <> 2 then
    raise exception
      'Billing lease columns missing';
  end if;

  -- Invalid batch size must be rejected.
  begin
    perform public.claim_razorpay_events(0);
    raise exception
      'Invalid batch size was accepted';
  exception
    when others then
      if SQLERRM =
        'Invalid batch size was accepted'
      then
        raise;
      end if;
  end;

  raise notice
    'HEYBIO settlement schema checks passed';
end;
$$;

rollback;