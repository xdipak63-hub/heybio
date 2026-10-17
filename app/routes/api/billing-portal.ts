
import {
  redirect,
  type LoaderFunctionArgs,
} from "react-router";

import {
  requireUser,
} from "../../lib/auth/require-user.server";

/**
 * HEYBIO ↗
 * Safe billing-management entry point.
 *
 * No fabricated Razorpay portal URL.
 * No client-side access to payment credentials.
 *
 * The existing /dashboard/billing page reads
 * server-verified subscription information.
 */
export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { client } =
    await requireUser(request, context);

  const headers = new Headers(client.headers);

  headers.set(
    "Cache-Control",
    "private, no-store",
  );

  headers.set(
    "X-Robots-Tag",
    "noindex, nofollow",
  );

  throw redirect(
    "/dashboard/billing",
    {
      status: 302,
      headers,
    },
  );
}