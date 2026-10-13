begin;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id) on delete restrict,

  subscription_id uuid
    references public.subscriptions(id)
    on delete restrict,

  razorpay_payment_id text not null unique,
  razorpay_order_id text,

  amount_paise bigint not null,
  amount_refunded_paise bigint not null default 0,

  currency text not null default 'INR',
  status text not null,

  method text,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint payments_amount_valid check (
    amount_paise >= 0
  ),

  constraint payments_refund_valid check (
    amount_refunded_paise >= 0
    and amount_refunded_paise <= amount_paise
  ),

  constraint payments_currency_valid check (
    currency = 'INR'
  ),

  constraint payments_status_valid check (
    status in (
      'created',
      'authorized',
      'captured',
      'refunded',
      'failed'
    )
  ),

  constraint payments_razorpay_id_valid check (
    razorpay_payment_id ~ '^pay_[A-Za-z0-9]+$'
  )
);

create index if not exists
  payments_user_created_idx
on public.payments(user_id, created_at desc);

create index if not exists
  payments_subscription_idx
on public.payments(subscription_id);

create index if not exists
  payments_status_idx
on public.payments(status, created_at desc);

create or replace function
public.set_payment_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger payments_updated_at
before update on public.payments
for each row
execute function public.set_payment_updated_at();

alter table public.payments enable row level security;

revoke all on public.payments
from anon, authenticated;

grant select on public.payments
to authenticated;

create policy payments_read_own
on public.payments
for select
to authenticated
using (user_id = (select auth.uid()));

commit;