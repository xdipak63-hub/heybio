
import {
  readdirSync,
  readFileSync,
} from "node:fs";

import {
  join,
  resolve,
} from "node:path";

const directory = resolve(
  process.cwd(),
  "supabase/migrations",
);

const files = readdirSync(
  directory,
)
  .filter(
    (name) => name.endsWith(".sql"),
  )
  .sort();

const errors: string[] = [];

const numbers = new Set<number>();

for (const file of files) {
  const match =
    /^(\d{3})_[a-z0-9_]+\.sql$/.exec(
      file,
    );

  if (!match) {
    errors.push(
      `Invalid migration filename: ${file}`,
    );

    continue;
  }

  const number = Number(
    match[1],
  );

  if (numbers.has(number)) {
    errors.push(
      `Duplicate migration number: ${number}`,
    );
  }

  numbers.add(number);

  const source = readFileSync(
    join(directory, file),
    "utf8",
  );

  if (!source.trim()) {
    errors.push(
      `Empty migration: ${file}`,
    );
  }

  if (
    !/\bbegin\s*;/i.test(source) ||
    !/\bcommit\s*;/i.test(source)
  ) {
    errors.push(
      `Missing transaction BEGIN/COMMIT: ${file}`,
    );
  }

  if (
    /\b(drop\s+schema|drop\s+database)\b/i.test(
      source,
    )
  ) {
    errors.push(
      `Dangerous schema/database operation requires review: ${file}`,
    );
  }
}

for (
  let number = 1;
  number <= Math.max(0, ...numbers);
  number++
) {
  if (!numbers.has(number)) {
    errors.push(
      `Missing migration ${String(
        number,
      ).padStart(3, "0")}`,
    );
  }
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
    `✓ ${files.length} sequential, non-empty migration files found.`,
  );

  console.log(
    "Static checks only. Apply migrations to a disposable Supabase database to validate SQL/RLS.",
  );
}