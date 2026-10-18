
/**
 * HEYBIO by DIPO LABS
 * Admin RLS Security Audit
 *
 * Read-only PostgreSQL catalog inspection.
 *
 * Requirements:
 * - Node.js 20+
 * - pg package
 * - Read-only PostgreSQL audit credentials
 *
 * Never use this script in browser code.
 */

import pg from "pg";

const { Client } = pg;

const connectionString =
  process.env.HEYBIO_AUDIT_DATABASE_URL;

if (!connectionString) {
  console.error(
    "Missing HEYBIO_AUDIT_DATABASE_URL"
  );
  process.exit(2);
}

const client = new Client({
  connectionString,
  connectionTimeoutMillis: 10000,
  statement_timeout: 10000,
  query_timeout: 10000,
  application_name: "heybio-security-audit",
});

const findings = [];

function check(name, passed, details) {
  findings.push({
    name,
    passed: Boolean(passed),
    details,
  });

  console.log(
    `${passed ? "PASS" : "FAIL"}: ${name}`
  );
}

async function main() {
  await client.connect();

  // Enforce a read-only transaction.
  await client.query(
    "BEGIN TRANSACTION READ ONLY"
  );

  try {
    const tableResult = await client.query(`
      SELECT
        c.relrowsecurity AS rls_enabled,
        c.relforcerowsecurity AS force_rls
      FROM pg_class c
      JOIN pg_namespace n
        ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'admin_roles'
        AND c.relkind IN ('r', 'p')
    `);

    const table = tableResult.rows[0];

    check(
      "Admin roles table exists",
      Boolean(table),
      "public.admin_roles"
    );

    check(
      "Admin roles RLS enabled",
      table?.rls_enabled === true,
      "RLS must be enabled"
    );

    check(
      "Admin roles FORCE RLS",
      table?.force_rls === true,
      "Expected by migration 026"
    );

    const grants = await client.query(`
      SELECT
        role_name,
        has_table_privilege(
          role_name,
          'public.admin_roles',
          'INSERT'
        ) AS can_insert,
        has_table_privilege(
          role_name,
          'public.admin_roles',
          'UPDATE'
        ) AS can_update,
        has_table_privilege(
          role_name,
          'public.admin_roles',
          'DELETE'
        ) AS can_delete
      FROM (
        VALUES ('anon'), ('authenticated')
      ) AS roles(role_name)
    `);

    for (const role of grants.rows) {
      check(
        `${role.role_name} cannot write admin roles`,
        !role.can_insert &&
          !role.can_update &&
          !role.can_delete,
        "No direct INSERT, UPDATE or DELETE"
      );
    }

    const policies = await client.query(`
      SELECT
        policyname,
        cmd,
        roles,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'admin_roles'
    `);

    const ownRead = policies.rows.find(
      (policy) =>
        policy.policyname ===
          "admin_roles_read_own" &&
        policy.cmd === "SELECT" &&
        policy.roles.includes("authenticated") &&
        /auth\.uid/i.test(policy.qual ?? "")
    );

    check(
      "Own-role SELECT policy exists",
      Boolean(ownRead),
      "Authenticated users should read only their own role"
    );

    const unexpectedWrites =
      policies.rows.filter(
        (policy) =>
          ["INSERT", "UPDATE", "DELETE", "ALL"]
            .includes(policy.cmd) &&
          (
            policy.roles.includes("public") ||
            policy.roles.includes("anon") ||
            policy.roles.includes("authenticated")
          )
      );

    check(
      "No client-facing write policies",
      unexpectedWrites.length === 0,
      "No broad client write policies expected"
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }

  const failures = findings.filter(
    (finding) => !finding.passed
  );

  console.log(
    `\nResults: ${findings.length - failures.length}/${findings.length} passed`
  );

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  console.error(
    "Audit failed:",
    error instanceof Error
      ? error.message
      : "Unknown error"
  );

  process.exitCode = 2;
} finally {
  await client.end().catch(() => {});
}
