HEYBIO ↗ — OFFICIAL LOGO PATCH
Based on: heybio-main(6).zip + owner's uploaded leaf-H logo artwork.

IMPORTANT: This ZIP is a FILE OVERLAY, not a full production app.
Extract its app/ and public/ folders into your HEYBIO project, preserving paths.
BACK UP your project or commit Git changes first.
Do not paste the whole old ZIP over newer code you have added from previous batches.

Core assets:
 public/icon.svg                 Original logo art converted to SVG
 public/brand-mark.svg           Dark brand mark for white backgrounds
 public/brand-mark-white.svg     White brand mark for charcoal backgrounds
 public/favicon.ico              16/32/48/64/128/256px icons
 public/apple-touch-icon.png     iPhone/iPad Add to Home Screen
 public/icon-192.png              Android icon 192px
 public/icon-512.png              Android icon 512px
 public/icon-maskable-512.png     Android adaptive/round maskable icon
 public/manifest.webmanifest     App display name + correct icon refs
 public/brand-mark.png           Transparent raster fallback
 public/brand-mark-white.png     Transparent white variant
 public/heybio-icon-1024.png     Master opaque square icon

React files modified:
 app/components/shared/Logo.tsx
 app/components/marketing/Navbar.tsx
 app/components/marketing/PremiumFooter.tsx
 app/components/marketing/IntroExperience.tsx
 app/components/admin/AdminSidebar.tsx
 app/routes/auth/login.tsx
 app/routes/auth/signup.tsx
 app/routes/auth/forgot-password.tsx
 app/routes/auth/reset-password.tsx
 app/routes/auth/verify-email.tsx
 app/routes/onboarding/choose-username.tsx
 app/routes/onboarding/create-profile.tsx

Schema types:
 app/types/database.ts  — Snapshot typed from all 20 public SQL tables in migrations 001–026.
 TypeScript types are not proof of DB compatibility or security. Regenerate types using
 Supabase CLI after applying all real migrations (including migration 027).

REQUIRED MANUAL MERGE IN app/root.tsx (DO NOT OVERWRITE your last batch changes):

Inside <head>, before <Meta />:
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="HEYBIO" />
  <meta name="application-name" content="HEYBIO" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />

Inside root ErrorBoundary, replace text-only home brand with:
  import Logo from "./components/shared/Logo";
  <Logo size="sm" />

REQUIRED MANUAL MERGE ON FILES REPLACED IN PREVIOUS BATCHES:

app/routes/onboarding/choose-plan.tsx
  import Logo from "../../components/shared/Logo";
  Replace the page's text-only HEYBIO logo link with <Logo size="sm" />.

app/routes/dashboard/layout.tsx  (Batch 04)
  import Logo from "../../components/shared/Logo";
  Replace <Link to="/" className="hb-dash__brand">HEYBIO... with:
  <Logo size="sm" className="hb-dash__brand" />
  (Preserve the rest of the protected layout. Do not use the original empty layout.)

app/routes/dashboard/overview.tsx (Batch 04)
  If the page has an old HEYBIO text-only logo, replace it with the Logo component.
  If the page uses the new protected shell, don't add a duplicate logo.

app/routes/public/profile.tsx and ProfilePreview.tsx
  Keep creator content distinct. If the public profile has HEYBIO attribution,
  you can use <Logo size="sm" /> in its 'Made with HEYBIO' section.

OTHER BRAND TOUCH POINTS:
  marketing header and footer, intro slide, login/signup, password recovery,
  onboarding, creator/admin dashboard, public profile attribution and error page.
  Keep HEYBIO plain text in body copy, headings and legal policy text.

ON PHONE:
  iOS Safari: Share -> Add to Home Screen.
  Android Chrome: browser menu -> Add to Home screen / Install app if offered.
  Browser and OS may cache old icons; clear website data/remove old shortcut if necessary.
  For reliable results deploy over HTTPS and test on real devices.

CHECK AFTER COPYING:
  /icon.svg
  /favicon.ico
  /apple-touch-icon.png
  /icon-192.png
  /icon-512.png
  /icon-maskable-512.png
  /manifest.webmanifest

DO NOT commit any .dev.vars, payment secret, or Supabase service-role key.
This package was statically checked; not a full production build or live-device test.
