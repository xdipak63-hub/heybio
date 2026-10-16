
import { useState } from "react";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Search, Users } from "lucide-react";

import UserTable from "../../components/admin/UserTable";
import { requireAdminPage } from "../../lib/auth/require-admin-page.server";
import {
  createSupabaseAdmin,
  getServerBindings,
} from "../../lib/supabase/admin.server";
import type { AdminUserRow } from "../../types/admin-ui";

const PAGE_SIZE = 15;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NO_STORE = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export const meta: MetaFunction = () => [
  { title: "Users — HEYBIO Admin" },
  { name: "robots", content: "noindex, nofollow" },
];

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  await requireAdminPage(request, context, "users.read");

  const db = createSupabaseAdmin(getServerBindings(context));
  const url = new URL(request.url);

  const page = Math.min(
    10000,
    Math.max(
      1,
      Number.parseInt(url.searchParams.get("page") || "1", 10) || 1,
    ),
  );

  const search = (url.searchParams.get("q") || "")
    .trim()
    .slice(0, 60);

  // Never interpolate arbitrary PostgREST filter syntax.
  if (
    search &&
    !UUID.test(search) &&
    !/^[a-z0-9_]{1,60}$/i.test(search)
  ) {
    return Response.json(
      {
        users: [],
        page: 1,
        total: 0,
        search,
        invalid: true,
      },
      { headers: NO_STORE },
    );
  }

  let query = db
    .from("profiles")
    .select(
      "id,username,display_name,account_status,created_at",
      { count: "exact" },
    );

  if (search) {
    query = UUID.test(search)
      ? query.eq("id", search)
      : query.ilike("username", `%${search}%`);
  }

  const result = await query
    .order("created_at", { ascending: false })
    .range(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE - 1,
    );

  if (result.error || result.count == null) {
    throw new Response("Unable to load users.", {
      status: 503,
      headers: NO_STORE,
    });
  }

  const profiles = result.data ?? [];
  const ids = profiles.map((p) => p.id);

  const subscriptions = ids.length
    ? await db
        .from("subscriptions")
        .select("user_id,plan_id,current_period_end")
        .in("user_id", ids)
        .eq("status", "active")
        .gt(
          "current_period_end",
          new Date().toISOString(),
        )
    : { data: [], error: null };

  if (subscriptions.error) {
    throw new Response("Unable to verify plans.", {
      status: 503,
      headers: NO_STORE,
    });
  }

  const activePlan = new Map(
    (subscriptions.data ?? []).map((s) => [
      s.user_id,
      s.plan_id,
    ]),
  );

  // Limit identity lookups to the current page.
  const accounts = await Promise.all(
    profiles.map(async (p) => {
      const { data, error } =
        await db.auth.admin.getUserById(p.id);

      if (error) {
        throw new Error("Identity lookup failed");
      }

      return {
        id: p.id,
        email: data.user?.email ?? "Email unavailable",
      };
    }),
  ).catch(() => null);

  if (!accounts) {
    throw new Response(
      "Unable to load user identities.",
      { status: 503, headers: NO_STORE },
    );
  }

  const emails = new Map(
    accounts.map((a) => [a.id, a.email]),
  );

  const users: AdminUserRow[] = profiles.map((p) => ({
    id: p.id,
    email: emails.get(p.id) ?? "Email unavailable",
    username: p.username,
    displayName: p.display_name,
    status: p.account_status as AdminUserRow["status"],
    plan: activePlan.get(p.id) ?? "free",
    createdAt: p.created_at,
  }));

  return Response.json(
    {
      users,
      page,
      total: result.count,
      search,
      invalid: false,
    },
    { headers: NO_STORE },
  );
}

export default function AdminUsers() {
  const { users, page, total, search, invalid } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const [draft, setDraft] = useState(search);

  const go = (nextPage: number) =>
    navigate(
      `/admin/users?${new URLSearchParams({
        ...(search ? { q: search } : {}),
        page: String(nextPage),
      })}`,
    );

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <header>
        <p
          style={{
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: 800,
          }}
        >
          ACCOUNT OPERATIONS
        </p>

        <h2
          style={{
            fontSize: "clamp(26px,4vw,38px)",
            margin: "8px 0",
          }}
        >
          Users
        </h2>

        <p>
          Verified accounts and active plans.
          Search by username or complete user ID.
        </p>
      </header>

      <Form
        method="get"
        action="/admin/users"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "end",
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          Username or account ID

          <input
            name="q"
            maxLength={60}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{
              minHeight: 44,
              padding: 12,
              border: "1px solid #dedee3",
              borderRadius: 10,
              minWidth: "min(78vw,300px)",
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            minHeight: 44,
            padding: "0 18px",
            borderRadius: 10,
            background: "#BDF806",
            border: 0,
            fontWeight: 700,
          }}
        >
          <Search size={15} /> Search
        </button>

        {search && (
          <Link to="/admin/users">
            Clear filter
          </Link>
        )}
      </Form>

      {invalid && (
        <p role="alert">
          Use letters, numbers, underscores,
          or a complete UUID.
        </p>
      )}

      <UserTable
        users={users}
        search={search}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
        }}
        onPageChange={go}
      />

      <p
        style={{
          color: "#5f6067",
          fontSize: 13,
        }}
      >
        <Users
          size={14}
          style={{ verticalAlign: "middle" }}
        />{" "}
        Account details and moderation require
        a separate authorization check.
      </p>
    </div>
  );
}