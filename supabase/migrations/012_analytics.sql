begin;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  link_id uuid,

  event_type text not null,
  occurred_at timestamptz not null default now(),

  referrer_domain text,
  country_code text,
  device_category text,

  constraint analytics_event_type_valid check (
    event_type in (
      'profile_view',
      'link_click'
    )
  ),

  constraint analytics_country_valid check (
    country_code is null
    or country_code ~ '^[A-Z]{2}$'
  ),

  constraint analytics_device_valid check (
    device_category is null
    or device_category in (
      'mobile',
      'desktop',
      'tablet',
      'unknown'
    )
  )
);

create index if not exists
  analytics_profile_time_idx
on public.analytics_events(
  profile_id,
  occurred_at desc
);

create index if not exists
  analytics_profile_event_idx
on public.analytics_events(
  profile_id,
  event_type,
  occurred_at desc
);

alter table public.analytics_events
enable row level security;

revoke all on public.analytics_events
from anon, authenticated;

grant select on public.analytics_events
to authenticated;

create policy analytics_read_profile_owner
on public.analytics_events
for select
to authenticated
using (
  profile_id = (select auth.uid())
);

commit;