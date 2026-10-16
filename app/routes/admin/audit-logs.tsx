
import {
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import {
  FileClock,
  ShieldCheck,
} from "lucide-react";

import AuditLogTable from "../../components/admin/AuditLogTable";

import { requireAdminPage } from "../../lib/auth/require-admin-page.server";

import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";

import type {
  AdminAuditRow,
} from "../../types/admin-ui";

const SIZE = 20;

const HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Audit logs — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  await requireAdminPage(
    request,
    context,
    "audit.read",
  );

  const page = Math.min(
    10000,
    Math.max(
      1,
      Number.parseInt(
        new URL(request.url).searchParams.get(
          "page",
        ) || "1",
        10,
      ) || 1,
    ),
  );

  const db = createSupabaseAdmin(
    getServerBindings(context),
  );

  const result = await db
    .from("admin_audit_logs")
    .select(
      "id,actor_user_id,action,target_type,target_id,created_at",
      { count: "exact" },
    )
    .order("created_at", {
      ascending: false,
    })
    .range(
      (page - 1) * SIZE,
      page * SIZE - 1,
    );

  if (
    result.error ||
    result.count == null
  ) {
    throw new Response(
      "Audit log unavailable.",
      {
        status: 503,
        headers: HEADERS,
      },
    );
  }

  const rows = result.data ?? [];

  const ids = [
    ...new Set(
      rows.map((r) => r.actor_user_id),
    ),
  ];

  const actors = await Promise.all(
    ids.map(async (id) => {
      const response =
        await db.auth.admin.getUserById(id);

      if (response.error) {
        throw new Error(
          "Administrator identity unavailable",
        );
      }

      return {
        id,
        email:
          response.data.user?.email ??
          "Former administrator",
      };
    }),
  ).catch(() => null);

  if (!actors) {
    throw new Response(
      "Cannot verify audit actors.",
      {
        status: 503,
        headers: HEADERS,
      },
    );
  }

  const emails = new Map(
    actors.map((a) => [a.id, a.email]),
  );

  // Do not serialize audit metadata.
  const logs: AdminAuditRow[] = rows.map(
    (row) => ({
      id: row.id,
      actorEmail:
        emails.get(row.actor_user_id) ??
        "Unknown",
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      createdAt: row.created_at,
    }),
  );

  return Response.json(
    {
      logs,
      total: result.count,
      page,
    },
    { headers: HEADERS },
  );
}

export default function AdminAuditLogs() {
  const {
    logs,
    total,
    page,
  } = useLoaderData<typeof loader>();

  const pages = Math.max(
    1,
    Math.ceil(total / SIZE),
  );

  return (
    <div
      style={{
        display: "grid",
        gap: 20,
      }}
    >
      <header>
        <p
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          ACCOUNTABILITY & SECURITY
        </p>

        <h2
          style={{
            fontSize: 34,
            margin: "8px 0",
          }}
        >
          <FileClock
            size={30}
            style={{
              verticalAlign: "middle",
            }}
          />{" "}
          Audit logs
        </h2>

        <p>
          Server-created records of privileged
          administrative actions. Logs are
          read-only; no update or deletion controls.
        </p>
      </header>

      <div
        style={{
          padding: 14,
          border: "1px solid #dedee3",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <ShieldCheck
          size={18}
          style={{
            verticalAlign: "middle",
          }}
        />{" "}
        Only verified MFA-protected super admins
        can view this history.
      </div>

      <AuditLogTable logs={logs} />

      <nav
        aria-label="Audit log pages"
        style={{
          display: "flex",
          gap: 18,
          alignItems: "center",
        }}
      >
        {page > 1 && (
          <Link to={`?page=${page - 1}`}>
            ← Previous
          </Link>
        )}

        <span>
          {total.toLocaleString("en-IN")} records ·
          Page {page} of {pages}
        </span>

        {page < pages && (
          <Link to={`?page=${page + 1}`}>
            Next →
          </Link>
        )}
      </nav>

      <p
        style={{
          color: "#5f6067",
          fontSize: 12,
        }}
      >
        Account/moderation changes should also
        appear in moderation history. Verify RPC
        audit writes and retention policies before
        launch.
      </p>
    </div>
  );
}