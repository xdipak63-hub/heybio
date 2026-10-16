# HEYBIO ↗ — Privacy Engineering & Data Governance

> Internal engineering document · 16 October 2026 · **Not a substitute for the public Privacy Policy or legal advice.**

## 1. Privacy objective

Build a creator mini-website without turning visitor behavior or creator identities into unnecessary surveillance. Collect and retain the minimum data required for a legitimate feature, protect credentials/billing/admin information, explain public exposure, and provide feasible access/correction/deletion workflows. The public website policy is `app/routes/legal/privacy.tsx`; this file documents engineering responsibilities and must remain consistent with the actual deployment.

## 2. Data classification and inventory

| Category | Examples | Intended visibility |
| --- | --- | --- |
| Public creator content | Username, chosen display name/bio, avatar, published links/social handles | Visitors, only when genuinely published and not suspended |
| Account identity | Email, Auth UUID, verification/session state | Account holder and strictly authorized server operations |
| Security data | Session cookies, MFA, request/risk logs | Limited authorized backend operators; never public |
| Billing metadata | Razorpay subscription/payment IDs, plan, timestamps, refunds | Owner and creator's own limited billing view; provider as needed |
| Support/moderation | Ticket message, evidence, moderation notes | Account holder where appropriate; limited support/admin staff |
| Product analytics (planned) | Profile-view/click timestamps, limited referrer/device/country | Only when actually implemented with lawful notice/choice |
| Uploaded media | Creator-provided images or files | Access determined by publication and storage policy |

Do **not** store passwords outside Supabase Auth, card PAN, CVV, UPI PIN, banking credentials or OTPs in HEYBIO application tables/logs/support messages.

## 3. Processing map

- **Cloudflare Workers:** hosts server endpoints; may generate operational access logs and security metadata subject to deployment settings.
- **Supabase Auth/PostgreSQL/Storage:** identity sessions, creator-owned records, uploads and protected tables; data residency depends on actual project region.
- **Razorpay:** handles payments/mandates when checkout is enabled; HEYBIO should keep only the minimum provider transaction metadata needed for verification, support and lawful accounting.
- **External creator links:** destinations are independent third parties. Warn creators and visitors not to assume HEYBIO controls destination privacy or safety.
- **HYPE DROP:** separate DIPO LABS product; cross-product data transfer requires minimal-purpose user-approved integration and an independently secure verifier.

Verify provider agreements, regions, subprocessors and actual feature deployment before describing them as facts in public policies.

## 4. Public versus private profiles

Privacy is enforced in database queries, RLS, storage permissions and API responses—not only hidden buttons. A public username lookup should return only the limited required public fields and only for eligible published, active creators. The current migrations contain `profiles.account_status` but other files reference missing `is_published`/`is_suspended`; these must be reconciled before real publication. Avoid exposing account emails, account IDs unnecessarily, billing or moderation information in public HTML/JSON.

Public pages may be indexed or copied by third parties. Provide creator-visible warnings before users publish personal phone numbers, addresses or confidential links.

## 5. Analytics minimization

`012_analytics.sql` defines `profile_view` and `link_click` events with optional referrer domain, country code and device category. **However**, `app/routes/api/analytics.ts` and `app/lib/analytics/*` are empty in the reviewed ZIP. Do not claim a working analytics system or publish fabricated dashboards. Future implementation should avoid storing full visitor IP addresses, arbitrary query strings or durable tracking identifiers by default; filter bots, apply abuse controls, aggregate where useful and disclose retention/consent rules clearly.

## 6. Cookies, sessions and preferences

Essential session cookies may be set by `@supabase/ssr`. The app also uses temporary browser storage to preserve a desired username during onboarding. Cookie preference UI exists, but **a saved browser choice is not proof optional analytics/marketing scripts are technically blocked**. Before optional trackers ship, wire every such script to an appropriate consent gate, verify withdrawal works, and document a preference-reset path. Keep cookie attributes such as Secure, HttpOnly, SameSite and expiry appropriate to the live HTTPS domain.

## 7. Retention and user requests

Define approved retention schedules per category rather than inventing a single number: active profiles, uploaded media, support tickets, security logs, analytics events, billing/tax records and immutable admin audit records may have different justified periods. Include recovery/backup lifecycle and third-party data deletion constraints. Publish what is actually implemented.

**Request flow:** receive request at `dipolabs123@gmail.com` → identify request type → verify requester using a safe, proportionate process → scope account and data → assess lawful exceptions → perform/queue access, correction, withdrawal or deletion → confirm result without exposing others' data → securely record completion. A support email alone is not evidence these rights workflows are automated.

Never erase payment evidence needed for legal accounting or destroy shared audit integrity without a lawful and reviewed retention decision. For account deletion, consider profile unpublishing, media removal, provider retention and backup expiry separately.

## 8. Security/privacy controls

- Auth + server ownership/permission guards + RLS for account data.
- Service-role and provider secrets only server-side; no `VITE_` secret exposure.
- Strict upload type/size limits, randomized object paths, bucket policy and content-abuse checks.
- Safe URL handling to prevent phishing or malicious destinations.
- Logs scrubbed of tokens, passwords, secret API keys and unnecessary request details.
- Creator/public/admin data separated in queries and cache controls (`private, no-store` for sessions/billing).
- Data exports scoped to authenticated owner; administrator exports require permission and audit.
- External disclosure only for legitimate purpose and clear notice; never sell chat/support or private identity information as a default assumption.

## 9. Verification before launch

- [ ] Public Privacy, Cookie, Terms, refund/cancellation pages match reality and have approved revision dates.
- [ ] Statutory operator/grievance contact and user eligibility/age rules reviewed for actual jurisdictions.
- [ ] Supabase residency, backups, provider access and international transfers documented.
- [ ] New user sign-up, account deletion and privacy request workflows tested.
- [ ] Storage policies, analytics consent gates and admin audit verified.
- [ ] RLS tested against anonymous users, creators and unauthorized accounts.
- [ ] Incident/data-breach process linked to `docs/incident-response.md`.
- [ ] Applicable Indian DPDP/other privacy requirements reviewed with qualified counsel and updated as rules commence.

**Truthfulness rule:** distinguish what is technically implemented, what is planned and what requires future legal/operational verification. Privacy trust is built by real behavior, not reassuring copy alone.
