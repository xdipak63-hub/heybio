
<div align="center">

# HEYBIO ↗

### YOUR WORLD. ONE LINK.

**The next-generation creator identity and link-in-bio platform.**

Built with purpose. Designed for expression.

**A product of DIPO LABS**

---

**Cloudflare Workers · React Router · TypeScript · Supabase · Razorpay**

**Project status:** Active Development

</div>

---

## 01. Welcome to HEYBIO

HEYBIO is a modern, mobile-first link-in-bio SaaS platform built to help creators, entrepreneurs, professionals, artists, businesses and communities establish a beautiful digital presence.

It brings links, creative identity, social presence, profile customization and audience insights together into one destination.

### Our vision

Make building and sharing a digital identity simple, expressive and accessible.

### Our mission

Deliver a beautiful, secure and reliable platform that allows anyone to create their own space on the internet.

### Our philosophy

- Simplicity without sacrificing power.
- Premium design without unnecessary complexity.
- Privacy and security by design.
- Exceptional mobile experiences.
- Accessible and inclusive interfaces.
- A strong foundation for future growth.
- Transparent subscriptions and billing.
- Performance as a core product feature.

---

## 02. Product Identity

| Property | Value |
|---|---|
| Product | HEYBIO |
| Brand | HEYBIO ↗ |
| Parent company | DIPO LABS |
| Category | Creator platform / Link-in-bio SaaS |
| Tagline | Your world. One link. |
| Primary language | English |
| Primary deployment | Cloudflare Workers |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Billing provider | Razorpay |
| Companion product | HYPE DROP |
| Development stage | In progress |

### Design system

The HEYBIO interface follows a premium editorial design style.

#### Core colors

| Token | Value | Purpose |
|---|---|---|
| Primary Lime | `#BDF806` | Brand highlights and CTAs |
| Dark Ink | `#1A1B19` | Main text and dark surfaces |
| Paper | `#F9F9F6` | Primary background |
| White | `#FFFFFF` | Cards and surfaces |
| Ice Blue | `#D9EEFF` | Supporting backgrounds |
| Neutral Grey | `#777A73` | Secondary text |

### Typography

- Display: Space Grotesk
- Body: DM Sans
- Fallback: System sans-serif

### Design principles

1. Mobile-first layouts.
2. Strong visual hierarchy.
3. Accessible contrast and focus states.
4. Generous whitespace.
5. Consistent spacing and typography.
6. Rounded, intentional UI elements.
7. Lightweight animations.
8. Reduced-motion support.
9. Clear navigation and interaction feedback.
10. Meaningful loading, empty and error states.

---

## 03. Technology Stack

### Frontend

- React
- React Router
- TypeScript
- CSS design tokens
- Responsive CSS
- Lucide icons

### Backend

- Cloudflare Workers
- React Router server-side rendering
- Server-side actions and loaders
- Cloudflare runtime bindings

### Data and authentication

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- PostgreSQL Row Level Security
- Versioned database migrations

### Payments

- Razorpay subscriptions
- Server-side payment verification
- Signed webhook verification
- Subscription lifecycle management
- Payment reconciliation

### Developer tooling

- Node.js
- npm
- Vite
- Wrangler
- TypeScript
- Git
- GitHub Codespaces

### Deployment

- Cloudflare Workers
- HTTPS
- Environment-specific configuration
- Cloudflare observability
- Custom domain support

Dependency versions must remain compatible with the official framework and Cloudflare integrations.

---

## 04. Product Modules

HEYBIO is organized into independent application modules.

### 4.1 Marketing Website

**Status: In development**

Includes:

- Homepage
- Product features
- Creator showcase
- Template previews
- Pricing section
- HYPE DROP promotion
- FAQs
- About HEYBIO
- About DIPO LABS
- Help Center
- Legal pages
- Premium footer

### 4.2 Authentication

**Status: Planned**

Includes:

- Account registration
- Email verification
- Secure login
- Password reset
- Session handling
- Logout
- Account recovery
- MFA for privileged accounts

