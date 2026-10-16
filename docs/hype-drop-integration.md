# HEYBIO ↗ × HYPE DROP — Secure Integration Contract

> Internal product/security design · 16 October 2026 · **Cross-product authorization is not yet implemented end-to-end.**

## 1. Separate products, distinct ownership

HEYBIO is the creator link-in-bio/mini-website service. **HYPE DROP by DIPO LABS** is a separate launch-promotion product (countdown, scheduled reveal and release campaign concepts). HYPE DROP should retain its own application, authentication, storage and data. An HEYBIO subscription may make a creator *eligible* for HYPE DROP access, but it must not silently create a HYPE DROP account or give HYPE DROP broad access to HEYBIO's private database.

## 2. Current HEYBIO entitlement rules

| Plan | Monthly price | HYPE DROP eligibility |
| --- | ---: | --- |
| Free | ₹0 | Locked |
| Pro | ₹149 | Locked |
| Premium | ₹249 | Eligible only during verified active period |
| Pro Max | ₹499 | Eligible only during verified active period |

Prices and feature definitions live in `app/lib/plans.ts`. Runtime subscription status is checked in `app/lib/payments/subscriptions.server.ts` via `getBillingAccess`: the database subscription must have `status='active'` and a future `current_period_end`. Do not grant access because a plan is merely selected, payment UI returns success, or a stale cache says "premium".

## 3. What already exists—and what does not

`app/routes/api/hype-entitlement.ts` is registered as `/api/hype-entitlement`. It authenticates the HEYBIO user's session and returns `product`, `eligible`, `plan` and `validUntil` with no-store cache headers. **This is a first-party browser/session endpoint, not a secure cross-product SSO authorization protocol.** Its JSON response must not be accepted by HYPE DROP as proof from an arbitrary browser/client.

`app/lib/integrations/hype-drop.server.ts` is zero bytes. The HYPE DROP app, its own trusted verifier, token exchange, account linking, revocation notifications and launch management integration are not confirmed in this repository.

## 4. Recommended cross-product architecture (future implementation)

1. Creator visits HYPE DROP from HEYBIO and explicitly authorizes the connection when necessary.
2. HEYBIO backend verifies current user session and `getBillingAccess` using a trusted server database query.
3. HEYBIO issues a **short-lived, one-time, audience-bound** authorization code (not a browser-editable JSON entitlement). Keep only hashed/opaque code data where feasible.
4. HYPE DROP backend exchanges that code using mutually authenticated server-to-server communication or another reviewed OAuth/OIDC-compatible authorization mechanism.
5. The verifier checks issuer, audience, subject, expiry, nonce/replay prevention, actual active subscription and approved scopes.
6. HYPE DROP creates/links its own local account only after the user-approved flow; only minimal ID/eligibility data crosses the boundary.
7. On subscription cancellation, expiry, failed renewal, refund or administrative revocation, HYPE DROP revalidates/receives revocation promptly and removes privileged access under documented grace rules.

This section is an **implementation proposal**, not a description of code already present.

## 5. Security and privacy rules

- Never send `SUPABASE_SERVICE_ROLE_KEY`, payment webhooks or HEYBIO cookies directly to HYPE DROP.
- Never trust a client-provided `plan`, `userId`, `eligible` or `validUntil` flag.
- Use HTTPS, exact allowed redirect URIs, expiring codes, replay protection and strict audience checks.
- Minimize shared identity data; document consent, purpose and retention in public policies.
- Do not share creator private links, profile settings or revenue data by default.
- Handle clock skew, service outage, subscription grace and webhook delay conservatively; a failure must not issue new paid access.
- Record cross-product access grants/revocations in a protected audit trail.
- Keep HYPE DROP service infrastructure isolated, even if parent company and branding match.

## 6. UX requirements

The HEYBIO homepage may explain HYPE DROP's value, but must clearly say it is **a separate DIPO LABS product** and its access comes with active Premium/Pro Max. In dashboard/plan screens show locked state to Free/Pro and offer a legitimate upgrade path (never claim HYPE DROP is ready if backend connection is missing). Display accurate "connecting", "eligible", "access expired", "connection unavailable" and support states.

## 7. Required integration test matrix

- [ ] Free user denied even if they alter frontend JavaScript.
- [ ] Pro user denied, including old Pro entitlements/cached responses.
- [ ] Premium/Pro Max with active paid period accepted via **server validation**.
- [ ] Pending, cancelled, halted, refunded or expired access correctly handled.
- [ ] Expired/used code cannot be replayed.
- [ ] Code for another audience, product or account rejected.
- [ ] Account linking cannot attach one creator to another person's account.
- [ ] Provider or database outage returns safe actionable status.
- [ ] Revocation propagation meets defined maximum-delay objective.
- [ ] Real privacy notices and user support links are provided.

**Launch gate:** cross-product integration remains blocked until both services' owners approve the contract, tests, security review and privacy disclosures.
