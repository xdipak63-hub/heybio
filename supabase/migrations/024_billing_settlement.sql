begin;

alter table public.razorpay_event_inbox
  add column if not exists locked_until timestamptz,
  add column if not exists lease_token uuid;

create index if not exists razorpay_inbox_claim_idx
on public.razorpay_event_inbox
(next_attempt_at, received_at)
where status in ('pending', 'failed', 'processing');

create table if not exists public.billing_reconciliation_log (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id),
  razorpay_subscription_id text not null,
  provider_status text not null,
  result text not null check (
    result in ('matched', 'updated', 'rejected', 'failed')
  ),
  details jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now()
);

alter table public.billing_reconciliation_log
enable row level security;

revoke all on public.billing_reconciliation_log
from public, anon, authenticated;

create or replace function public.claim_razorpay_events(
  p_limit integer default 10
)
returns table (
  id uuid,
  lease_token uuid,
  provider_event_id text,
  event_type text,
  payload jsonb,
  attempts integer
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_limit not between 1 and 50 then
    raise exception 'Invalid batch size';
  end if;

  return query
  with selected as (
    select e.id
    from public.razorpay_event_inbox e
    where (
      e.status in ('pending', 'failed')
      and e.next_attempt_at <= now()
    ) or (
      e.status = 'processing'
      and e.locked_until < now()
    )
    order by e.received_at
    for update skip locked
    limit p_limit
  ),
  claimed as (
    update public.razorpay_event_inbox e
    set status = 'processing',
        attempts = e.attempts + 1,
        locked_until = now() + interval '2 minutes',
        lease_token = gen_random_uuid(),
        last_error = null
    from selected s
    where e.id = s.id
    returning
      e.id,
      e.lease_token,
      e.provider_event_id,
      e.event_type,
      e.payload,
      e.attempts
  )
  select
    c.id,
    c.lease_token,
    c.provider_event_id,
    c.event_type,
    c.payload,
    c.attempts
  from claimed c;
end;
$$;

create or replace function public.finish_razorpay_event(
  p_id uuid,
  p_lease_token uuid,
  p_success boolean,
  p_error text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_attempts integer;
begin
  select attempts into v_attempts
  from public.razorpay_event_inbox
  where id = p_id
    and lease_token = p_lease_token
    and status = 'processing'
    and locked_until > now()
  for update;

  if not found then
    return false;
  end if;

  update public.razorpay_event_inbox
  set status = case
        when p_success then 'processed'
        else 'failed'
      end,
      processed_at = case
        when p_success then now()
        else null
      end,
      next_attempt_at = case
        when p_success then next_attempt_at
        else now() + make_interval(
          secs => least(
            3600,
            (power(2, least(v_attempts, 10))::integer * 15)
          )
        )
      end,
      last_error = case
        when p_success then null
        else left(coalesce(p_error, 'Processing failed'), 500)
      end,
      lease_token = null,
      locked_until = null
  where id = p_id;

  return true;
end;
$$;

-- Provider-verified subscription state.
-- This function must only be called by the trusted
-- Worker after fetching the subscription from Razorpay.
create or replace function public.settle_razorpay_subscription(
  p_razorpay_subscription_id text,
  p_razorpay_plan_id text,
  p_provider_status text,
  p_period_start timestamptz,
  p_period_end timestamptz
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_sub public.subscriptions%rowtype;
  v_status text;
begin
  if p_provider_status not in (
    'created', 'authenticated', 'active',
    'pending', 'halted', 'cancelled',
    'completed', 'expired'
  ) then
    raise exception 'Invalid provider status';
  end if;

  select * into v_sub
  from public.subscriptions
  where razorpay_subscription_id =
    p_razorpay_subscription_id
  for update;

  if not found then
    raise exception 'Unknown subscription';
  end if;

  if v_sub.razorpay_plan_id
     is distinct from p_razorpay_plan_id then
    raise exception 'Provider plan mismatch';
  end if;

  if p_provider_status = 'active' and (
    p_period_start is null
    or p_period_end is null
    or p_period_end <= p_period_start
    or p_period_end <= now()
  ) then
    raise exception 'Invalid active billing period';
  end if;

  v_status := p_provider_status;

  -- Prevent duplicate active subscriptions.
  if v_status = 'active' and exists (
    select 1 from public.subscriptions s
    where s.user_id = v_sub.user_id
      and s.id <> v_sub.id
      and s.status = 'active'
  ) then
    raise exception 'Another active subscription exists';
  end if;

  update public.subscriptions
  set status = v_status,
      current_period_start = p_period_start,
      current_period_end = p_period_end,
      cancelled_at = case
        when v_status = 'cancelled'
        then coalesce(cancelled_at, now())
        else cancelled_at
      end,
      ended_at = case
        when v_status in ('cancelled', 'completed', 'expired')
        then coalesce(ended_at, now())
        else ended_at
      end
  where id = v_sub.id;

  insert into public.billing_reconciliation_log (
    subscription_id,
    razorpay_subscription_id,
    provider_status,
    result
  ) values (
    v_sub.id,
    p_razorpay_subscription_id,
    v_status,
    'updated'
  );

  return jsonb_build_object(
    'success', true,
    'subscription_id', v_sub.id,
    'status', v_status
  );
end;
$$;

revoke all on function public.claim_razorpay_events(integer)
from public, anon, authenticated;
revoke all on function public.finish_razorpay_event(
  uuid, uuid, boolean, text
) from public, anon, authenticated;
revoke all on function public.settle_razorpay_subscription(
  text, text, text, timestamptz, timestamptz
) from public, anon, authenticated;

grant execute on function public.claim_razorpay_events(integer)
to service_role;
grant execute on function public.finish_razorpay_event(
  uuid, uuid, boolean, text
) to service_role;
grant execute on function public.settle_razorpay_subscription(
  text, text, text, timestamptz, timestamptz
) to service_role;

commit;