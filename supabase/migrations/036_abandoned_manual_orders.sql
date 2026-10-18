begin;

-- A user who opens checkout and walks away keeps the single "open order" slot.
-- Close orders that were never paid so they can start a new checkout.
create or replace function public.expire_stale_manual_orders(
  p_older_than interval default interval '72 hours'
) returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_older_than < interval '1 hour' then
    raise exception 'Expiry window too short';
  end if;
  update public.manual_payment_orders
  set status = 'abandoned'
  where status = 'created' and created_at < now() - p_older_than;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.expire_stale_manual_orders(interval) from public, anon, authenticated;
grant execute on function public.expire_stale_manual_orders(interval) to service_role;

commit;
