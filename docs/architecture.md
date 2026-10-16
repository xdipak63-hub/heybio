# HEYBIO ↗ — System Architecture

> Internal engineering document · DIPO LABS · Reviewed against `heybio-main(4).zip` and the Intro Batch 03 integrated project on 16 October 2026. **Implementation status: in development; not production-certified.**

## 1. Purpose and non-negotiable principles

HEYBIO ("Your world. One link.") is an independent creator link-in-bio and mini-website SaaS product by DIPO LABS. A creator owns a profile and links; a visitor views published content; an authorized owner manages trust, operations and billing. HYPE DROP is a **separate application** and must not share HEYBIO's database or privileged credentials.

Principles: server-enforced permissions; no simulated payments or analytics; mobile-first accessibility; safe defaults; simple user journeys; atomic username ownership; payment access based only on verified provider records; no cross-account data leakage. Use the official brand palette `#FFFFFF`, `#F5F5F7`, `#1D1D1F`, `#BDF806`, and limited `#9FE7F5`.

## 2. Actual stack and runtime

| Layer | Current repository | Responsibility |
| --- | --- | --- |
| Frontend | React 19, TypeScript, CSS, Lucide | Marketing, onboarding, creator/public/admin UI |
| Router / SSR | React Router 7 | Loaders, actions, routes, server rendering |
| Runtime / hosting | Cloudflare Workers, Vite plugin, Wrangler | Request handling and scheduled jobs |
| Auth | Supabase Auth + `@supabase/ssr` | Identity and cookie sessions |
| Database | Supabase PostgreSQL + RLS | Profiles, links, billing, audit and support |
| Media | Supabase Storage (integration incomplete) | Avatars and uploaded content |
| Payments | Razorpay service/webhook modules | Recurring subscriptions (not live-verified) |

Worker entry is `workers/app.ts`; HTTP requests reach React Router's `createRequestHandler`. Scheduled runs invoke `runBillingJobs`. Local dev is `npm run dev`; typecheck `npm run typecheck`; build `npm run build`. `wrangler.jsonc` currently sets `BILLING_JOBS_ENABLED=false` and a five-minute cron.

## 3. Repository map

- `app/routes.ts`: canonical registration of accessible URLs. A `.tsx` file alone **does not** make a page available.
- `app/routes/marketing`, `auth`, `onboarding`, `dashboard`, `public`, `legal`, `admin`, `api`: route handlers.
- `app/components`: reusable interface parts; `app/styles`: styles and motion.
- `app/lib/auth`: verified sessions and admin/MFA guards; `app/lib/supabase`: client creation.
- `app/lib/payments`, `admin`, `security`, `validation`, `integrations`, `analytics`: domain services.
- `app/lib/plans.ts`: price and feature-definition source in application code.
- `supabase/migrations`: proposed database schema, policies and functions.
- `workers/app.ts`, `wrangler.jsonc`: Cloudflare Worker and runtime settings.
- `docs/`: internal operations manuals. These are not public legal-policy pages.

**Repository hygiene:** The archive contains a nested `heybio/` skeleton as well as the root application. Build and deploy from the **root containing `package.json` and `app/`**, not from that nested skeleton, unless the project is explicitly restructured.

## 4. Access boundaries

| Role | Allowed | Never allowed |
| --- | --- | --- |
| Visitor | View legitimate public profiles and open public links | Read private email, password/session, billing or admin data |
| Creator | Edit own profile, own links, appearance and view own eligible features | Read or change another creator's private records |
| Super admin | Perform permitted operations through protected, audited backend actions | Bypass verification, MFA or authorization through UI-only checks |
| Payment webhook | Submit signed event to an idempotent inbox | Directly grant premium access from an unverified browser callback |
| HYPE DROP | Receive minimal trusted proof of HEYBIO entitlement | Use HEYBIO service-role key or direct access to its private tables |

All mutations must check authentication, ownership/permission, input, and appropriate CSRF/origin protections. Restrict service-role credentials to the trusted server. Do not store them in client bundles or public `VITE_` variables.

## 5. Essential end-to-end journeys

**Creator:** homepage → claim username/intro → signup or login → verify email → choose/reserve username → select plan → create profile → choose appearance → add links → preview → publish/share. The proposed username is only a **hint** until the database confirms exclusive ownership. The real signup and onboarding flow must be tested; the intro does not reserve a username.

**Visitor:** request `/:username` → server resolves eligible public creator → returns safe public fields/links → user follows an external URL. Avoid leaking draft, suspended or deleted profiles. Use safe URL validation; do not expose privileged cookies on external redirects.

**Billing:** authenticated creator selects paid plan → backend creates tracked Razorpay subscription → user authorizes payment/mandate → signed webhook saved → background reconciliation applies database state → backend computes entitlements → features unlock. Cancellation, refunds and failures must update access correctly.

**Admin:** verified allowlisted identity + active DB role + MFA assurance level `aal2` → per-action permission check → audited mutation. An admin email match alone is insufficient.

## 6. Current implementation versus intended behavior

Present code includes homepage, intro, authentication routes, some onboarding, creator links/appearance, public profiles, portions of admin security and billing. **Not complete:** most admin pages, analytics, support APIs, several dashboard screens, HYPE DROP cross-product service, production-ready migrations, CI/test tooling. Some route files exist but are unregistered.

**Known blockers from source review:** `002_usernames.sql`, `004_social_links.sql`, `005_media.sql` reference nonexistent `profiles.is_published` / `profiles.is_suspended`; there are two migrations numbered `023`; several RLS/storage migrations are zero bytes. `profiles.username` and `usernames.username` currently risk becoming competing sources of truth. Do not treat these as harmless documentation issues.

## 7. Quality gates before declaring a feature ready

1. Syntax and TypeScript checks, production build, dependency lockfile consistency.
2. Route accessible and renders both mobile and desktop without horizontal overflow.
3. Keyboard/visible focus, appropriate contrast, `prefers-reduced-motion` support.
4. Unauthorized, unauthenticated, suspended and wrong-user tests return safe denials.
5. Required migrations tested from scratch against a disposable Supabase project; RLS verified as `anon`, `authenticated`, and trusted server.
6. Slow/failing network, repeated submissions, expired sessions and invalid payloads handled.
7. Errors logged without passwords, bearer tokens, raw payment credentials or sensitive PII.
8. Billing/creator/admin journeys tested end-to-end in staging before deployment.

**Change rule:** preserve working auth, billing and admin boundaries while improving UI. Treat README/marketing claims as aspirations until the matching backend passes these gates.
