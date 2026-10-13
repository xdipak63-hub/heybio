begin;

-- ==================================================
-- HEYBIO | BILLING AND ADMIN TRANSACTION FUNCTIONS
-- All calls must originate from trusted backend.
-- ==================================================

create or replace function
public.process_razorpay_event(
  p_event_id text,
  p_event_type text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
  v_subscription jsonb;
  v_payment jsonb;
  v_sub_id text;
  v_payment_id text;
  v_local_subscription public.subscriptions%rowtype;
  v_status text;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_payment_amount bigint;
  v_payment_currency text;
  v_payment_status text;
  v_payment_created timestamptz;
begin
  -- Service role only.
  if auth.role() is distinct from 'service_role' then
    raise exception 'Forbidden';
  end if;

  if p_event_id is null
     or length(trim(p_event_id)) = 0
     or length(p_event_id) > 200
  then
    raise exception 'Invalid event ID';
  end if;

  if p_event_type is null
     or length(p_event_type) > 160
     or jsonb_typeof(p_payload) <> 'object'
  then
    raise exception 'Invalid event payload';
  end if;

  -- Deduplication is enforced by unique constraint.
  insert into public.webhook_events (
    provider,
    provider_event_id,
    event_type,
    payload,
    processing_status,
    attempt_count,
    last_attempt_at
  )
  values (
    'razorpay',
    p_event_id,
    p_event_type,
    p_payload,
    'processing',
    1,
    now()
  )
  on conflict (
    provider,
    provider_event_id
  ) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return jsonb_build_object(
      'processed', true,
      'duplicate', true
    );
  end if;

  v_subscription :=
    p_payload #> '{payload,subscription,entity}';

  v_payment :=
    p_payload #> '{payload,payment,entity}';

  v_sub_id := coalesce(
    v_subscription ->> 'id',
    v_payment ->> 'subscription_id'
  );

  -- Unsupported events are retained for audit,
  -- but do not change billing state.
  if p_event_type not in (
    'subscription.activated',
    'subscription.charged',
    'subscription.pending',
    'subscription.halted',
    'subscription.cancelled',
    'subscription.completed',
    'payment.captured',
    'payment.failed'
  ) then
    update public.webhook_events
    set processing_status = 'ignored',
        processed_at = now()
    where id = v_event_id;

    return jsonb_build_object(
      'processed', true,
      'duplicate', false,
      'ignored', true
    );
  end if;

  if v_sub_id is null then
    raise exception
      'Missing subscription identifier';
  end if;

  select *
  into v_local_subscription
  from public.subscriptions
  where razorpay_subscription_id = v_sub_id
  for update;

  if not found then
    raise exception
      'Subscription not registered locally: %',
      v_sub_id;
  end if;

  if v_subscription is not null then
    if v_subscription ->> 'plan_id'
       is distinct from
       v_local_subscription.razorpay_plan_id
    then
      raise exception
        'Razorpay plan mismatch';
    end if;
  end if;

  -- Razorpay timestamps are Unix seconds.
  if v_subscription ? 'current_start'
     and (v_subscription ->> 'current_start')
       ~ '^[0-9]+$'
  then
    v_period_start := to_timestamp(
      (v_subscription ->> 'current_start')::numeric
    );
  end if;

  if v_subscription ? 'current_end'
     and (v_subscription ->> 'current_end')
       ~ '^[0-9]+$'
  then
    v_period_end := to_timestamp(
      (v_subscription ->> 'current_end')::numeric
    );
  end if;

  v_status := case p_event_type
    when 'subscription.activated' then 'active'
    when 'subscription.charged' then 'active'
    when 'subscription.pending' then 'pending'
    when 'subscription.halted' then 'halted'
    when 'subscription.cancelled' then 'cancelled'
    when 'subscription.completed' then 'completed'
    else null
  end;

  if v_status is not null then
    update public.subscriptions
    set status = v_status,
        current_period_start =
          coalesce(
            v_period_start,
            current_period_start
          ),
        current_period_end =
          coalesce(
            v_period_end,
            current_period_end
          ),
        cancelled_at =
          case
            when v_status = 'cancelled'
            then coalesce(
              cancelled_at,
              now()
            )
            else cancelled_at
          end,
        ended_at =
          case
            when v_status in (
              'cancelled',
              'completed'
            )
            then coalesce(
              ended_at,
              now()
            )
            else ended_at
          end
    where id = v_local_subscription.id;
  end if;

  -- Payment data is inserted only when
  -- Razorpay sends a payment entity.
  if v_payment is not null
     and jsonb_typeof(v_payment) = 'object'
  then
    v_payment_id := v_payment ->> 'id';

    if v_payment_id is null
       or v_payment_id !~ '^pay_[A-Za-z0-9]+$'
    then
      raise exception 'Invalid payment ID';
    end if;

    if coalesce(
      v_payment ->> 'amount',
      ''
    ) !~ '^[0-9]+$' then
      raise exception 'Invalid payment amount';
    end if;

    v_payment_amount :=
      (v_payment ->> 'amount')::bigint;

    v_payment_currency :=
      v_payment ->> 'currency';

    if v_payment_currency <> 'INR' then
      raise exception
        'Unsupported payment currency';
    end if;

    v_payment_status :=
      v_payment ->> 'status';

    if v_payment_status not in (
      'created',
      'authorized',
      'captured',
      'refunded',
      'failed'
    ) then
      raise exception
        'Unsupported payment status';
    end if;

    v_payment_created :=
      case
        when coalesce(
          v_payment ->> 'created_at',
          ''
        ) ~ '^[0-9]+$'
        then to_timestamp(
          (v_payment ->> 'created_at')::numeric
        )
        else now()
      end;

    insert into public.payments (
      user_id,
      subscription_id,
      razorpay_payment_id,
      razorpay_order_id,
      amount_paise,
      currency,
      status,
      method,
      captured_at,
      created_at
    )
    values (
      v_local_subscription.user_id,
      v_local_subscription.id,
      v_payment_id,
      v_payment ->> 'order_id',
      v_payment_amount,
      'INR',
      v_payment_status,
      v_payment ->> 'method',
      case
        when v_payment_status = 'captured'
        then now()
        else null
      end,
      v_payment_created
    )
    on conflict (
      razorpay_payment_id
    ) do nothing;

    -- A payment ID must never belong
    -- to another HEYBIO subscription.
    if exists (
      select 1
      from public.payments p
      where p.razorpay_payment_id =
        v_payment_id
        and (
          p.user_id <>
            v_local_subscription.user_id
          or p.subscription_id <>
            v_local_subscription.id
          or p.amount_paise <>
            v_payment_amount
        )
    ) then
      raise exception
        'Payment ownership mismatch';
    end if;
  end if;

  update public.webhook_events
  set processing_status = 'processed',
      processed_at = now(),
      error_message = null
  where id = v_event_id;

  return jsonb_build_object(
    'processed', true,
    'duplicate', false
  );
end;
$$;

revoke all on function
public.process_razorpay_event(
  text,
  text,
  jsonb
)
from public, anon, authenticated;

grant execute on function
public.process_razorpay_event(
  text,
  text,
  jsonb
)
to service_role;


-- ==================================================
-- ADMIN MODERATION
-- ==================================================

create or replace function
public.admin_moderate_user(
  p_actor_id uuid,
  p_target_id uuid,
  p_action text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_email text;
  v_actor_verified boolean;
  v_target_admin boolean;
  v_new_status text;
  v_updated_id uuid;
begin
  if auth.role() is distinct from
     'service_role' then
    raise exception 'Forbidden';
  end if;

  if p_actor_id is null
     or p_target_id is null
     or p_actor_id = p_target_id
  then
    raise exception 'Invalid target';
  end if;

  if p_action not in (
    'suspend',
    'restore'
  ) then
    raise exception 'Unsupported action';
  end if;

  if p_reason is null
     or length(trim(p_reason)) < 5
     or length(trim(p_reason)) > 2000
  then
    raise exception 'Invalid reason';
  end if;

  select
    lower(trim(u.email)),
    u.email_confirmed_at is not null
  into
    v_actor_email,
    v_actor_verified
  from auth.users u
  where u.id = p_actor_id;

  if not coalesce(
    v_actor_verified,
    false
  ) or v_actor_email not in (
    'xdipak63@gmail.com',
    'dipak7rabari@gmail.com'
  ) then
    raise exception
      'Unverified administrator';
  end if;

  if not exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = p_actor_id
      and ar.role = 'super_admin'
      and ar.is_active = true
  ) then
    raise exception
      'Administrator role not found';
  end if;

  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = p_target_id
      and ar.is_active = true
  )
  into v_target_admin;

  if v_target_admin then
    raise exception
      'Administrator accounts are protected';
  end if;

  v_new_status := case p_action
    when 'suspend' then 'suspended'
    when 'restore' then 'active'
  end;

  update public.profiles
  set account_status = v_new_status
  where id = p_target_id
    and account_status <> 'deleted'
  returning id into v_updated_id;

  if v_updated_id is null then
    raise exception
      'Target account not found';
  end if;

  insert into public.user_moderation (
    user_id,
    admin_user_id,
    action,
    reason
  )
  values (
    p_target_id,
    p_actor_id,
    p_action,
    trim(p_reason)
  );

  insert into public.admin_audit_logs (
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    p_actor_id,
    'user.' || p_action,
    'user',
    p_target_id::text,
    jsonb_build_object(
      'reason',
      trim(p_reason),
      'new_status',
      v_new_status
    )
  );

  return jsonb_build_object(
    'success', true,
    'user_id', p_target_id,
    'status', v_new_status
  );
end;
$$;

revoke all on function
public.admin_moderate_user(
  uuid,
  uuid,
  text,
  text
)
from public, anon, authenticated;

grant execute on function
public.admin_moderate_user(
  uuid,
  uuid,
  text,
  text
)
to service_role;

commit;