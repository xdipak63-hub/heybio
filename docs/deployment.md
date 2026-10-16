# HEYBIO ↗ — Development, Staging & Cloudflare Deployment

> Operator runbook · 16 October 2026 · **Do not deploy incomplete billing/security migrations.**

## 1. Current operational status

Project stack: React Router 7 SSR on Cloudflare Workers, Supabase Auth/PostgreSQL/Storage and planned Razorpay billing. `workers/app.ts` owns HTTP and scheduled handlers. `wrangler.jsonc` contains Worker name `heybio`, `nodejs_compat`, compatibility date `2026-10-10`, `workers_dev=true`, five-minute cron and `BILLING_JOBS_ENABLED=false`. This is a source inventory, not proof a live production deployment exists.

## 2. Environments

| Environment | Purpose | Data/payment handling |
| --- | --- | --- |
| Codespaces local | Development / UI testing | Use nonproduction Supabase project; payment provider test mode only |
| Staging | Integration, security, migration, responsive QA | Isolated DB, credentials and webhook endpoints |
| Production | Real public site | Separate Cloudflare secrets, real policies, monitored provider integrations |

Never point a test build at production DB by accident. Clearly label all environment-specific domains, redirect URLs and keys. Do not publish service-role keys, Razorpay secrets or DB connection passwords.

## 3. Local setup (Codespaces)

From the root directory containing `package.json` and `app/`:

```bash
cd /workspaces/heybio
node --version
npm ci
npm run typecheck
npm run build
```

Create a local `.dev.vars` **only in your machine/Codespace**; ensure it is git-ignored. Do not print its contents in screenshots or logs. At minimum, the app's SSR authentication expects:

```dotenv
SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
SUPABASE_PUBLISHABLE_KEY="YOUR_PUBLISHABLE_KEY"
```

Server-only integrations may later need `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET`; **do not enable payment features** until those are correctly provisioned and tested. The root `.dev.vars.example` is empty in the reviewed ZIP; this document provides a reference, not working credentials.

Run `npm run dev`, open the forwarded port (Vite config uses port `5173`) and test `/`, `/login`, `/signup` and a public profile. Login/signup SSR loaders call Supabase before rendering and may show a 500 if bindings are missing. If a 500 occurs, inspect the terminal log **with secrets redacted** instead of assuming CSS caused it.

## 4. Supabase prerequisites

1. Create a dedicated HEYBIO Supabase project in an appropriate region.
2. Copy only Project URL and publishable key into local development configuration.
3. Configure the Auth site URL and allowed redirect URLs, including `/auth/callback` for the active development/staging domains; test email verification and password reset end-to-end.
4. Review email provider configuration, sender reputation and abuse limits; do not claim email deliverability before testing.
5. **Blocker:** the current migration set has missing-column references and duplicate `023` versions. Fix and test migrations in a disposable project before applying them to the actual HEYBIO database.
6. Set up storage buckets/policies only after schema and security review; `018_storage_policies.sql` is empty.
7. Verify RLS, uniqueness, published-profile reads and blocked-user behavior from real browser sessions.

## 5. Cloudflare deployment sequence

1. Have a Cloudflare account and a reviewed custom domain/DNS plan; keep `workers.dev` as a test endpoint as appropriate.
2. Authenticate Wrangler using an authorized developer account (`npx wrangler login`) if needed.
3. Create environment-specific encrypted Worker secrets using Wrangler's interactive secret command (for example `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY`). Never pass secret values as CLI arguments that end up in shell history.
4. Configure public project URL/publishable key in the correct Worker environment. The publishable key is client-safe **but must still match the intended project**.
5. Verify `wrangler.jsonc` Worker bindings and cron behavior; keep `BILLING_JOBS_ENABLED=false` until billing migration/webhooks pass staging tests.
6. Run `npm run typecheck`, `npm run build`, and `npm run deploy` only when deployment readiness gates pass.
7. Configure route/custom domain, TLS and redirect URLs consistently. Test your actual production host, not only `*.github.dev`.
8. Confirm error reporting, safe logs, rollback approach, backups and access ownership before promoting traffic.

**Caution:** `npm run deploy` invokes `react-router build` and `wrangler deploy`, but package success alone doesn't certify Cloudflare bindings or application logic.

## 6. Release checklist

- [ ] Source code reviewed; `git status` understood; no `.dev.vars` or tokens committed.
- [ ] `npm ci`, typecheck, lint and build pass in clean environment.
- [ ] Route map matches enabled navigation; disabled/incomplete routes aren't promoted as working.
- [ ] Database migrations, grants and RLS tested from scratch on staging.
- [ ] Real signup/login, email verification, username claim and public profile tested.
- [ ] Mobile navigation, small-screen overflow, reduced-motion and screen reader basics checked.
- [ ] Provider webhooks and recurring/subscription state verified in sandbox before live billing.
- [ ] Legal/support/refund disclosures match actual product operations.
- [ ] Backups, observability, alerts and operational access tested.

## 7. Rollback and incident safety

Record release commit, Worker version, schema version and operator. If a UI-only deploy breaks, restore a known-good Worker/build without reversing completed payments. If a migration or payment reconciliation is implicated, stop relevant jobs, preserve event records and use a planned forward fix—**never** truncate payment or audit tables as a quick rollback. See `docs/incident-response.md`.

## 8. Current repo gaps

The reviewed `scripts/verify-env.ts`, `scripts/smoke-test.ts`, `scripts/check-migrations.ts`, and nested CI workflow YAMLs are empty; do not assume automated release gates exist. The exact Cloudflare production account, DNS ownership, RLS state, provider approval and rollback automation have **not** been verified from the ZIP.
