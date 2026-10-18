# Security patch 034–036

| Item | What it does |
|---|---|
| 034_link_limit_guard.sql | DB trigger: max 100 links per profile, race-safe (advisory lock). |
| 035_refund_handling.sql | `apply_verified_refund` (service_role only). Partial refund: recorded, access kept. Full refund: entitlements revoked, one-time subscription expired. Replays/out-of-order events are no-ops; reconciliation cannot resurrect refunded access. |
| 036_abandoned_manual_orders.sql | `expire_stale_manual_orders` (72h), called by the 5-minute cron. |
| inbox-processor / verified-settlement | `refund.processed` / `refund.created` events re-fetch the payment from Razorpay and apply the refund amount it reports. |
| wrangler.jsonc | `BILLING_JOBS_ENABLED` = "true". |
| tests | 2 stale social-links tests updated to the versioned RPC / validated.links. |

## Required in Cloudflare (secrets, never commit)
SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET

## Razorpay webhook events to enable
payment.captured, payment.failed, refund.processed, refund.created, subscription.activated, subscription.charged, subscription.pending, subscription.halted, subscription.cancelled, subscription.completed, subscription.authenticated, subscription.paused, subscription.resumed

## Known limits
- Refunding a recurring (auto) subscription payment revokes the current access, but the customer/admin must also cancel the subscription in Razorpay, otherwise the next charge grants access again.
- Do not run 032 on the HEYBIO database (HYPE DROP project only).
