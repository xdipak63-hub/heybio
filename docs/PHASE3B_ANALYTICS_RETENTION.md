# HEYBIO Phase 3B — Analytics retention

This narrowly scoped patch adds a **90-day, bounded-batch analytics deletion function**.
It does not change existing API endpoints or payment/authentication code.

## Included files
- `supabase/migrations/031_analytics_retention.sql` (new)

## Apply
1. Ensure migrations through `030` are already applied to staging.
2. Apply `031` using the existing Supabase migration workflow.
3. Call `purge_expired_analytics_events(5000)` using a service-role-only backend job.
4. Schedule that backend job daily and repeat batches until zero rows are deleted.
5. Verify an anonymous/authenticated caller cannot execute the function.
6. Check database backups and retention obligations separately.

**Not automatic yet:** The function does not schedule itself. Do not claim retention
is enforced until a privileged daily scheduler is configured and tested.

Other launch blockers remain: payment E2E tests, admin MFA, RLS, Cloudflare
rate limiting, HYPE DROP integration, and production security review.
