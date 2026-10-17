begin;

-- The provider creates the order; only the trusted backend may persist or settle it.
create table public.manual_payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  plan_id text not null references public.plans(id),
  razorpay_order_id text not null unique check (razorpay_order_id ~ '^order_[A-Za-z0-9]+$'),
  amount_paise bigint not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (status in ('created','paid','abandoned')),
  razorpay_payment_id text unique check (razorpay_payment_id is null or razorpay_payment_id ~ '^pay_[A-Za-z0-9]+$'),
  subscription_id uuid references public.subscriptions(id),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index manual_orders_user_created_idx on public.manual_payment_orders (user_id, created_at desc);
create unique index manual_orders_one_open_per_user on public.manual_payment_orders (user_id) where status = 'created';
alter table public.manual_payment_orders enable row level security;
revoke all on public.manual_payment_orders from public, anon, authenticated;
grant select on public.manual_payment_orders to authenticated;
create policy manual_orders_read_own on public.manual_payment_orders
for select to authenticated using (user_id = (select auth.uid()));

-- All grants are explicitly restricted; never expose these functions to a browser role.
create or replace function public.settle_verified_manual_order(
  p_order_id text, p_payment_id text, p_amount_paise bigint,
  p_currency text, p_payment_status text, p_payment_method text default null
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_order public.manual_payment_orders%rowtype;
  v_existing public.payments%rowtype;
  v_subscription uuid;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_feature text;
  v_expected bigint;
begin
  if p_payment_id !~ '^pay_[A-Za-z0-9]+$' or p_order_id !~ '^order_[A-Za-z0-9]+$'
    or p_payment_status <> 'captured' or p_currency <> 'INR' then
    raise exception 'Unverified or invalid payment';
  end if;
  select * into v_order from public.manual_payment_orders
  where razorpay_order_id = p_order_id for update;
  if not found then raise exception 'Unknown order'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_order.user_id::text, 672913));
  select price_paise into v_expected from public.plans
  where id = v_order.plan_id and is_active = true and billing_interval = 'monthly';
  if v_expected is null or v_expected <> v_order.amount_paise
      or p_amount_paise <> v_order.amount_paise then
    raise exception 'Order amount or plan mismatch';
  end if;
  if v_order.status = 'paid' then
    if v_order.razorpay_payment_id = p_payment_id then
      return jsonb_build_object('success', true, 'duplicate', true, 'subscription_id', v_order.subscription_id);
    end if;
    raise exception 'Order already paid by a different payment';
  end if;
  if v_order.status <> 'created' then raise exception 'Order not payable'; end if;
  select * into v_existing from public.payments where razorpay_payment_id = p_payment_id;
  if found then raise exception 'Payment already assigned'; end if;

  -- An expired manual/recurring period must not block legitimate new checkout.
  update public.subscriptions set status = 'expired', ended_at = now()
  where user_id = v_order.user_id and status = 'active' and current_period_end <= now();
  if exists (select 1 from public.subscriptions
      where user_id = v_order.user_id and status in ('active','cancelled')
      and current_period_end > now()) then
    raise exception 'Another paid period is still active; reconcile or refund this payment';
  end if;

  v_period_start := now();
  v_period_end := v_period_start + interval '1 month';
  insert into public.subscriptions
    (user_id, plan_id, status, current_period_start, current_period_end)
  values (v_order.user_id, v_order.plan_id, 'active', v_period_start, v_period_end)
  returning id into v_subscription;
  insert into public.payments
    (user_id, subscription_id, razorpay_payment_id, razorpay_order_id,
     amount_paise, currency, status, method, captured_at)
  values (v_order.user_id, v_subscription, p_payment_id, p_order_id,
          p_amount_paise, 'INR', 'captured', left(p_payment_method,50), now());
  update public.manual_payment_orders set status = 'paid', paid_at = now(),
    razorpay_payment_id = p_payment_id, subscription_id = v_subscription
  where id = v_order.id;
  for v_feature in select unnest(case v_order.plan_id
    when 'pro' then array['custom_themes','advanced_appearance']
    when 'premium' then array['custom_themes','advanced_appearance','analytics','hype_drop']
    when 'pro_max' then array['custom_themes','advanced_appearance','analytics','hype_drop']
    else array[]::text[] end)
  loop
    insert into public.entitlements (user_id, subscription_id, feature_key, starts_at, expires_at)
    values (v_order.user_id, v_subscription, v_feature, v_period_start, v_period_end);
  end loop;
  return jsonb_build_object('success', true, 'duplicate', false, 'subscription_id', v_subscription);
end;
$$;

-- Replaces the earlier settlement without changing its RPC arguments.
-- A provider-active period is still required; the RPC is service-role-only.
create or replace function public.settle_razorpay_subscription(
  p_razorpay_subscription_id text, p_razorpay_plan_id text,
  p_provider_status text, p_period_start timestamptz, p_period_end timestamptz
) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  v_sub public.subscriptions%rowtype;
  v_feature text;
  v_start timestamptz;
  v_end timestamptz;