Authentication decisions must be enforced on the server, not only in React components.

### 4.3 Creator Onboarding

**Status: Planned**

Proposed flow:

1. Register an account.
2. Verify email.
3. Choose a plan.
4. Select an available username.
5. Create a profile.
6. Select a starting template.
7. Add links.
8. Publish the profile.

Usernames must be validated and reserved atomically to prevent duplicate registrations.

### 4.4 Creator Dashboard

**Status: Planned**

The dashboard will provide:

- Overview
- Link management
- Drag-and-drop ordering
- Profile appearance
- Image uploads
- Theme selection
- Social integrations
- Profile preview
- Share tools
- Audience insights
- Billing and subscriptions
- Account settings
- Security settings
- HYPE DROP entry point

All user-owned data must be protected through server-side ownership checks and database RLS.

### 4.5 Public Creator Profiles

**Status: Planned**

Public profiles will include:

- Unique username routes
- Avatar and bio
- Custom themes
- Social links
- Creator links
- Responsive design
- SEO metadata
- Accessible layouts
- Privacy-aware analytics

Public pages must never expose private account, payment or administrative information.

### 4.6 Super Admin

**Status: Planned**

The private administration application will be available under:

`/admin`

Authorized administrator email identities:

- `xdipak63@gmail.com`
- `dipak7rabari@gmail.com`

These identities must be verified and mapped to approved Supabase Auth user IDs.

An email string alone is not proof of administrator privileges.

#### Admin capabilities

- Overview dashboard
- Total registered profiles
- Active and suspended profiles
- User search and moderation
- User blocking and unblocking
- Subscription monitoring
- Payment and revenue reports
- Refund monitoring
- HYPE DROP entitlement management
- Support and abuse reports
- Audit logs
- Security settings

#### Mandatory protections

- Verified administrator identity
- Server-side role authorization
- Multi-factor authentication
- Session verification
- Least-privilege database access
- Audited sensitive actions
- Confirmation before destructive actions
- Protection against unauthorized API access
- Rate limiting
- Safe deletion and account recovery policies

No privileged admin operations may rely exclusively on frontend checks.

---

## 05. Subscription Plans

HEYBIO uses four planned subscription tiers.

| Plan | Monthly Price | HYPE DROP |
|---|---:|---|
| Free | ₹0 | Locked |
| Pro | ₹149 | Locked |
| Premium | ₹249 | Included |
| Pro Max | ₹499 | Included |

### Free

Designed for getting started.

### Pro

Designed for users who need additional customization and creator tools.

### Premium

Includes advanced creator capabilities and HYPE DROP access.

### Pro Max

Includes the highest product tier and HYPE DROP access.

### Important billing rules

- The Free plan does not require a recurring subscription.
- Paid plans require explicit customer authorization.
- Successful checkout display is not sufficient payment proof.
- Verified provider events determine subscription state.
- Billing state and feature entitlements are maintained server-side.
- Cancellation must stop future renewals according to provider and subscription rules.
- Expired or revoked entitlements must not continue granting paid access.
- Refunds, failures, retries and delayed webhook delivery must be handled.
- Customers must be shown applicable taxes and renewal terms before payment.

Pricing and features must ultimately be enforced through the database-backed plan and entitlement system.

---

## 06. HYPE DROP Integration

HYPE DROP is a separate product by DIPO LABS.

It is promoted inside the HEYBIO marketing website and linked from the creator dashboard.

### Eligibility

| HEYBIO Plan | HYPE DROP Access |
|---|---|
| Free | No |
| Pro | No |
| Premium | Yes |
| Pro Max | Yes |

### Security architecture

HYPE DROP access must be authorized by a trusted backend integration.

The integration must:

1. Identify the authenticated HEYBIO user.
2. Validate the current subscription.
3. Resolve the user's active entitlements.
4. Confirm HYPE DROP eligibility.
5. Issue or validate a short-lived access credential.
6. Reject expired, revoked or invalid credentials.
7. Avoid exposing backend secrets in the browser.

