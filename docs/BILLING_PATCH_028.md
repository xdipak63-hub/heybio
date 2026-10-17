# HEYBIO — payment patch 028 deployment checklist

This overlay introduces **two distinctly authorized modes**, not a surprise auto-debit:

- `manual`: Razorpay Order, one month, no scheduled renewal.
- `auto`: Razorpay Subscription, user authorizes up to **12 monthly cycles**. Continue beyond those cycles only with a separately designed consent flow.

All access is server-derived. The browser callback only submits signed references;
backend fetches live provider status and reconciles the database. Webhooks are
signature-verified, stored in a durable inbox, and replay-safe where applicable.

## Apply order — IMPORTANT

1. Back up Git repo and Supabase. Review `git diff` after copying this overlay to the repository root.
2. Apply `supabase/migrations/028_payment_modes_verified_settlement.sql` **once** with the existing migrations 001–027 already applied. Test in staging before production.
3. Set worker secrets via Cloudflare, **not Git**: `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`,
   `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
   Vite browser public Supabase vars must be configured separately.
4. Validate `wrangler.jsonc` rate-limit namespace uniqueness for your Cloudflare account.
   The configured `RATE_LIMITER` fails closed for username, analytics, checkout and verification.
5. Configure Razorpay auto-capture for manual Orders; authorized-only payments MUST NOT activate plans.
6. Configure webhook endpoint `/api/razorpay-webhook`, signing secret and relevant events
   (`payment.captured`, `subscription.*`, `payment.failed`). Test retries/reordering.
7. Add Razorpay **monthly** plan IDs to `public.plans.razorpay_plan_id`; verify prices are exactly
   14900/24900/49900 paise and interval `monthly`.
8. Test with Razorpay **test mode first**; do not mix test and live credentials.
9. After migration and end-to-end webhook/reconciliation verification, set
   `BILLING_JOBS_ENABLED=true` in your deployed Cloudflare environment; current `wrangler.jsonc`
   deliberately defaults to `false` as a safety guard.
10. Test successful, pending, failed, cancelled, duplicate payments, API timeouts,
    missing webhooks, changed plan IDs, account bans, concurrent orders, and authorization fees.
    Run `npm ci && npm run typecheck && npm run build` in a networked development environment.

## Known limits / launch-blocking follow-ups

- Billing periods and entitlements are verified by the server, but **refunds and chargebacks**
  need an additional verified provider reconciliation flow to revoke/refund access consistently.
- Automatic renewal **upgrades/downgrades** while an active period exists are deliberately blocked
  until the proration and effective-date business rules are defined. Do not charge twice.
- An abandoned or failed manual order is reused for a given plan; changing plans while
  a payment is pending requires a support or cleanup workflow. If a late captured payment
  conflicts with an active subscription, it is held for reconciliation, not silently granted.
- Record `subscription.charged` payment entities are processed; periodic verification / retries
  depend on the Cloudflare cron and an operational review of failed inbox events.
- A Razorpay payment may remain **authorized** before capture. Never unlock on authorization.
- The browser-side Supabase MFA client now shares SSR cookie sessions; storage quotas are addressed
  in migration 029. Refund administration, HYPE DROP standalone
  single-sign-on and broader security penetration testing require separate focused audits.
- Code and migrations were reviewed statically here but **not validated against the user's real
  Supabase/Razorpay accounts**. Never deploy the overlay to production without staging tests.