begin
  if p_provider_status not in ('created','authenticated','active','pending','halted','cancelled','completed','expired')
    then raise exception 'Invalid subscription status'; end if;
  select * into v_sub from public.subscriptions
    where razorpay_subscription_id = p_razorpay_subscription_id for update;
  if not found then raise exception 'Unknown subscription'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_sub.user_id::text, 672913));
  if v_sub.razorpay_plan_id is distinct from p_razorpay_plan_id
    or not exists (select 1 from public.plans p where p.id=v_sub.plan_id
      and p.razorpay_plan_id = p_razorpay_plan_id and p.is_active=true) then
    raise exception 'Razorpay plan mismatch';
  end if;
  v_start := coalesce(p_period_start, v_sub.current_period_start);
  v_end := coalesce(p_period_end, v_sub.current_period_end);
  if p_provider_status = 'active' and (v_start is null or v_end is null
    or v_end <= v_start or v_end <= now()) then
    raise exception 'Cannot activate without valid provider billing period';
  end if;
  update public.subscriptions set status='expired', ended_at=now()
  where user_id=v_sub.user_id and id<>v_sub.id and status='active'
    and current_period_end <= now();
  if p_provider_status = 'active' and exists
    (select 1 from public.subscriptions s where s.user_id=v_sub.user_id
      and s.id<>v_sub.id and s.status in ('active','cancelled')
      and s.current_period_end > now()) then
    raise exception 'Conflicting paid period';
  end if;
  update public.subscriptions set status=p_provider_status,
    current_period_start=v_start, current_period_end=v_end,
    cancelled_at=case when p_provider_status='cancelled' then coalesce(cancelled_at,now()) else cancelled_at end,
    ended_at=case when p_provider_status in ('cancelled','completed','expired') then coalesce(ended_at,now()) else ended_at end
  where id=v_sub.id;
  -- Do not fabricate entitlements for unverified/incomplete periods.
  if p_provider_status = 'active' then
    for v_feature in select unnest(case v_sub.plan_id
      when 'pro' then array['custom_themes','advanced_appearance']
      when 'premium' then array['custom_themes','advanced_appearance','analytics','hype_drop']
      when 'pro_max' then array['custom_themes','advanced_appearance','analytics','hype_drop']
      else array[]::text[] end)
    loop
      insert into public.entitlements (user_id, subscription_id, feature_key, starts_at, expires_at)
      values(v_sub.user_id,v_sub.id,v_feature,v_start,v_end)
      on conflict (subscription_id,feature_key) do update
      set starts_at=excluded.starts_at, expires_at=excluded.expires_at, revoked_at=null;
    end loop;
  end if;
  insert into public.billing_reconciliation_log
    (subscription_id,razorpay_subscription_id,provider_status,result)
  values(v_sub.id,p_razorpay_subscription_id,p_provider_status,'updated');
  return jsonb_build_object('success',true,'subscription_id',v_sub.id,'status',p_provider_status);
end;
$$;

-- Captured recurring payments are recorded once after the provider is fetched.
create or replace function public.record_verified_recurring_payment(
  p_subscription_id text, p_payment_id text, p_order_id text,
  p_amount_paise bigint, p_currency text, p_payment_status text,
  p_payment_method text default null
) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare v_sub public.subscriptions%rowtype; v_existing public.payments%rowtype; v_expected bigint;
begin
  if p_subscription_id !~ '^sub_[A-Za-z0-9]+$' or p_payment_id !~ '^pay_[A-Za-z0-9]+$'
     or p_payment_status <> 'captured' or p_currency <> 'INR' then
    raise exception 'Invalid provider payment'; end if;
  select * into v_sub from public.subscriptions
    where razorpay_subscription_id = p_subscription_id for update;
  if not found then raise exception 'Unknown subscription'; end if;
  select price_paise into v_expected from public.plans where id = v_sub.plan_id;
  if v_expected is null or v_expected <> p_amount_paise then
    raise exception 'Payment amount mismatch'; end if;
  select * into v_existing from public.payments where razorpay_payment_id=p_payment_id;
  if found then
    if v_existing.subscription_id <> v_sub.id or v_existing.user_id <> v_sub.user_id
      or v_existing.amount_paise <> p_amount_paise then
      raise exception 'Payment reused across subscriptions'; end if;
    return true;
  end if;
  insert into public.payments
    (user_id,subscription_id,razorpay_payment_id,razorpay_order_id,
     amount_paise,currency,status,method,captured_at)
  values(v_sub.user_id,v_sub.id,p_payment_id,p_order_id,p_amount_paise,'INR',
         'captured',left(p_payment_method,50),now());
  return true;
end;
$$;

-- Cancelled subscriptions that have already paid retain access through the
-- period end; expiration of their period still shuts off access strictly.
create or replace function public.has_active_entitlement(requested_feature text)
returns boolean language sql stable security invoker set search_path = '' as $$
select exists (
  select 1 from public.entitlements e
  join public.subscriptions s on s.id=e.subscription_id
  where e.user_id=(select auth.uid()) and s.user_id=e.user_id
    and e.feature_key=requested_feature and e.revoked_at is null
    and e.starts_at<=now() and e.expires_at>now()
    and s.status in ('active','cancelled') and s.current_period_end>now()
    and (e.feature_key <> 'hype_drop' or s.plan_id in ('premium','pro_max'))
);
$$;
revoke all on function public.settle_verified_manual_order(text,text,bigint,text,text,text) from public,anon,authenticated;
revoke all on function public.record_verified_recurring_payment(text,text,text,bigint,text,text,text) from public,anon,authenticated;
revoke all on function public.settle_razorpay_subscription(text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.settle_verified_manual_order(text,text,bigint,text,text,text) to service_role;
grant execute on function public.record_verified_recurring_payment(text,text,text,bigint,text,text,text) to service_role;
grant execute on function public.settle_razorpay_subscription(text,text,text,timestamptz,timestamptz) to service_role;
grant execute on function public.has_active_entitlement(text) to authenticated;
commit;