Never grant access solely because a frontend request contains a paid plan name.

### Product separation

HEYBIO and HYPE DROP must maintain clear application and security boundaries.

Shared access does not require sharing unrestricted database privileges.

---

## 07. Project Directory Structure

The planned HEYBIO structure is:

```text
heybio/
│
├── app/
│   ├── root.tsx
│   ├── routes.ts
│   ├── entry.server.tsx
│   │
│   ├── routes/
│   │   ├── marketing/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── dashboard/
│   │   ├── public/
│   │   ├── admin/
│   │   ├── support/
│   │   ├── legal/
│   │   └── api/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── marketing/
│   │   ├── creator/
│   │   ├── billing/
│   │   ├── admin/
│   │   └── shared/
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   ├── auth/
│   │   ├── payments/
│   │   ├── admin/
│   │   ├── analytics/
│   │   ├── integrations/
│   │   ├── validation/
│   │   └── security/
│   │
│   ├── styles/
│   └── types/
│
├── workers/
│   └── app.ts
│
├── supabase/
│   ├── migrations/
│   ├── seeds/
│   └── tests/
│
├── public/
│   ├── images/
│   └── fonts/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── security/
│
├── scripts/
├── docs/
├── .github/
│   └── workflows/
│
├── .env.example
├── .dev.vars.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── react-router.config.ts
├── wrangler.jsonc
└── README.md
```

This is the target architecture.

Not every listed file or feature is currently implemented.

---

## 08. Architectural Principles

### Clear separation of responsibilities

Keep the following separate:

- UI components
- Route definitions
- Request handlers
- Validation schemas
- Authentication
- Authorization
- Data access
- Billing operations
- Analytics
- External integrations

### Server-only modules

Sensitive implementations should use clearly named server-only modules.

Examples:

```text
require-user.server.ts
require-admin.server.ts
razorpay.server.ts
webhooks.server.ts
audit.server.ts
```

### Shared contracts

Shared schemas and types should define:

- Input validation
- API response shapes
- Database models
- Billing statuses
- Role permissions
- Feature entitlements

### Explicit access control

A working UI does not establish authorization.

Every protected server operation must independently verify the caller.

### No hard-coded secrets

No private key or privileged service credential may be embedded in client-side code.

### Test critical behavior

Tests are mandatory for:

- Identity verification
- Ownership enforcement
- Admin authorization
- Payments
- Webhook replay handling
- Entitlement changes
- Account deletion

---

## 09. Local Development

### Requirements

Install:

- A current supported Node.js LTS release
- npm
- Git
- Cloudflare Wrangler

Use a Node.js version supported by the installed React Router, Vite and Wrangler versions.

### Clone project

```bash
git clone YOUR_REPOSITORY_URL
cd heybio
```

Replace `YOUR_REPOSITORY_URL` with the actual repository URL.

### Install dependencies

```bash
npm install
```

For reproducible installations after a lockfile is committed:

```bash
npm ci
```

### Generate Cloudflare types

```bash
npm run cf-typegen
```

### Check TypeScript

```bash
npm run typecheck
```

### Start development server

```bash
npm run dev
```

Default local address when using the configured development port:

```text
http://localhost:5173
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

The commands above assume their corresponding package scripts are present.

---

## 10. Environment Variables

HEYBIO separates public configuration from sensitive credentials.

### Public configuration

Examples of non-secret configuration:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
APP_URL=
```

Supabase's public/publishable key may be exposed to browser code when proper authorization and RLS are enabled.

### Private configuration

Examples:

```env
SUPABASE_SERVICE_ROLE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
HYPE_DROP_SHARED_SECRET=
```

Variable names must match the final implementation.

Some names may change when the relevant integration is built.

### Important

Do not put actual credentials in this README.

Do not commit:

```text
.env
.env.local
.dev.vars
.dev.vars.*
```

