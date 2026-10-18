
/**
 * HEYBIO ↗
 * Read-only smoke checks.
 *
 * Never writes profiles, payments
 * or administrator data.
 */

const baseInput =
  process.env.HEYBIO_BASE_URL ??
  process.argv[2];

if (!baseInput) {
  console.error(
    "Usage: HEYBIO_BASE_URL=https://your-site.example node --experimental-strip-types scripts/smoke-test.ts",
  );

  process.exit(1);
}

const base = new URL(
  baseInput,
);

if (
  !["https:", "http:"].includes(
    base.protocol,
  )
) {
  throw new Error(
    "Invalid HTTP origin.",
  );
}

if (
  base.protocol !== "https:" &&
  ![
    "localhost",
    "127.0.0.1",
  ].includes(base.hostname)
) {
  throw new Error(
    "Non-local smoke tests require HTTPS.",
  );
}

const checks: Array<{
  path: string;
  publicPage: boolean;
}> = [
  {
    path: "/",
    publicPage: true,
  },
  {
    path: "/pricing",
    publicPage: true,
  },
  {
    path: "/dashboard",
    publicPage: false,
  },
  {
    path: "/admin",
    publicPage: false,
  },
  {
    path: "/api/hype-entitlement",
    publicPage: false,
  },
];

let failures = 0;

for (const check of checks) {
  const url = new URL(
    check.path,
    base.origin,
  );

  try {
    const response = await fetch(
      url,
      {
        redirect: "manual",

        headers: {
          Accept: "text/html",
        },

        signal:
          AbortSignal.timeout(
            8_000,
          ),
      },
    );

    const allowed = check.publicPage
      ? response.status === 200
      : [
          301,
          302,
          303,
          307,
          308,
          401,
          403,
        ].includes(response.status);

    if (
      allowed &&
      check.publicPage
    ) {
      const text =
        await response.text();

      if (
        !text
          .toLowerCase()
          .includes("heybio")
      ) {
        failures++;

        console.error(
          `✗ ${check.path}: expected HEYBIO content`,
        );

        continue;
      }
    }

    if (!allowed) {
      failures++;
    }

    console.log(
      `${allowed ? "✓" : "✗"} ${check.path}: HTTP ${response.status}`,
    );
  } catch (error) {
    failures++;

    console.error(
      `✗ ${check.path}: ${
        error instanceof Error
          ? error.message
          : "network failure"
      }`,
    );
  }
}

if (failures) {
  process.exitCode = 1;
} else {
  console.log(
    "✓ Read-only smoke checks passed. Authorized flows still require integration tests.",
  );
}

export {};
