
-- HEYBIO ↗ / 019 / Defense in depth: account and plan permission checks.
-- Paid UI controls are NOT an authorization mechanism.
begin;

-- Prevent unauthenticated/other users from reading raw analytics.
-- Premium/Pro Max can query their own analytics only while entitlement is active.
drop policy if exists analytics_read_profile_owner on public.analytics_events;
create policy analytics_read_profile_owner
on public.analytics_events
for select to authenticated
using (
  profile_id = (select auth.uid())
  and (select public.has_active_entitlement('analytics'))
);

-- Free creators can persist the default design.
-- Non-default designs require a verified custom_themes entitlement.
drop policy if exists themes_insert_owner on public.profile_themes;
create policy themes_insert_owner
on public.profile_themes
for insert to authenticated
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.account_status = 'active'
  )
  and (
    (preset = 'classic' and accent = '#BDF806'
      and button_style = 'rounded')
    or (select public.has_active_entitlement('custom_themes'))
  )
);

drop policy if exists themes_update_owner on public.profile_themes;
create policy themes_update_owner
on public.profile_themes
for update to authenticated
using (
  profile_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.account_status = 'active'
  )
)
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.account_status = 'active'
  )
  and (
    (preset = 'classic' and accent = '#BDF806'
      and button_style = 'rounded')
    or (select public.has_active_entitlement('custom_themes'))
  )
);

-- Keep operational tables private even if someone adds a broad policy later.
alter table public.user_moderation enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.analytics_events enable row level security;
alter table public.entitlements enable row level security;

revoke all on public.user_moderation from public, anon, authenticated;
revoke all on public.admin_audit_logs from public, anon, authenticated;
revoke all on public.webhook_events from public, anon, authenticated;

-- Never allow arbitrary clients to execute privilege-sensitive trigger functions.
revoke all on function public.validate_admin_role_identity()
  from public, anon, authenticated;

commit;
