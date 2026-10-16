
-- HEYBIO ↗ / 017 / In-app notifications (NOT email/push delivery).
begin;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),

  constraint notifications_category_valid
    check (category in ('system', 'support', 'billing', 'security')),
  constraint notifications_title_length
    check (char_length(trim(title)) between 1 and 120),
  constraint notifications_message_length
    check (char_length(trim(message)) between 1 and 1000),
  constraint notifications_read_time_valid
    check (read_at is null or read_at >= created_at)
);

create index if not exists notifications_user_recent_idx
  on public.notifications(user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;
revoke all on public.notifications from public, anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

drop policy if exists notifications_read_own on public.notifications;
create policy notifications_read_own on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists notifications_mark_read_own on public.notifications;
create policy notifications_mark_read_own on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Only a trusted admin/service backend can create notifications.
-- A support-ticket status change creates a real in-app notification.
create or replace function public.notify_support_ticket_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications(
      user_id, category, title, message
    ) values (
      new.user_id,
      'support',
      'Support ticket updated',
      'Your support request status is now: ' || replace(new.status, '_', ' ')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_support_ticket_status on public.support_tickets;
create trigger notify_support_ticket_status
  after update of status on public.support_tickets
  for each row execute function public.notify_support_ticket_status();

revoke all on function public.notify_support_ticket_status()
  from public, anon, authenticated;

commit;
