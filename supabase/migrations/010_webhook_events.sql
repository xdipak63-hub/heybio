begin;

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),

  provider text not null default 'razorpay',
  provider_event_id text not null,
  event_type text not null,

  payload jsonb not null,

  processing_status text not null default 'received',
  attempt_count integer not null default 0,

  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_attempt_at timestamptz,
  error_message text,

  constraint webhook_provider_valid check (
    provider = 'razorpay'
  ),

  constraint webhook_status_valid check (
    processing_status in (
      'received',
      'processing',
      'processed',
      'failed',
      'ignored'
    )
  ),

  constraint webhook_attempts_valid check (
    attempt_count >= 0
  ),

  constraint webhook_event_id_unique unique (
    provider,
    provider_event_id
  )
);

create index if not exists
  webhook_events_pending_idx
on public.webhook_events(
  processing_status,
  received_at
);

create index if not exists
  webhook_events_type_idx
on public.webhook_events(
  event_type,
  received_at desc
);

alter table public.webhook_events
enable row level security;

revoke all on public.webhook_events
from anon, authenticated;

commit;