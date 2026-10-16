# HEYBIO ↗ — Owner / Admin Security

> Restricted operational specification · 16 October 2026 · **Code review does not prove deployed security.**

## 1. Security objective

The `/admin` area is an owner control plane, not a creator upgrade. It can expose sensitive account, moderation, billing and platform information. A hidden URL, a frontend check or matching email alone must **never** authorize access. Deny by default and re-check each sensitive server request.

## 2. Existing guard chain

The repository defines `requireAdmin(request, context, permission)` in `app/lib/auth/require-admin.server.ts`. Its intended checks are:

1. `requireUser` authenticates a real Supabase user using `auth.getUser()`, requires confirmed email and an active profile.
2. `hasVerifiedAdminEmail` compares the verified account email to a small private allowlist in `app/lib/admin/permissions.server.ts`.
3. `requireMfa` checks Supabase's assurance level; privileged access requires `aal2` (not merely that MFA enrollment exists).
4. `admin_roles` contains an active `super_admin` assignment for the same user ID.
5. The specific permission is checked against the server-side permission set.

The database migration `013_admin_roles.sql` also restricts admin identity on insertion/update; `023_admin_role_lockdown.sql` adds protections. Their effectiveness is **pending successful migration testing**. Never interpret account metadata like `is_admin: true` from the browser as an authority source.

## 3. Permissions and route inventory

`AdminPermission` presently enumerates `dashboard.read`, `users.read`, `users.moderate`, `users.delete`, `subscriptions.read`, `payments.read`, `payments.refund`, `revenue.read`, `hype_access.manage`, `audit.read`, `settings.manage`.

`app/routes.ts` currently registers the `/admin` parent and overview index; most `app/routes/admin/*.tsx` screens are empty or unregistered. Consequently **do not claim** that user management, refunds, moderation queues or finance tools are fully available even though names exist.

For every new admin route, create a server loader/action that invokes `requireAdmin` with the least applicable permission; never rely on the sidebar to hide unauthorized actions. Separate read and write permissions when expanding beyond the current super-admin-only model.

## 4. Protected workflows

**User suspension:** fetch target by authoritative ID → display scope and reason → request confirmation → enforce permission, origin/CSRF and rate limits → commit status and moderation record in one consistent operation → write an immutable audit event → invalidate affected sessions/public profile access as necessary. Prevent deleting the only recovery administrator by mistake.

**Refund:** verify real Razorpay payment/subscription and refund eligibility → show amount, currency, provider identifier and impact on entitlements → require explicit confirmation and a unique idempotency key → server executes provider action → record provider-confirmed result → audit. Never mark a refund as succeeded based solely on a browser callback.

**Role change:** there is currently no safe self-service admin-grant flow to assume. Only an already trusted operator with independently verified authority should be able to provision/revoke allowlisted admin records. Emergency access must use a documented recovery process.

**Export and support:** display only necessary fields; redact payment identifiers and contact data when possible; log privileged exports and prevent unrestricted downloads.

## 5. Audit trails

`014_admin_audit_logs.sql` defines append-only audit records and blocks update/delete triggers. Audit each sensitive action with timestamp, actor UUID, action, target type/ID, outcome and a safe request correlation ID. Never record passwords, OTPs, bearer tokens, raw webhook secrets or card/bank numbers. Protect audit reading behind `audit.read`, and ensure server writes use authorized paths.

Where a multi-table admin mutation can partly fail, design transaction/RPC semantics to make state and audit outcomes consistent. Never fake an audit success.

## 6. Threat model and secure controls

- **Stolen session:** require MFA for admin routes, short session lifetime where practical, sign-out/device revocation, suspicious-login review.
- **Privilege escalation:** server-side permission checks and DB grants; no user-editable admin flag.
- **Cross-account access:** validate target UUID, user status, permission and scoped query; do not trust POST form IDs alone.
- **CSRF and injection:** same-origin/CSRF protection, strict schema validation, parameterized DB interactions.
- **Credential leakage:** secrets only in Cloudflare Worker secrets / local ignored `.dev.vars`; rotate immediately if exposed.
- **SSRF/open redirect/content abuse:** validate external URLs and uploads; avoid rendering unsafe HTML.
- **Admin UI deception:** distinguish queued, failed, pending and confirmed states; confirm destructive actions.

## 7. Required tests before enabling admin operations

| Scenario | Expected outcome |
| --- | --- |
| Anonymous `/admin` request | Redirect/deny; no private data |
| Normal verified creator | HTTP 403 or safe denial |
| Allowlisted email but not verified | Denied |
| Allowlisted user without `aal2` | Denied |
| `aal2` but missing/inactive DB admin role | Denied |
| Active super admin with correct permission | Allowed only after server check |
| Forged browser role/header | Denied |
| Missing or invalid origin on mutation | Denied |
| Repeated refund/moderation request | Idempotent or safely rejected |
| Audit DB unavailable | Sensitive action fails safely or follows reviewed consistency plan |

## 8. Go-live checklist

- [ ] Production admin allowlist reviewed privately (do not post accounts in public docs).
- [ ] MFA recovery codes protected and recovery workflow tested.
- [ ] `admin_roles` schema, grants and RLS tested in staging.
- [ ] Administrative routes/actions individually registered and guarded.
- [ ] Audit and moderation records survive retry and failure conditions.
- [ ] Privileged access monitoring and emergency disable process active.
- [ ] No simulated finance metrics, users or revenue displayed as actual data.
