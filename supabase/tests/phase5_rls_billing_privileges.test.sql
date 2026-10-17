-- HEYBIO Phase 5: non-destructive RLS / privilege regression checks.
-- Run on disposable or staging database AFTER migrations 001-031.
-- These checks inspect catalog metadata; they do not impersonate users.
begin;
do $$
declare
  tbl text;
begin
  foreach tbl in array array['admin_roles','payments','subscriptions','entitlements','billing_change_preferences','analytics_events'] loop
    if to_regclass(format('public.%I',tbl)) is null then
      raise exception 'Required table missing: %',tbl;
    end if;
    if not (select c.relrowsecurity from pg_class c where c.oid=to_regclass(format('public.%I',tbl))) then
      raise exception 'RLS disabled: %',tbl;
    end if;
  end loop;
  if has_table_privilege('anon','public.billing_change_preferences','SELECT')
     or has_table_privilege('anon','public.billing_change_preferences','INSERT')
     or has_table_privilege('anon','public.billing_change_preferences','UPDATE')
     or has_table_privilege('anon','public.billing_change_preferences','DELETE') then
    raise exception 'Anonymous role can access billing preferences';
  end if;
  if has_table_privilege('authenticated','public.billing_change_preferences','INSERT')
     or has_table_privilege('authenticated','public.billing_change_preferences','UPDATE')
     or has_table_privilege('authenticated','public.billing_change_preferences','DELETE') then
    raise exception 'Client role can mutate billing preferences';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='billing_change_preferences' and policyname='billing_change_preferences_read_own' and cmd='SELECT') then
    raise exception 'Owner-only billing preference policy missing';
  end if;
  if has_table_privilege('authenticated','public.entitlements','INSERT')
     or has_table_privilege('authenticated','public.payments','UPDATE')
     or has_table_privilege('authenticated','public.subscriptions','UPDATE') then
    raise exception 'Client has privileged billing write permission';
  end if;
  if has_function_privilege('anon','public.purge_expired_analytics_events(integer)','EXECUTE')
     or has_function_privilege('authenticated','public.purge_expired_analytics_events(integer)','EXECUTE') then
    raise exception 'Analytics purge callable by public role';
  end if;
  raise notice 'PASS: RLS and billing privilege structural checks';
end $$;
rollback;
