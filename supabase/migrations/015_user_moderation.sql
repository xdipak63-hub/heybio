begin;

create table if not exists public.user_moderation (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete restrict,

  admin_user_id uuid not null
    references auth.users(id)
    on delete restrict,

  action text not null,
  reason text not null,

  created_at timestamptz not null default now(),

  constraint moderation_action_valid check (
    action in (
      'suspend',
      'restore',
      'delete_request',
      'delete_cancel'
    )
  ),

  constraint moderation_reason_valid check (
    length(trim(reason)) between 5 and 2000
  )
);

create index if not exists
  moderation_user_time_idx
on public.user_moderation(
  user_id,
  created_at desc
);

create index if not exists
  moderation_admin_time_idx
on public.user_moderation(
  admin_user_id,
  created_at desc
);

alter table public.user_moderation
enable row level security;

revoke all on public.user_moderation
from anon, authenticated;

commit;