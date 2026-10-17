
-- HEYBIO ↗
-- Official pricing baseline
-- By DIPO LABS
--
-- Can be run on local/staging databases.
-- Never overwrite Razorpay plan identifiers.

begin;

insert into public.plans (
  id,
  name,
  description,
  price_paise,
  currency,
  billing_interval,
  tier_rank,
  is_active
)
values
  (
    'free',
    'Free',
    'Your world starts here.',
    0,
    'INR',
    null,
    0,
    true
  ),
  (
    'pro',
    'Pro',
    'Create with more freedom.',
    14900,
    'INR',
    'monthly',
    1,
    true
  ),
  (
    'premium',
    'Premium',
    'Go beyond the ordinary.',
    24900,
    'INR',
    'monthly',
    2,
    true
  ),
  (
    'pro_max',
    'Pro Max',
    'Built for your next level.',
    49900,
    'INR',
    'monthly',
    3,
    true
  )
on conflict (id) do nothing;

-- Fail rather than silently overwrite
-- an existing commercial configuration.

do $$
declare
  v_count integer;
begin
  select count(*)
  into v_count
  from public.plans
  where
    (id = 'free'
      and price_paise = 0
      and billing_interval is null
      and tier_rank = 0)
    or
    (id = 'pro'
      and price_paise = 14900
      and billing_interval = 'monthly'
      and tier_rank = 1)
    or
    (id = 'premium'
      and price_paise = 24900
      and billing_interval = 'monthly'
      and tier_rank = 2)
    or
    (id = 'pro_max'
      and price_paise = 49900
      and billing_interval = 'monthly'
      and tier_rank = 3);

  if v_count <> 4 then
    raise exception
      'HEYBIO pricing mismatch. Review plans before deployment.';
  end if;
end;
$$;

commit;