Use example files with placeholders only.

For local Cloudflare development, configure compatible secrets through the supported local environment mechanism.

For deployed Workers, use Cloudflare encrypted secrets.

Example:

```bash
npx wrangler secret put RAZORPAY_KEY_SECRET
```

The Razorpay Key ID and other configuration values must be stored according to their actual sensitivity and runtime use.

---

## 11. Cloudflare Deployment

HEYBIO is designed for deployment to Cloudflare Workers.

### 11.1 Authenticate

```bash
npx wrangler login
```

### 11.2 Validate application

```bash
npm run typecheck
npm run build
```

### 11.3 Deploy

```bash
npm run deploy
```

### 11.4 Configure production

Before enabling public traffic:

- Set the production domain.
- Verify HTTPS.
- Configure approved secrets.
- Configure Supabase redirect URLs.
- Configure Razorpay webhook endpoints.
- Apply database migrations.
- Test protected routes.
- Test failed and successful subscription events.
- Review runtime logs.
- Verify mobile behavior.

### Domain strategy

The final domain and public username URL structure will be selected before creator profiles launch.

Example routing goals:

```text
/                 Marketing homepage
/login            Authentication
/signup           Registration
/dashboard        Creator dashboard
/admin            Super Admin
/pricing          Pricing
```

Public username routing must not conflict with application routes.

Reserved names must include protected application and system paths.

### Production environments

Recommended:

- Local development
- Preview / staging
- Production

Staging and production must not share unrestricted credentials or customer payment test data.

---

## 12. Database Architecture

The production database will use PostgreSQL through Supabase.

### Planned tables

```text
profiles
usernames
links
social_links
profile_media
themes
plans
subscriptions
payments
webhook_events
entitlements
analytics_events
admin_roles
admin_audit_logs
user_moderation
support_tickets
notifications
```

### Database requirements

- UUID identifiers where appropriate
- Foreign key constraints
- Unique username constraints
- Appropriate indexes
- Timestamp consistency
- Database migrations
- Row Level Security
- Audited privileged operations
- Transactional critical updates
- Reliable webhook deduplication

### Ownership rules

Users may modify only resources they are authorized to own or manage.

### Service role

Privileged database access must remain server-side.

Never expose a Supabase service-role or secret key to browser clients.

### Migrations

All schema changes must be tracked in version-controlled SQL migration files.

Avoid manually modifying production schema without recording the equivalent migration.

---

## 13. Authentication and Authorization

The authentication system will use Supabase Auth.

### Authentication requirements

- Verified account ownership
- Secure session handling
- Safe redirects
- Email verification
- Password recovery
- Appropriate session expiration
- Logout and session revocation
- Secure callback handling

### Creator authorization

Each authenticated creator must be restricted to their permitted data.

### Administrator authorization

Super Admin requires:

1. Authenticated session.
2. Verified identity.
3. Explicit administrator role.
4. Mandatory MFA.
5. Server-side authorization for each request.
6. Audit logging for privileged changes.

### Admin account policy

The initial administrator identity allowlist is:

```text
xdipak63@gmail.com
dipak7rabari@gmail.com
```

Do not rely on this list as the only security control.

Map approved identities to verified authentication user IDs and protected database roles.

---

## 14. Razorpay Payment Architecture

Razorpay will process authorized subscriptions.

### Planned payment flow

```text
Creator selects a paid plan
            |
            v
Authenticated server request
            |
            v
Validate selected plan
            |
            v
Create Razorpay subscription
            |
            v
Customer authorizes payment
            |
            v
Razorpay sends webhook
            |
            v
Verify webhook signature
            |
            v
Check event identity and state
            |
            v
Update database transactionally
            |
            v
Recalculate entitlements
            |
            v
Creator receives paid access
```

### Security requirements

- No private Razorpay secret in browser code.
- Validate provider signatures.
- Verify signatures against the required raw request payload.
- Deduplicate webhook events.
- Handle out-of-order delivery safely.
- Keep local subscription records synchronized.
- Reconcile unexpected provider/database differences.
- Never activate paid access using only frontend callback data.

