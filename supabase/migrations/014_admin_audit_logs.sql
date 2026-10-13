begin;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),

  actor_user_id uuid not null
    references auth.users(id)
    on delete restrict,

  action text not null,
  target_type text not null,
  target_id text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint audit_action_not_empty check (
    length(trim(action)) between 3 and 120
  ),

  constraint audit_target_not_empty check (
    length(trim(target_type)) between 2 and 80
  )
);

create index if not exists
  audit_actor_time_idx
on public.admin_audit_logs(
  actor_user_id,
  created_at desc
);

create index if not exists
  audit_action_time_idx
on public.admin_audit_logs(
  action,
  created_at desc
);

create or replace function
public.prevent_audit_log_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Audit logs cannot be modified or deleted';
end;
$$;

create trigger prevent_audit_log_update
before update or delete
on public.admin_audit_logs
for each row
execute function
public.prevent_audit_log_mutation();

alter table public.admin_audit_logs
enable row level security;

revoke all on public.admin_audit_logs
from anon, authenticated;

commit;