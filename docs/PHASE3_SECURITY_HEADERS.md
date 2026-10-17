# HEYBIO Phase 3 — targeted security patch

Base: heybio-main(4).zip + Phase 1 + Phase 2 overlay.

Changed: workers/app.ts only.
Adds consistent browser security response headers at the Cloudflare Worker boundary.
Preserves Set-Cookie, response body, redirects, and existing Content-Security-Policy.
Does not claim to fix admin MFA, RLS, storage, bot prevention or payment bugs.

## Apply
From repository root:
unzip -o HEYBIO_PHASE3_TARGETED_SECURITY_PATCH.zip -d .
git diff --check
npm ci
npm run typecheck
npm run build

Test authentication redirects, cookies, API errors, and Cloudflare preview.
Do not deploy before runtime tests and migrations 028–030 are verified.
