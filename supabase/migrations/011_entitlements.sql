begin;

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id) on delete cascade,

  subscription_id uuid
    references public.subscriptions(id)
    on delete cascade,

  feature_key text not null,

  starts_at timestamptz not null default now(),
  expires_at timestamptz,

  revoked_at timestamptz,
  created_at timestamptz not null default now(),

  constraint entitlements_feature_valid check (
    feature_key in (
      'custom_themes',
      'advanced_appearance',
      'analytics',
      'hype_drop'
    )
  ),

  constraint entitlements_period_valid check (
    expires_at is null
    or expires_at > starts_at
  ),

  constraint entitlements_unique_subscription_feature unique (
    subscription_id,
    feature_key
  )
);

create index if not exists
  entitlements_user_feature_idx
on public.entitlements(
  user_id,
  feature_key,
  expires_at
);

create or replace function
public.has_active_entitlement(
  requested_feature text
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.entitlements e
    join public.subscriptions s
      on s.id = e.subscription_id
    where e.user_id = (select auth.uid())
      and s.user_id = e.user_id
      and e.feature_key = requested_feature
      and e.revoked_at is null
      and e.starts_at <= now()
      and e.expires_at > now()
      and s.status = 'active'
      and s.current_period_end > now()
      and (
        e.feature_key <> 'hype_drop'
        or s.plan_id in ('premium', 'pro_max')
      )
  );
$$;

alter table public.entitlements
enable row level security;

revoke all on public.entitlements
from anon, authenticated;

grant select on public.entitlements
to authenticated;

create policy entitlements_read_own
on public.entitlements
for select
to authenticated
using (user_id = (select auth.uid()));

grant execute on function
public.has_active_entitlement(text)
to authenticated;

commit;