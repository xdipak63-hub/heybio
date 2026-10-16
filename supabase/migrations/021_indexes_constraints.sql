
-- HEYBIO ↗ / 021 / Indexes for real creator and admin query patterns.
-- Existing 001–016 indexes are intentionally not duplicated.
begin;

-- Public profile renders only active links, ordered by position.
create index if not exists links_public_active_idx
  on public.links(profile_id, position, created_at, id)
  where is_active = true;

-- Social and media reads always remain scoped to owner identity.
create index if not exists social_links_owner_visible_idx
  on public.social_links(user_id, position, id)
  where is_visible = true;

create index if not exists profile_media_user_recent_idx
  on public.profile_media(user_id, created_at desc);

-- Subscription and payment history (never derive revenue from UI).
create index if not exists subscriptions_user_status_period_idx
  on public.subscriptions(user_id, status, current_period_end desc);

create index if not exists payments_subscription_created_idx
  on public.payments(subscription_id, created_at desc);

-- Back-office support queue and audit investigation queries.
create index if not exists support_tickets_status_priority_idx
  on public.support_tickets(status, priority, created_at desc);

create index if not exists support_tickets_user_updated_idx
  on public.support_tickets(user_id, updated_at desc);

create index if not exists audit_target_history_idx
  on public.admin_audit_logs(target_type, target_id, created_at desc);

-- Analytics is collected separately and has its own indexes in 012.
-- The application must still implement rate limiting and privacy controls.
commit;
