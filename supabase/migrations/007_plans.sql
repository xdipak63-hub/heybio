begin;

create table if not exists public.plans (
  id text primary key,
  name text not null,
  description text not null default '',
  price_paise bigint not null,
  currency text not null default 'INR',
  billing_interval text,
  tier_rank integer not null unique,
  razorpay_plan_id text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint plans_id_valid check (
    id in ('free', 'pro', 'premium', 'pro_max')
  ),
  constraint plans_price_valid check (
    price_paise >= 0
  ),
  constraint plans_currency_valid check (
    currency = 'INR'
  ),
  constraint plans_interval_valid check (
    (id = 'free' and billing_interval is null
      and price_paise = 0)
    or
    (id <> 'free' and billing_interval = 'monthly'
      and price_paise > 0)
  ),
  constraint plans_razorpay_id_valid check (
    razorpay_plan_id is null
    or razorpay_plan_id ~ '^plan_[A-Za-z0-9]+$'
  )
);

insert into public.plans (
  id, name, description, price_paise,
  billing_interval, tier_rank
)
values
  ('free', 'Free', 'Your world starts here',
   0, null, 0),
  ('pro', 'Pro', 'Create with more freedom',
   14900, 'monthly', 1),
  ('premium', 'Premium', 'Go beyond the ordinary',
   24900, 'monthly', 2),
  ('pro_max', 'Pro Max', 'Built for your next level',
   49900, 'monthly', 3)
on conflict (id) do nothing;

alter table public.plans enable row level security;

revoke all on public.plans from anon, authenticated;
grant select on public.plans to anon, authenticated;

create policy plans_public_read
on public.plans
for select
to anon, authenticated
using (is_active = true);

commit;