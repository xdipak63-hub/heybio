-- HEYBIO: bounded retention for privacy-preserving analytics.
-- Apply only after migrations 001-030 have been applied.
begin;

create index if not exists analytics_events_retention_idx
  on public.analytics_events (occurred_at);

create or replace function public.purge_expired_analytics_events(
  p_batch_size integer default 5000
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'Not authorized';
  end if;
  if p_batch_size < 1 or p_batch_size > 10000 then
    raise exception 'Invalid batch size';
  end if;
  with expired as (
    select id from public.analytics_events
    where occurred_at < now() - interval '90 days'
    order by occurred_at, id
    limit p_batch_size
  )
  delete from public.analytics_events a
  using expired e
  where a.id = e.id;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.purge_expired_analytics_events(integer)
  from public, anon, authenticated;
grant execute on function public.purge_expired_analytics_events(integer)
  to service_role;
commit;
