import type {
  LoaderFunctionArgs
} from "react-router";

import {
  requireUser
} from "../../lib/auth/require-user.server";

import {
  createSupabaseAdmin,
  getServerBindings
} from "../../lib/supabase/admin.server";

import {
  getBillingAccess
} from "../../lib/payments/subscriptions.server";

export async function loader({
  request,
  context
}: LoaderFunctionArgs) {
  const { user, client } =
    await requireUser(request, context);

  const env = getServerBindings(context);
  const db = createSupabaseAdmin(env);

  const access = await getBillingAccess(
    db,
    user.id
  );

  return Response.json(
    {
      product: "hype_drop",
      eligible: access.hypeDrop,
      plan: access.plan,
      validUntil: access.currentPeriodEnd
    },
    {
      headers: {
        ...Object.fromEntries(
          client.headers.entries()
        ),
        "Cache-Control": "private, no-store"
      }
    }
  );
}