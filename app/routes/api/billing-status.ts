import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "../../lib/auth/require-user.server";
import { getServerBindings, createSupabaseAdmin } from "../../lib/supabase/admin.server";
import { getBillingAccess } from "../../lib/payments/subscriptions.server";
import { requireRateLimit } from "../../lib/security/rate-limit.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user, client } = await requireUser(request, context);
  const env = getServerBindings(context);
  await requireRateLimit(env, { namespace: "billing-status", key: user.id });
  const status = await getBillingAccess(createSupabaseAdmin(env), user.id);
  const headers = new Headers(client.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return Response.json({ plan: status.plan, active: status.active,
    currentPeriodEnd: status.currentPeriodEnd, hypeDrop: status.hypeDrop }, { headers });
}