### Subscription states

The backend must explicitly support relevant provider states such as:

- Created
- Authentication pending
- Active
- Payment pending
- Paused or halted
- Cancelled
- Completed
- Expired

The internal state model must match documented Razorpay behavior.

### Cancellation

Customers must be able to request cancellation according to the displayed subscription terms.

Account deletion and subscription cancellation must be coordinated to avoid accidental future billing.

### Financial reporting

Admin revenue figures must distinguish between:

- Payments received
- Refunds
- Adjustments
- Net collected amount
- Subscription status
- Provider settlement information when available

Displayed financial numbers must come from verified records.

---

## 15. Feature Entitlements

Paid features must be resolved through a centralized entitlement service.

### Example

```text
Free
  -> HEYBIO basic access
  -> HYPE DROP denied

Pro
  -> HEYBIO Pro access
  -> HYPE DROP denied

Premium
  -> HEYBIO Premium access
  -> HYPE DROP allowed

Pro Max
  -> HEYBIO Pro Max access
  -> HYPE DROP allowed
```

Access must be recalculated when:

- A payment succeeds.
- A payment fails.
- A subscription expires.
- A subscription is cancelled.
- A refund changes eligibility.
- An administrator performs an authorized adjustment.

Frontend visibility controls do not replace backend authorization.

---

## 16. Analytics

HEYBIO plans to provide useful, privacy-aware analytics.

### Creator metrics

- Profile visits
- Link clicks
- Traffic trends
- Popular links
- Historical engagement

### Privacy principles

- Minimize collected data.
- Avoid unnecessary personal identifiers.
- Provide clear privacy disclosures.
- Apply retention limits.
- Restrict analytics access by ownership.
- Protect systems against artificial event inflation.

Analytics counts should not be represented as unique people unless the measurement methodology supports that claim.

---

## 17. Application Security

Security is a core architectural requirement.

### Access security

- Authenticated protected routes
- Server-side authorization
- Role-based access control
- Row Level Security
- MFA for administrators
- Session validation

### Input security

- Schema validation
- Username validation
- URL validation
- File type restrictions
- File size restrictions
- Safe output handling
- Protection against malicious redirects

### Payment security

- Signed webhooks
- Request authenticity checks
- Event deduplication
- Secure secret storage
- Idempotent financial updates

### Platform security

- HTTPS
- Security headers
- Content Security Policy planning
- Rate limiting
- Dependency updates
- Secret rotation
- Monitoring and alerting

### Data security

- Least-privilege access
- Backups
- Account moderation
- Privacy-aware retention
- Controlled deletion
- Sensitive operation logging

No system should be described as completely immune to attacks.

---

## 18. Performance Standards

HEYBIO aims to deliver a fast experience on mobile networks.

### Targets

- Fast initial page rendering.
- Minimal client-side JavaScript.
- Optimized image delivery.
- Responsive images where applicable.
- Efficient server-side data loading.
- Appropriate caching.
- Avoidance of unnecessary third-party scripts.
- Good Core Web Vitals.
- Accessible layout stability.

These are engineering goals, not verified production measurements.

### Mobile-first priorities

- Small-screen navigation
- Touch-friendly interactive controls
- Readable typography
- Stable responsive grids
- Minimal layout shifts
- Reduced-motion preferences
- Low-bandwidth performance

---

## 19. Accessibility

The platform should follow relevant WCAG accessibility guidance.

### Requirements

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Appropriate labels
- Accessible dialogs
- Meaningful error messages
- Sufficient contrast
- Reduced-motion support
- Screen-reader-friendly structure
- Usable touch targets

Accessibility must be tested rather than assumed from design alone.

---

## 20. Testing Strategy

Testing will be introduced alongside implementation.

### Unit tests

Test:

- Validation utilities
- Plan rules
- Entitlement calculations
- Username normalization
- Security helpers

