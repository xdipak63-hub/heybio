begin;

-- A plan-change preference is NOT a payment, invoice, entitlement,
-- Razorpay mandate, or authorization to charge the user.
create table if not exists public.billing_change_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  from_subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  target_plan_id text not null references public.plans(id),
  target_mode text not null check (target_mode in ('manual', 'auto')),
  available_after timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_preference_free_manual check (
    target_plan_id <> 'free' or target_mode = 'manual'
  )
);

create index if not exists billing_preferences_subscription_idx
  on public.billing_change_preferences(from_subscription_id);

alter table public.billing_change_preferences enable row level security;
revoke all on public.billing_change_preferences from public, anon, authenticated;
grant select on public.billing_change_preferences to authenticated;

create policy billing_change_preferences_read_own
  on public.billing_change_preferences
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Only trusted worker service-role calls can write or change a preference.
-- Never expose provider APIs or subscription updates through browser roles.
comment on table public.billing_change_preferences is
  'A non-binding preference. The user must complete a new verified checkout after the previous paid period ends; no auto-charge is initiated by this row.';

commit;
