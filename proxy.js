
/**
 * HEYBIO by DIPO LABS
 *
 * Compatibility placeholder.
 *
 * The actual request handling is performed by
 * workers/app.ts on Cloudflare Workers.
 *
 * This file deliberately does not start another server,
 * intercept requests, or bypass authentication.
 */

"use strict";

module.exports = Object.freeze({
  name: "HEYBIO",
  runtime: "cloudflare-workers",
  status: "managed-by-workers-app",
});
