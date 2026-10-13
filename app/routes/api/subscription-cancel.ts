import type {
  ActionFunctionArgs
} from "react-router";

import {
  requireUser
} from "../../lib/auth/require-user.server";

import {
  requireCsrfProtection,
  requireMutationMethod
} from "../../lib/security/csrf.server";

import {
  createSupabaseAdmin,
  getServerBindings
} from "../../lib/supabase/admin.server";

import {
  createRazorpayClient
} from "../../lib/payments/razorpay.server";

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  requireMutationMethod(request);
  requireCsrfProtection(request);

  const { user, client } =
    await requireUser(request, context);

  const env = getServerBindings(context);
  const db = createSupabaseAdmin(env);

  const { data, error } = await db
    .from("subscriptions")
    .select(
      "id, user_id, status, razorpay_subscription_id"
    )
    .eq("user_id", user.id)
    .in("status", [
      "active",
      "authenticated",
      "pending",
      "halted"
    ])
    .order("created_at", {
      ascending: false
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    return Response.json(
      { error: "Subscription unavailable" },
      { status: 503 }
    );
  }

  if (
    !data ||
    !data.razorpay_subscription_id
  ) {
    return Response.json(
      { error: "No cancellable subscription" },
      { status: 404 }
    );
  }

  const razorpay = createRazorpayClient({
    RAZORPAY_KEY_ID:
      env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET:
      env.RAZORPAY_KEY_SECRET
  });

  const cancelAtCycleEnd =
    data.status === "active";

  const result =
    await razorpay.cancelSubscription(
      data.razorpay_subscription_id,
      cancelAtCycleEnd
    );

  // Do not assume the local billing state
  // is final until provider confirmation.
  const { error: updateError } = await db
    .from("subscriptions")
    .update({
      cancel_at_period_end:
        cancelAtCycleEnd,
      cancelled_at:
        cancelAtCycleEnd
          ? null
          : new Date().toISOString()
    })
    .eq("id", data.id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error(
      "Cancellation local sync failed:",
      updateError.code
    );

    return Response.json(
      {
        error:
          "Provider accepted cancellation but local synchronization is pending. Contact support before retrying."
      },
      { status: 503 }
    );
  }

  return Response.json(
    {
      ok: true,
      providerStatus: result.status,
      cancelAtCycleEnd
    },
    {
      headers: client.headers
    }
  );
}