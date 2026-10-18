
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

function read(relativePath) {
  return readFileSync(
    resolve(ROOT, relativePath),
    "utf8",
  );
}

const api = read(
  "app/routes/api/social-links.ts",
);

const migration = read(
  "supabase/migrations/025_social_links_atomic_save.sql",
);

const csrf = read(
  "app/lib/security/csrf.server.ts",
);

const PLATFORMS = [
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
  "x",
  "linkedin",
  "github",
  "threads",
  "pinterest",
  "snapchat",
  "twitch",
  "website",
];

test(
  "API requires authenticated users for reads and writes",
  () => {
    const occurrences = [
      ...api.matchAll(/\brequireUser\s*\(/g),
    ];

    assert.ok(
      occurrences.length >= 2,
      "Both loader and action must call requireUser.",
    );
  },
);

test(
  "API protects mutations against CSRF",
  () => {
    assert.match(
      api,
      /\brequireCsrfProtection\s*\(\s*request\s*\)/,
    );

    assert.match(
      api,
      /\brequireMutationMethod\s*\(\s*request\s*,\s*\[\s*["']POST["']\s*\]\s*\)/,
    );

    assert.match(
      csrf,
      /export\s+(?:function|const)\s+requireCsrfProtection\b/,
    );
  },
);

test(
  "API uses atomic social links RPC",
  () => {
    assert.match(
      api,
      /["']save_my_social_links["']/,
    );

    assert.match(
      api,
      /\bp_links\s*:\s*links\b/,
    );
  },
);

test(
  "API enforces a maximum of 12 links",
  () => {
    assert.match(
      api,
      /(?:MAX_LINKS\s*=\s*12|input\.length\s*>\s*12)/,
    );
  },
);

test(
  "API requires HTTPS URLs",
  () => {
    assert.match(
      api,
      /https:/,
    );

    assert.match(
      api,
      /username/,
    );

    assert.match(
      api,
      /password/,
    );
  },
);

test(
  "API checks duplicate platforms",
  () => {
    assert.match(
      api,
      /new Set/,
    );

    assert.match(
      api,
      /\.has\(/,
    );

    assert.match(
      api,
      /\.add\(/,
    );
  },
);

test(
  "API and SQL agree on supported platforms",
  () => {
    for (const platform of PLATFORMS) {
      assert.ok(
        api.includes(`"${platform}"`) ||
          api.includes(`'${platform}'`),
        `API missing platform: ${platform}`,
      );

      assert.ok(
        migration.includes(`'${platform}'`),
        `SQL missing platform: ${platform}`,
      );
    }
  },
);

test(
  "Database function is authenticated",
  () => {
    assert.match(
      migration,
      /auth\.uid\s*\(\s*\)/i,
    );

    assert.match(
      migration,
      /grant execute[\s\S]*to authenticated/i,
    );
  },
);

test(
  "Database requires active creator profile",
  () => {
    assert.match(
      migration,
      /account_status\s*=\s*'active'/i,
    );
  },
);

test(
  "Database serializes concurrent saves",
  () => {
    assert.match(
      migration,
      /for update/i,
    );
  },
);

test(
  "Database validates before deleting old links",
  () => {
    const validation =
      migration.indexOf("v_seen := array_append");

    const deletion =
      migration.indexOf(
        "delete from public.social_links",
      );

    assert.ok(
      validation >= 0,
      "Expected duplicate validation.",
    );

    assert.ok(
      deletion > validation,
      "Validation must precede deletion.",
    );
  },
);

test(
  "Database does not grant RPC to anonymous users",
  () => {
    assert.match(
      migration,
      /revoke all on function[\s\S]*from public,\s*anon/i,
    );
  },
);

test(
  "Database writes the authenticated user ID",
  () => {
    assert.match(
      migration,
      /v_user\s+uuid\s*:=/i,
    );

    assert.match(
      migration,
      /insert into public\.social_links/i,
    );
  },
);