### Integration tests

Test:

- Authentication flows
- Database access
- Billing operations
- Webhook handling
- Account moderation
- HYPE DROP authorization

### End-to-end tests

Test:

- Signup
- Login
- Creator onboarding
- Profile publishing
- Link management
- Theme selection
- Subscription checkout
- Cancellation
- Admin access denial

### Security tests

Test:

- Unauthorized admin requests
- Cross-user data access
- Webhook replay attacks
- Invalid payment signatures
- Privilege escalation attempts
- Unsafe redirects
- Invalid uploads

### Build checks

```bash
npm run typecheck
npm run build
```

Future test scripts will be added when the relevant test runner is configured.

---

## 21. Development Roadmap

### Phase 01 — Application Foundation

**Status: In progress**

- Cloudflare Workers setup
- React Router setup
- TypeScript configuration
- Responsive marketing homepage
- Navigation
- Premium footer
- Error boundary
- Design tokens

### Phase 02 — Database and Authentication

**Status: Planned**

- Supabase connection
- Database migrations
- RLS
- Signup/login
- Email verification
- Password recovery
- Session management

### Phase 03 — Creator Platform

**Status: Planned**

- Username registration
- Profile creation
- Link CRUD
- Link ordering
- Themes
- Uploads
- Public profile routes

### Phase 04 — Billing

**Status: Planned**

- Razorpay integration
- Subscription creation
- Verified webhook handling
- Billing history
- Cancellation
- Paid entitlements

### Phase 05 — Administration

**Status: Planned**

- Super Admin identity setup
- MFA
- Dashboard
- User moderation
- Payment monitoring
- Subscription management
- Audit logs

### Phase 06 — HYPE DROP

**Status: Planned**

- Cross-product authorization
- Entitlement verification
- Secure access integration
- Revocation handling

### Phase 07 — Production Hardening

**Status: Planned**

- Security testing
- Performance optimization
- SEO audit
- Accessibility audit
- Monitoring
- Backup validation
- Production deployment verification

---

## 22. Coding Standards

### TypeScript

Use strict TypeScript.

Avoid `any` except where properly justified.

### React

Prefer:

- Small, reusable components
- Predictable state management
- Clear props
- Accessible markup
- Explicit loading states

### Server code

Prefer:

- Explicit validation
- Early authorization checks
- Typed return values
- Safe error handling
- Database transactions for critical writes

### Imports

Organize imports consistently.

Use explicit module boundaries.

Avoid circular dependencies.

### Styling

Use shared design tokens.

Avoid duplicated magic values.

Maintain mobile responsiveness.

### File naming

Examples:

```text
Navbar.tsx
PremiumFooter.tsx
require-user.server.ts
billing.schema.ts
plans.ts
app.css
```

### Exports

Use clear named or default exports.

Avoid unnecessary wildcard exports in sensitive application modules.

---

## 23. Git Workflow

Recommended workflow:

```text
main
  |
  +-- feature/auth
  |
  +-- feature/creator-dashboard
  |
  +-- feature/billing
  |
  +-- feature/admin
  |
  +-- feature/hype-drop
```

### Before merging

- Run TypeScript checks.
- Run available tests.
- Review permissions.
- Check environment configuration.
- Verify no secrets were committed.
- Confirm mobile behavior.
- Review database migration impact.

### Commit examples

```text
feat: add marketing homepage
feat: implement creator authentication
feat: introduce subscription lifecycle
fix: prevent duplicate webhook processing
security: enforce admin authorization
docs: update deployment instructions
```

---

## 24. Deployment Checklist

### Application

- [ ] Dependencies installed successfully
- [ ] TypeScript validation passed
- [ ] Production build passed
- [ ] All required routes resolve
- [ ] Error boundaries tested
- [ ] Mobile layouts checked

### Authentication

- [ ] Email verification tested
- [ ] Login and logout tested
- [ ] Password recovery tested
- [ ] Protected routes verified
- [ ] Admin MFA verified

