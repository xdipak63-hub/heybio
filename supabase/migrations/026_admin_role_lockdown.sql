
-- HEYBIO ↗ / 026 / Final privileged-admin role lockdown.
-- IMPORTANT: this file REPLACES 023_admin_role_lockdown.sql.
-- Keep 023_webhook_inbox.sql, which must run before billing 024.
begin;

alter table public.admin_roles enable row level security;

revoke all on public.admin_roles
  from public, anon, authenticated;

drop policy if exists admin_roles_read_own on public.admin_roles;

-- The owner/admin browser session can only read its own active/disabled role.
create policy admin_roles_read_own
on public.admin_roles
for select to authenticated
using (user_id = (select auth.uid()));

grant select on public.admin_roles to authenticated;

-- Service-role backends remain responsible for role assignment.
-- Force RLS for ordinary owner connections as an additional safeguard.
alter table public.admin_roles force row level security;

revoke all on function public.validate_admin_role_identity()
  from public, anon, authenticated;

commit;
