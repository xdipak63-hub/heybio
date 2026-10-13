begin;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete restrict,

  subject text not null,
  message text not null,

  category text not null default 'general',
  priority text not null default 'normal',
  status text not null default 'open',

  assigned_admin_id uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,

  constraint ticket_subject_valid check (
    length(trim(subject)) between 5 and 160
  ),

  constraint ticket_message_valid check (
    length(trim(message)) between 10 and 10000
  ),

  constraint ticket_category_valid check (
    category in (
      'general',
      'account',
      'billing',
      'technical',
      'abuse',
      'other'
    )
  ),

  constraint ticket_priority_valid check (
    priority in (
      'low',
      'normal',
      'high',
      'urgent'
    )
  ),

  constraint ticket_status_valid check (
    status in (
      'open',
      'in_progress',
      'waiting_user',
      'resolved',
      'closed'
    )
  )
);

create index if not exists
  support_user_time_idx
on public.support_tickets(
  user_id,
  created_at desc
);

create index if not exists
  support_status_time_idx
on public.support_tickets(
  status,
  created_at desc
);

create or replace function
public.set_support_ticket_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger support_ticket_updated_at
before update on public.support_tickets
for each row
execute function
public.set_support_ticket_updated_at();

alter table public.support_tickets
enable row level security;

revoke all on public.support_tickets
from anon, authenticated;

grant select, insert on public.support_tickets
to authenticated;

create policy support_tickets_read_own
on public.support_tickets
for select
to authenticated
using (
  user_id = (select auth.uid())
);

create policy support_tickets_create_own
on public.support_tickets
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'open'
  and priority = 'normal'
  and assigned_admin_id is null
  and resolved_at is null
);

commit;