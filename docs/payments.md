# HEYBIO ↗ — Subscriptions, Payments & Reconciliation

> Internal billing runbook · 16 October 2026 · **Never enable live billing solely on the basis of this document.**

## 1. Plan contract

| Plan ID | Label | Price / month | HYPE DROP | Key features from `app/lib/plans.ts` |
| --- | --- | ---: | --- | --- |
| `free` | Free | ₹0 | No | Public profile, basic links |
| `pro` | Pro | ₹149 | No | Free features + themes and advanced appearance |
| `premium` | Premium | ₹249 | Yes, only while paid status valid | Pro features + analytics and HYPE DROP |
| `pro_max` | Pro Max | ₹499 | Yes, only while paid status valid | Current feature set matches Premium; additional differentiation not defined |

`app/lib/plans.ts` is the application definition; `supabase/migrations/007_plans.sql` also seeds amounts in **paise**: 0, 14900, 24900 and 49900. Check that Razorpay plan IDs, actual checkout amounts, currency and tax treatment match the final published pricing before users are charged. Do not invent discount or refund guarantees.

## 2. Actual code and endpoints

- `app/routes/api/checkout.ts` — authenticated server checkout setup with CSRF/origin checks; creates a Razorpay subscription and persists a local tracking record.
- `app/routes/api/razorpay-webhook.ts` — POST webhook receiver; checks payload length, verifies signature of the **raw body**, requires provider event ID, queues signed event.
- `app/lib/payments/webhooks.server.ts` — accepts verified events via `enqueue_razorpay_event` RPC; duplicate IDs should be idempotent.
- `app/lib/payments/inbox-processor.server.ts` — claims events and performs provider-backed settlement steps.
- `app/lib/payments/subscriptions.server.ts` — computes current verified billing access from active subscription records.
- `app/lib/payments/billing-jobs.server.ts` and `workers/app.ts` — background queue work; **disabled** unless `BILLING_JOBS_ENABLED=true`.
- `app/routes/api/subscription-cancel.ts` — cancellation endpoint; must be validated in provider sandbox.
- `supabase/migrations/020_billing_functions.sql`, `023_webhook_inbox.sql`, `024_billing_settlement.sql` — database functions/queue and settlement; currently cannot be considered applied/verified.

`checkout.ts` currently asks Razorpay for **12 monthly billing cycles** (`totalCount: 12`). A plan called "monthly" does not automatically imply indefinite auto-renewal; this count and subsequent renewal/expiry communication must match user consent and business policy.

## 3. Payment lifecycle and source of truth

1. Display complete pricing, currency, recurring cadence, cancellation and refund rules *before* payment authorization.
2. Only a logged-in, email-verified creator can initiate checkout; reject unsupported plans and duplicates.
3. Server retrieves an active DB plan with an approved Razorpay `plan_…` identifier, creates a provider subscription, records its `sub_…` identifier and initial `created` state. If DB persistence fails, attempt to cancel orphaned provider subscription and flag manual reconciliation.
4. Browser opens provider-approved checkout and receives the required customer mandate/consent.
5. Razorpay sends signed webhook to `/api/razorpay-webhook`; signature and unique event ID must verify before recording.
6. Background worker claims event and reconciles subscription/payment facts with authoritative Razorpay state; never grant features based solely on a client success callback.
7. Server checks `status='active'` and unexpired `current_period_end`; Premium/Pro Max alone unlock HYPE DROP. Cancelled/expired/failed/nonactive access must not pass the gate.
8. Failed events are retried/reconciled with bounded retries, alerting and operator visibility; preserve raw provider event identifiers but limit sensitive payload retention as appropriate.

## 4. Status and cancellation handling

The subscriptions schema admits `created`, `authenticated`, `active`, `pending`, `halted`, `cancelled`, `completed`, `expired`. **Never equate `authenticated` or `pending` with paid, active access.** Document actual provider-to-local state mapping in settlement tests. `cancel_at_period_end` should reflect a confirmed provider operation and published policy; do not prematurely revoke access or permit unpaid grace silently.

Cancellation and refund are different actions. A subscription cancellation does not inherently constitute a refund. An operator-initiated refund must use verified provider APIs, maintain complete internal status/audit, and update entitlements only under the documented refund policy. Public `refund-policy` and `cancellation-policy` routes remain incomplete in the reviewed project and must be published before paid launch.

## 5. Webhook security and retries

- Accept only POST; require valid `x-razorpay-signature`, `x-razorpay-event-id` and raw payload within enforced size limit (code uses 512,000 bytes).
- Signature verification uses the **webhook secret**, not the normal API key secret.
- Keep the webhook endpoint accessible to Razorpay without relying on browser cookies, but restrict processing to cryptographically verified events.
- Record each provider event once; acknowledge duplicates safely. Be prepared for out-of-order delivery.
- Never log full bodies with sensitive fields or reveal provider secrets.
- Reject unknown/invalid event shapes and require operator review for settlement anomalies.
- Scheduled processing currently runs via Cloudflare cron every five minutes when enabled; `BILLING_JOBS_ENABLED` defaults to `false`. Do not turn it on before migration and sandbox verification.

## 6. Reconciliation and finance operations

Track provider subscription ID, internal user and plan, billing period, paid count, provider payment ID, amount/currency, event ID, reversal/refund metadata, processing attempts and audit timestamps. Reconcile daily in a controlled job or operator workflow. Separate gross collections, refunds and net revenue; never display estimated dashboard numbers as actual revenue. Monitor orphaned subscriptions, missing webhooks, repeated errors and periods that remain active past expiry.

## 7. End-to-end test matrix

- [ ] Free account stays free; no provider charge.
- [ ] Price mismatch or missing Razorpay plan ID fails safely.
- [ ] Checkout requires actual logged-in verified user and valid CSRF/origin.
- [ ] Mandate consent and 12-cycle schedule are clearly disclosed and accepted.
- [ ] Signed active event + provider confirmation produce paid entitlement.
- [ ] Forged/unsigned webhook and browser-only success produce **no** entitlement.
- [ ] Duplicate/out-of-order events and worker retries are idempotent.
- [ ] Failed renewal, cancelled/expired/halted status revoke access according to policy.
- [ ] Free/Pro can never access HYPE DROP; Premium/Pro Max require active paid period.
- [ ] Cancellation and refund results reconcile to provider, DB and UI.
- [ ] User support, policy links, webhook monitoring and safe rollback are ready.

## 8. Launch blockers currently known

Current migration conflicts (duplicate `023` and RLS issues), unavailable verified Razorpay plan IDs/configuration, disabled background processor, missing billing/admin UI portions, incomplete refund/cancellation policy pages and absent end-to-end tests prevent a credible production-ready declaration. Enable live charges only after these are resolved, the Razorpay merchant account is authorized, and operator/legal review is complete.
