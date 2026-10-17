# Phase 5 — RLS and billing privilege verification

**No existing application code or SQL migrations are overwritten.**

Added `supabase/tests/phase5_rls_billing_privileges.test.sql` for staging checks after migrations 001–031. Execute with a database SQL client on a disposable/staging project, not blindly in production. A passing result means only the listed structural checks passed; it does NOT establish per-user RLS isolation, correct payment settlement, MFA effectiveness, or production readiness.

Also run existing `supabase/tests/rls.test.sql`, `admin-access.test.sql`, `billing-security.test.sql` and `billing-settlement.test.sql` using their documented prerequisites. Test actual authenticated sessions for user A/user B isolation, provider webhooks, and cancellation separately. No test was executed against a live database in the preparation environment.
