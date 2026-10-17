# HEYBIO — Phase 2 targeted billing management patch

**Base:** `heybio-main(4).zip` **plus** `HEYBIO_TARGETED_SECURITY_BILLING_PATCH.zip` (Phase 1). Apply this Phase 2 overlay only after the Phase 1 overlay.

## Scope and safety

- Adds an authenticated, CSRF-checked, rate-limited **next-period plan/mode preference** (`/api/billing-change`). Saving the preference **does not** charge a card, extend a subscription, generate an entitlement, or activate a new plan.
- While an **active auto-renewing** period exists, requesting a future change requires explicit on-screen consent and a server-confirmed Razorpay cancellation request for future cycles; current paid-period access remains governed by verification and expiration.
- A **manual** subscription needs no cancellation; the user pays again only if they choose to, after expiration.
- After the old period expires, the billing dashboard offers a new Razorpay checkout for the selected paid plan. Choosing auto-renewal requires **fresh recurring authorization**. Choosing Free requires no payment.
- The paid-plan cancellation endpoint is rate-limited, checks the provider, supports repeat cancellation requests and avoids treating a browser callback as settled billing.
- Payment-history functionality was already present and was **not** rewritten in this patch.
- The prelaunch marketing pricing page's “checkout not yet available” message is deliberately unchanged until live payment readiness is established.

## Files included (only changed/new)

- `app/components/billing/CheckoutButton.tsx` — checkout modal locking + optional preselected mode.
- `app/components/billing/SubscriptionStatus.tsx` — clear manual vs authorized auto-renewal indication.
- `app/components/billing/PlanSwitch.tsx` **NEW** — future plan/mode preference UI with auto-renew cancellation consent.
- `app/routes/api/billing-change.ts` **NEW** — server-side verified plan-change preference API.
- `app/routes/api/subscription-cancel.ts` — rate limit, provider verification, idempotent cancellation.
- `app/routes/dashboard/billing.tsx` — verified active subscription, status, future choice, and next checkout.
- `app/routes/marketing/pricing.tsx` — correct dual-payment FAQ; keeps the prelaunch checkout guard unchanged.
- `app/routes.ts` — register the new API.
- `app/styles/billing.css` — responsive accessible billing management styling.
- `supabase/migrations/030_billing_change_preferences.sql` **NEW** — read-own RLS preference storage; server-only updates.
- `docs/PHASE2_BILLING_MANAGEMENT.md` **NEW** — deployment and test notes.

## Safe application order

1. **Back up your repository first.** In Codespaces run `git status --short`. Do not force `git pull` over uncommitted Phase 1 changes; commit your verified changes or store them safely first.
2. Confirm Phase 1 overlay was applied. Read `docs/BILLING_PATCH_028.md` and check migration 028 and 029 in staging.
3. Review and apply `supabase/migrations/030_billing_change_preferences.sql` in a **staging** Supabase project before deploying Phase 2 app code. Applying the app code first will make `/dashboard/billing` return a safe 503 until migration 030 exists.
4. Unzip this patch at the **repository root** (`app/`, `docs/`, `supabase/` are directly underneath): `unzip -o HEYBIO_PHASE2_BILLING_MANAGEMENT_PATCH.zip -d .`.
5. Run `git diff --check`, `npm ci`, `npm run typecheck`, `npm run build`, then test provider flows in Razorpay **Test Mode** before production deployment.
6. In staging verify the tests below, monitor webhook reconciliation and errors, and deploy only with approved Razorpay credentials/configuration. `BILLING_JOBS_ENABLED` is **not** changed by this patch.

## Minimum end-to-end staging tests

- Manual payment success/failed/pending; receipt belongs to the authenticated user; no duplicate settlement or extra charge.
- Recurring authorization success, renewal and failed renewal; only verified paid periods receive entitlements.
- Manual paid membership: schedule Premium → Pro Max for next period; **no charge** occurs on scheduling; after expiry, new checkout starts only on explicit click.
- Active authorized auto-renewal: selecting next plan requires confirmation; Razorpay cancellation is requested for the current mandate; current paid access is preserved to its verified end where provider state permits; no new auto mandate without new user authorization.
- Cancellation is idempotent; a second request does not produce a second provider cancellation or payment. Test error/timeout and webhook races.
- A second user cannot view or modify another user's preference (RLS + API user scope). Cross-site POST should fail; rate-limit failure should fail closed.
- A payment that arrives late, chargeback, partial refund, or conflicting active period must be reconciled manually/through verified jobs before granting entitlements.
- Check mobile layout, screen reader labels, provider page dismissal, duplicated checkout taps and refresh.

## Known limits / not claimed as complete

- Scheduled plan change is **preference only**; NOT immediate upgrade/downgrade, mid-cycle proration or automated next-plan billing. No email/push reminder or backend scheduled auto-switch is added.
- The full application still needs Phase 1 staging verification, remaining admin/RLS/privacy review, HYPE DROP standalone handoff and final production security tests.
- No actual Razorpay charge, SQL migration execution on your database, or live production deployment was performed here. Do **not** activate billing jobs or use real payments solely based on ZIP static checks.
