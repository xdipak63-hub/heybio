begin;

create table if not exists public.razorpay_event_inbox (
  id uuid primary key default gen_random_uuid(),

  provider_event_id text not null unique,
  event_type text not null,

  payload jsonb not null,

  status text not null default 'pending',
  attempts integer not null default 0,

  next_attempt_at timestamptz
    not null default now(),

  last_error text,

  received_at timestamptz
    not null default now(),

  processed_at timestamptz,

  constraint razorpay_inbox_status_check
    check (
      status in (
        'pending',
        'processing',
        'processed',
        'failed',
        'ignored'
      )
    ),

  constraint razorpay_inbox_attempts_check
    check (attempts >= 0),

  constraint razorpay_inbox_event_id_check
    check (
      length(trim(provider_event_id))
      between 1 and 200
    ),

  constraint razorpay_inbox_event_type_check
    check (
      length(trim(event_type))
      between 1 and 160
    ),

  constraint razorpay_inbox_payload_check
    check (
      jsonb_typeof(payload) = 'object'
    )
);

create index if not exists
  razorpay_inbox_pending_idx
on public.razorpay_event_inbox (
  next_attempt_at,
  received_at
)
where status in ('pending', 'failed');

alter table public.razorpay_event_inbox
enable row level security;

revoke all on public.razorpay_event_inbox
from public, anon, authenticated;

-- Service-role backend can persist and
-- reconcile provider events.
grant select, insert, update
on public.razorpay_event_inbox
to service_role;

-- Atomic insertion and duplicate detection.
create or replace function
public.enqueue_razorpay_event(
  p_event_id text,
  p_event_type text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_existing_status text;
begin
  if p_event_id is null
    or length(trim(p_event_id)) not between 1 and 200
    or p_event_type is null
    or length(trim(p_event_type)) not between 1 and 160
    or jsonb_typeof(p_payload) <> 'object'
  then
    raise exception 'Invalid webhook event';
  end if;

  insert into public.razorpay_event_inbox (
    provider_event_id,
    event_type,
    payload
  )
  values (
    p_event_id,
    p_event_type,
    p_payload
  )
  on conflict (provider_event_id)
  do nothing
  returning id into v_id;

  if v_id is not null then
    return jsonb_build_object(
      'accepted', true,
      'duplicate', false,
      'status', 'pending'
    );
  end if;

  select status
  into v_existing_status
  from public.razorpay_event_inbox
  where provider_event_id = p_event_id;

  return jsonb_build_object(
    'accepted', true,
    'duplicate', true,
    'status', v_existing_status
  );
end;
$$;

revoke all on function
public.enqueue_razorpay_event(
  text,
  text,
  jsonb
)
from public, anon, authenticated;

grant execute on function
public.enqueue_razorpay_event(
  text,
  text,
  jsonb
)
to service_role;

commit;