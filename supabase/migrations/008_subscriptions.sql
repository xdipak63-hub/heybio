begin;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id) on delete restrict,

  plan_id text not null
    references public.plans(id),

  razorpay_subscription_id text unique,
  razorpay_plan_id text,

  status text not null default 'created',

  current_period_start timestamptz,
  current_period_end timestamptz,

  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  ended_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint subscriptions_paid_plan check (
    plan_id <> 'free'
  ),

  constraint subscriptions_status_check check (
    status in (
      'created',
      'authenticated',
      'active',
      'pending',
      'halted',
      'cancelled',
      'completed',
      'expired'
    )
  ),

  constraint subscriptions_razorpay_id_check check (
    razorpay_subscription_id is null
    or razorpay_subscription_id ~ '^sub_[A-Za-z0-9]+$'
  ),

  constraint subscriptions_period_check check (
    current_period_start is null
    or current_period_end is null
    or current_period_end > current_period_start
  )
);

create index if not exists
  subscriptions_user_idx
on public.subscriptions(user_id, created_at desc);

create index if not exists
  subscriptions_status_idx
on public.subscriptions(status, current_period_end);

create unique index if not exists
  subscriptions_one_active_per_user
on public.subscriptions(user_id)
where status = 'active';

create or replace function
public.set_subscription_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_subscription_updated_at();

alter table public.subscriptions enable row level security;

revoke all on public.subscriptions
from anon, authenticated;

grant select on public.subscriptions
to authenticated;

create policy subscriptions_read_own
on public.subscriptions
for select
to authenticated
using (user_id = (select auth.uid()));

commit;