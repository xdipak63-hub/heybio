begin;

-- Applies a refund that was read from Razorpay itself (never from webhook JSON).
-- Partial refunds are recorded and access is kept; a full refund revokes the
-- access that the refunded payment paid for.
create or replace function public.apply_verified_refund(
  p_payment_id text,
  p_amount_refunded_paise bigint,
  p_provider_status text
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_full boolean;
begin
  if p_payment_id !~ '^pay_[A-Za-z0-9]+$'
     or p_amount_refunded_paise is null or p_amount_refunded_paise < 0
     or p_provider_status not in ('captured','refunded') then
    raise exception 'Invalid provider refund';
  end if;

  select * into v_payment from public.payments
  where razorpay_payment_id = p_payment_id for update;
  if not found then
    return jsonb_build_object('applied', false, 'reason', 'unknown_payment');
  end if;
  if p_amount_refunded_paise > v_payment.amount_paise then
    raise exception 'Refund exceeds payment amount';
  end if;
  -- Refund totals only move forward; replayed or out-of-order events are no-ops.
  if p_amount_refunded_paise <= v_payment.amount_refunded_paise then
    return jsonb_build_object('applied', false, 'reason', 'already_recorded');
  end if;

  v_full := p_amount_refunded_paise = v_payment.amount_paise;

  update public.payments
  set amount_refunded_paise = p_amount_refunded_paise,
      status = case when v_full then 'refunded' else status end
  where id = v_payment.id;

  if v_full and v_payment.subscription_id is not null then
    update public.entitlements set revoked_at = coalesce(revoked_at, now())
    where subscription_id = v_payment.subscription_id;

    -- One-time (manual) subscriptions end immediately. Recurring ones keep the
    -- provider-owned state; the customer or admin cancels them at Razorpay.
    update public.subscriptions
    set status = 'expired', ended_at = coalesce(ended_at, now())
    where id = v_payment.subscription_id
      and razorpay_subscription_id is null
      and status in ('active','cancelled');
  end if;

  return jsonb_build_object('applied', true, 'full', v_full);
end;
$$;

revoke all on function public.apply_verified_refund(text,bigint,text) from public, anon, authenticated;
grant execute on function public.apply_verified_refund(text,bigint,text) to service_role;

-- Re-running provider reconciliation must not resurrect access that a full
-- refund already revoked for the same subscription.
create or replace function public.keep_refunded_entitlements_revoked()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.revoked_at is null and old.revoked_at is not null and exists (
    select 1 from public.payments p
    where p.subscription_id = new.subscription_id
      and p.status = 'refunded'
      and p.captured_at >= new.starts_at - interval '1 minute'
  ) then
    new.revoked_at := old.revoked_at;
  end if;
  return new;
end;
$$;
revoke all on function public.keep_refunded_entitlements_revoked() from public, anon, authenticated;

drop trigger if exists keep_refunded_entitlements_revoked on public.entitlements;
create trigger keep_refunded_entitlements_revoked
before update on public.entitlements
for each row execute function public.keep_refunded_entitlements_revoked();

commit;
