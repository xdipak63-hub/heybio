
import {
  existsSync,
  readFileSync,
} from "node:fs";

import { resolve } from "node:path";

const args = new Set(
  process.argv.slice(2),
);

const production =
  args.has("--production");

const includeDevVars =
  args.has("--local");

const env: Record<
  string,
  string | undefined
> = {
  ...process.env,
};

if (includeDevVars) {
  const file = resolve(
    process.cwd(),
    ".dev.vars",
  );

  if (!existsSync(file)) {
    console.error(
      "Missing .dev.vars; create it locally (never commit it).",
    );

    process.exit(1);
  }

  for (
    const line of readFileSync(
      file,
      "utf8",
    ).split(/\r?\n/)
  ) {
    const match =
      /^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(
        line,
      );

    if (!match) {
      continue;
    }

    const [
      ,
      name = "",
      raw = "",
    ] = match;

    const unquoted = raw.replace(
      /^(['"])(.*)\1$/,
      "$2",
    );

    if (!env[name]) {
      env[name] = unquoted;
    }
  }
}

const errors: string[] = [];

const value = (name: string): string =>
  (env[name] ?? "").trim();

const placeholder = (
  input: string,
): boolean =>
  !input ||
  /YOUR_|REPLACE_ME|CHANGE_ME|PLACEHOLDER/i.test(
    input,
  );

const requireSecret = (
  name: string,
) => {
  if (placeholder(value(name))) {
    errors.push(
      `Missing or placeholder: ${name}`,
    );
  }
};

for (const name of [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
]) {
  requireSecret(name);
}

try {
  const url = new URL(
    value("SUPABASE_URL"),
  );

  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(
      ".supabase.co",
    )
  ) {
    errors.push(
      "SUPABASE_URL must use your HTTPS Supabase project origin.",
    );
  }
} catch {
  errors.push(
    "SUPABASE_URL must be a valid URL.",
  );
}

if (
  value("BILLING_JOBS_ENABLED") === "true" ||
  production
) {
  for (const name of [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
  ]) {
    requireSecret(name);
  }
}

if (production) {
  requireSecret(
    "TURNSTILE_SECRET_KEY",
  );
}

if (
  value("HYPE_DROP_SHARED_SECRET") &&
  new TextEncoder().encode(
    value("HYPE_DROP_SHARED_SECRET"),
  ).length < 32
) {
  errors.push(
    "HYPE_DROP_SHARED_SECRET must contain at least 32 bytes.",
  );
}

if (
  value("RESEND_API_KEY") &&
  !value("HEYBIO_EMAIL_FROM")
) {
  errors.push(
    "HEYBIO_EMAIL_FROM is required when RESEND_API_KEY is set.",
  );
}

if (errors.length) {
  console.error(
    errors
      .map(
        (error) => `✗ ${error}`,
      )
      .join("\n"),
  );

  process.exitCode = 1;
} else {
  console.log(
    "✓ Environment structure validated (no secret values printed).",
  );

  console.log(
    "This does not confirm network connectivity or API credential validity.",
  );
}