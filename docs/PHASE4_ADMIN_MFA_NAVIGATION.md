# HEYBIO Phase 4 — admin MFA navigation

Source baseline: heybio-main(4).zip with Phase 1, Phase 2, Phase 3, Phase 3B overlays.

Only one existing file changed:
- app/lib/auth/require-admin-page.server.ts

Issue: AAL1 admin users with missing MFA were redirected to homepage rather than MFA verification.
Fix: redirect only the exact MFA-required denial to /auth/mfa-verify; preserve session cookies.
Other 401/403 denials remain homepage redirects. Server admin authorization and MFA checks unchanged.

Test on staging:
1. Signed-out admin page -> homepage/login behavior unchanged.
2. Signed-in non-admin -> denied; not sent to MFA verification.
3. Approved admin without AAL2 -> MFA verify page; admin content remains blocked.
4. Approved admin with AAL2 -> admin page.
5. Supabase outage -> 503; not redirected as successful login.
6. Validate cookie refresh and no redirect loops.
Run npm ci, npm run typecheck, npm run build. Do not deploy until tests pass.
