
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

import {
  resolve,
} from "node:path";

import {
  spawnSync,
} from "node:child_process";

const ref =
  process.env.SUPABASE_PROJECT_ID?.trim();

const destination = resolve(
  process.cwd(),
  "app/types/database.ts",
);

const force =
  process.argv.includes("--force");

if (
  !ref ||
  !/^[a-z0-9]{20}$/.test(ref)
) {
  console.error(
    "Set SUPABASE_PROJECT_ID to your 20-character Supabase project reference.",
  );

  process.exit(1);
}

if (
  existsSync(destination) &&
  readFileSync(
    destination,
    "utf8",
  ).trim() &&
  !force
) {
  console.error(
    "database.ts is non-empty. Use --force only after reviewing the diff.",
  );

  process.exit(1);
}

const result = spawnSync(
  "npx",

  [
    "--no-install",
    "supabase",
    "gen",
    "types",
    "typescript",
    "--project-id",
    ref,
    "--schema",
    "public",
  ],

  {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 90_000,
    maxBuffer: 8 * 1024 * 1024,
    shell: false,
  },
);

if (
  result.error ||
  result.status !== 0
) {
  console.error(
    "Supabase type generation failed. Install/login to Supabase CLI first.",
  );

  if (result.stderr) {
    console.error(
      result.stderr.slice(
        0,
        1500,
      ),
    );
  }

  process.exit(1);
}

const generated =
  result.stdout;

if (
  !generated.includes(
    "export type Database",
  ) ||
  !generated.includes("public:")
) {
  console.error(
    "Generated output is incomplete; existing file was not modified.",
  );

  process.exit(1);
}

writeFileSync(
  destination,

  `// Generated from your Supabase schema. Do not edit manually.\n${generated}`,

  "utf8",
);

console.log(
  "✓ Wrote app/types/database.ts. Review and commit the generated diff.",
);