### Database

- [ ] Migrations applied
- [ ] RLS enabled and tested
- [ ] Ownership policies tested
- [ ] Indexes reviewed
- [ ] Backups validated

### Payments

- [ ] Razorpay account approved for required capabilities
- [ ] Test subscription created
- [ ] Webhook signature verified
- [ ] Duplicate events handled
- [ ] Renewal flow tested
- [ ] Failed payment flow tested
- [ ] Cancellation tested
- [ ] Refund behavior reviewed

### Security

- [ ] Production secrets configured securely
- [ ] Unauthorized admin access denied
- [ ] Cross-account access denied
- [ ] Sensitive actions audited
- [ ] Rate limits reviewed
- [ ] Security headers reviewed

### Production

- [ ] Domain configured
- [ ] HTTPS verified
- [ ] Monitoring enabled
- [ ] Legal pages published
- [ ] Contact/support process available
- [ ] Subscription terms visible before checkout
- [ ] Production smoke tests passed

---

## 25. Troubleshooting

### Development server does not start

Check Node.js and npm versions.

```bash
node --version
npm --version
```

Reinstall dependencies when necessary:

```bash
npm install
```

### TypeScript errors

Run:

```bash
npm run typecheck
```

Resolve the first actual compiler error before proceeding.

### Cloudflare configuration errors

Check:

```text
wrangler.jsonc
vite.config.ts
workers/app.ts
```

Make sure the installed packages support the configured Cloudflare integration.

### Missing environment variables

Verify the required environment bindings and secrets.

Never bypass missing credentials using hard-coded production secrets.

### Database access denied

Review:

- Authentication state
- Database policies
- Resource ownership
- Server-side authorization

Do not disable RLS simply to make a failing query work.

### Payment status mismatch

Review:

- Verified webhook events
- Razorpay subscription state
- Local payment records
- Processing history
- Reconciliation logs

Never manually mark a payment successful without trusted verification.

---

## 26. Important Project Rules

The following rules apply throughout development.

1. Do not ship unfinished features as functional.
2. Do not expose private credentials.
3. Do not bypass authentication or RLS.
4. Do not trust client-provided subscription status.
5. Do not allow unauthorized admin actions.
6. Do not invent revenue or user statistics.
7. Do not copy competitors' proprietary code or branding.
8. Do not publish unreviewed legal or billing claims.
9. Do not deploy without testing.
10. Keep the application maintainable and documented.
11. Build features in compatible, testable phases.
12. Prefer safe migrations over destructive replacements.

---

## 27. Future Opportunities

The architecture may support future capabilities such as:

- Additional profile layouts
- Expanded analytics
- Verified custom domains
- Creator monetization tools
- More integrations
- Collaboration features
- Expanded template marketplace
- Additional account security options
- Improved accessibility controls
- More HYPE DROP experiences

These are possibilities, not committed or currently available features.

---

## 28. Official Resources

### Cloudflare

https://developers.cloudflare.com/workers/

### React Router

https://reactrouter.com/

### Supabase

https://supabase.com/docs

### Razorpay

https://razorpay.com/docs/

### TypeScript

https://www.typescriptlang.org/docs/

### React

https://react.dev/

### Vite

https://vite.dev/

Always consult the current official documentation before changing major dependency versions or payment integrations.

---

## 29. License and Ownership

Copyright © 2026 DIPO LABS.

All rights reserved.

HEYBIO and associated project branding are developed for DIPO LABS.

No open-source license is granted by this README.

The use, modification, redistribution or commercial reuse of this repository is subject to authorization from the project owner.

Third-party packages and assets retain their respective licenses.

---

## 30. Final Statement

<div align="center">

### HEYBIO ↗

# Your world. One link.

**Create your space. Express your identity. Connect your world.**

Designed for what comes next.

**BUILT BY DIPO LABS**

© 2026 DIPO LABS. All rights reserved.

</div>
