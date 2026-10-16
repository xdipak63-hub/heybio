# HEYBIO ↗ — Database, Migrations & RLS

> Internal database runbook · 16 October 2026 · **Do not apply the uncorrected migration folder to production.**

## 1. Data ownership model

Supabase Auth (`auth.users`) owns login identity. `public.profiles` relates one-to-one through the auth user's UUID; related links, social links, media, theme preferences, subscriptions, payment records, entitlement records, analytics events, moderation and support records must reference the appropriate owner. A creator may change only creator-editable fields. Billing/admin writes must go through restricted server or vetted database functions.

Keep `profiles.id` tied to `auth.users.id`; never let the browser supply another user's ID as authority. Use database constraints and RLS in addition to application authorization.

## 2. Migration inventory present in the ZIP

| Migration | Intended domain |
| --- | --- |
| `001_profiles.sql` | Profile table, auth-user trigger, profile RLS |
| `002_usernames.sql` | Username registry and reserved names |
| `003_links.sql` | Creator links and access controls |
| `004_social_links.sql` | Social links |
| `005_media.sql` | Media metadata |
| `006_themes.sql` | Appearance |
| `007_plans.sql` | Four plans and DB price/plan identifiers |
| `008_subscriptions.sql` | Razorpay subscription lifecycle |
| `009_payments.sql` | Payment records |
| `010_webhook_events.sql` | Webhook event tracking |
| `011_entitlements.sql` | Feature access records |
| `012_analytics.sql` | View/click event schema |
| `013_admin_roles.sql` | Privileged identities |
| `014_admin_audit_logs.sql` | Audit trail |
| `015_user_moderation.sql` | Moderation events |
| `016_support_tickets.sql` | Customer support data |
| `017_notifications.sql` | **Empty** |
| `018_storage_policies.sql` | **Empty** |
| `019_row_level_security.sql` | **Empty** |
| `020_billing_functions.sql` | Billing functions |
| `021_indexes_constraints.sql` | **Empty** |
| `022_moderation_security.sql` | Moderation guards |
| `023_admin_role_lockdown.sql` | Admin role restrictions |
| `023_webhook_inbox.sql` | Duplicate version `023` — must resolve |
| `024_billing_settlement.sql` | Settlement functions |
| `025_social_links_atomic_save.sql` | Social-link save function |

**Do not rename a migration already applied to a real database without first inspecting its migration history.** For a fresh disposable project, repair naming and SQL dependencies before the first apply. For an existing database, create safe forward-only remediation migrations.

## 3. Confirmed schema conflicts

- `001_profiles.sql` defines `account_status` (`active`, `suspended`, `deleted`) but **not** `is_published` or `is_suspended`. Later RLS expressions in `002`, `004`, `005` reference those missing columns. Fix by a documented status/publication model and matching policies; never just remove predicates and accidentally expose private content.
- `001_profiles.sql` has a `profiles.username` unique column, while `002_usernames.sql` also establishes `usernames.username`. Define **one authoritative allocation flow** with transactional uniqueness and consistent max length (`001` currently allows up to 30, `002` allows up to 25 characters).
- `001_profiles.sql` grants profile selection primarily to its owner, while public profile/usernames flows require carefully scoped public resolution. Do not enable broad anonymous reads of full profile rows to work around this.
- `017`, `018`, `019`, `021` are empty; storage restrictions, additional RLS and indexes are not automatically present.
- Two `023` version prefixes can conflict with conventional Supabase migration tracking; decide the correct sequence before applying.

## 4. Safe local/staging migration procedure

1. Create a **separate disposable Supabase project**, never experiment against live customer data.
2. Inventory all migration filenames and any previously applied versions; compare source schema assumptions.
3. Resolve duplicate numbering, missing referenced columns, username authority, and policies in **reviewed source code**.
4. Use the installed Supabase CLI (if configured) to apply repaired migrations to disposable local/staging environments; stop on the first error.
5. Verify the exact tables, policies, functions, indexes, grants, triggers and unique constraints actually created.
6. Test a newly registered Auth user: profile trigger creates exactly one owner profile.
7. Test an anonymous user cannot retrieve private tables, while legitimate published profile data is resolvable through deliberately limited server/public read paths.
8. Test each creator cannot select/update/delete another creator's rows.
9. Test invalid usernames, reserved names, concurrent claims, disabled profiles and account deletion semantics.
10. Compare SQL migration history and take a verified backup before any production promotion.

**Example read-only diagnostics** (run in Supabase SQL Editor only after checking the selected project):

```sql
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;

select tablename, policyname, roles, cmd
from pg_policies where schemaname = 'public'
order by tablename, policyname;

select table_name, column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;
```

These queries inspect only. They do not apply or repair the schema.

## 5. RLS and privileged operations

Use `auth.uid()`-based policies for owner records. An authenticated browser should never insert payments, set an admin role, mint entitlements or change subscription status. Permit server-side service-role operations **only** after application authorization; service-role bypasses RLS and is therefore high-risk. Keep `SUPABASE_SERVICE_ROLE_KEY` as an encrypted server secret, not a frontend setting.

Use explicit grants, RLS and field-specific validation. Ensure `security definer` functions have fixed `search_path`, limited `EXECUTE` grants, and no ability to mutate arbitrary user/account identifiers.

## 6. Backup, retention and change discipline

Define backup frequency, retention, restore testing and deletion policy based on the active Supabase plan and actual customer obligations; don't imply backups exist until verified. Log migration ID, operator, UTC timestamp, review and rollback/forward-fix plan. Avoid destructive migrations during release traffic. Preserve financial/audit records where law requires, and handle erasure without breaking financial integrity.

## 7. Acceptance checklist

- [ ] All migration versions are unique and ordered.
- [ ] Fresh schema applies cleanly in staging.
- [ ] No policy references absent columns/functions.
- [ ] Exactly one consistent username reservation source.
- [ ] Anonymous/creator/admin RLS threat-model tests pass.
- [ ] Storage bucket policies exist and are tested.
- [ ] Billing and admin records remain protected.
- [ ] Backups and restoration are tested before launch.
