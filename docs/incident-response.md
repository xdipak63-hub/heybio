# HEYBIO ↗ — Incident Response Runbook

> Internal operational procedure · DIPO LABS · 16 October 2026 · Practice before launch.

## 1. Mission

Protect people, data, creator pages and money. Restore trustworthy service as quickly as safely possible, preserve evidence, and communicate accurately. **Do not invent a root cause or say funds/data are safe until verified.** Emergency security measures take precedence over animations, feature releases or convenience.

## 2. Severity guide (working definitions)

| Severity | Examples | Response |
| --- | --- | --- |
| SEV-1 Critical | Credentials compromised; mass data exposure; incorrect financial charges; broad privilege escalation | Immediate containment, involve service owners and relevant providers |
| SEV-2 High | Login outage; public pages unavailable broadly; webhook backlog causing incorrect access | Urgent investigation and customer-impact assessment |
| SEV-3 Medium | A single noncritical feature unavailable; localized UI failure | Prioritized repair with safe workaround |
| SEV-4 Low | Cosmetic issue, minor copy error | Normal backlog, unless trust/legal implications arise |

Incident lead: designated DIPO LABS owner/operator. Also assign an engineering responder, communicator and scribe as team size permits. Maintain protected contacts for Cloudflare, Supabase, Razorpay, domain registrar and authorized backup administrator outside the application itself.

## 3. First-response checklist

1. Record UTC start time, discovery source, symptoms, affected route/version and incident lead.
2. Determine whether the issue affects **confidentiality**, **integrity** or **availability**—and whether customer money or accounts are at risk.
3. Stabilize: isolate suspect credentials, disable dangerous jobs or routes, pause checkout if finance integrity is uncertain, or roll back a UI-only deploy as appropriate.
4. Preserve original logs, event IDs, timestamps, request IDs, deployment version and database evidence with restricted access. Do not share secrets in screenshots.
5. Check Cloudflare application errors, Supabase availability/auth/database, webhook intake/inbox, DNS, and third-party provider status.
6. Publish a brief factual incident status via an appropriate communication channel when users are materially affected; avoid unsupported ETAs.
7. Continue investigation and record each action/decision for later review.

## 4. Service-specific playbooks

**Signup/login 500:** confirm route and recent deployment; inspect Worker log with tokens masked; check `SUPABASE_URL`, publishable key, Cloudflare env bindings, Supabase Auth redirects and API health. Do not publish service-role credentials as a workaround. If no real data is at risk, local development can stay in diagnostic mode.

**Suspected database exposure:** revoke impacted access, disable vulnerable endpoints, inspect grants/RLS and Cloudflare logs, rotate exposed keys and session credentials as appropriate, snapshot evidence, assess data categories and affected population, consult notification/legal obligations.

**Incorrect subscriptions/access:** stop checkout or `BILLING_JOBS_ENABLED` processing as needed; preserve signed Razorpay event inbox, provider subscription IDs and existing ledger; reconcile with Razorpay's authoritative API. Never set all subscriptions to active or delete event history. Communicate payment consequences to users.

**Admin account compromise:** revoke sessions, freeze privileged actions, rotate impacted credentials, review admin audit logs, restore access through independently verified administrator recovery. Check for unauthorized refunds, user deletions, support exports and role grants.

**Malicious creator link/content:** quarantine exact impacted public content, preserve a safe abuse report/audit record, review impersonation/malware indicators and restore affected innocent creators after confirmation. Avoid mass deletion without evidence.

**Cloudflare outage / release regression:** compare current Worker build with prior known good, verify environment-specific secret bindings, deploy reviewed rollback where feasible, and ensure migrations/payment writes remain consistent.

## 5. Evidence discipline

Prefer structured UTC timestamps, correlation IDs, provider event IDs, migration versions and state transitions. Retain necessary evidence in restricted access storage for a defined period. Avoid recording raw session cookies, passwords, OTPs, secret keys, payment credentials or unnecessary visitor personal data. Use redacted exports for external support.

## 6. Communications

Internal updates should contain current severity, verified impact, mitigation, next check-in and owner. External notices should specify affected feature, start/restore windows where known and a genuine support channel: `dipolabs123@gmail.com`. Legal/privacy breach notices must follow applicable law, fact-finding and professional advice; this document does not set jurisdiction-specific deadlines.

**Sample holding update:** "We're investigating an issue affecting HEYBIO sign-in. We have paused affected changes while we verify the cause. We will share another update when we have confirmed information."

## 7. Restoration and post-incident review

Require evidence of root cause and a verified fix before reopening financial/admin actions. Test real signup, public profiles, privilege boundaries, webhook processing, cancellation and rollback/restore where impacted. Reconcile all stuck payment events; confirm creator data integrity. After recovery, write a blameless report: timeline, customer impact, technical cause, safeguards that failed, remediation owner, deadline and proof of completed tests.

## 8. Preparation checklist

- [ ] Access to Cloudflare/Supabase/Razorpay recovery methods tested.
- [ ] Emergency owner/admin MFA and backup recovery documented securely.
- [ ] Monitoring, alert routing and provider escalation contacts confirmed.
- [ ] Deploy/rollback and database restore exercises completed.
- [ ] Billing event replay and idempotent reconciliation tested in staging.
- [ ] Incident template and status-update channel ready.
- [ ] Data breach response obligations reviewed with qualified counsel.
