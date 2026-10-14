
begin;

-- Explicitly enforce row-level security.
alter table public.admin_roles
  enable row level security;

-- Revoke all existing client grants.
revoke all on table public.admin_roles
  from public, anon, authenticated;

-- Remove potentially permissive policies.
-- The own-role policy will be recreated.
drop policy if exists admin_roles_read_own
  on public.admin_roles;

-- Prevent accidental broad policies from
-- providing admin-role access.
alter table public.admin_roles
  force row level security;

-- Allow a logged-in user to read only
-- their own role record, never another user's.
create policy admin_roles_read_own
on public.admin_roles
as permissive
for select
to authenticated
using (
  user_id = (select auth.uid())
);

grant select on table public.admin_roles
  to authenticated;

-- No INSERT, UPDATE or DELETE privileges
-- are granted to anon/authenticated.
-- Role assignment remains a privileged
-- backend/database operation.

-- Prevent public execution of the identity
-- validation trigger function.
revoke all on function
  public.validate_admin_role_identity()
from public, anon, authenticated;

commit;
