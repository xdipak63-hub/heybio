import { redirect } from "react-router";
import type { User } from "@supabase/supabase-js";

import {
  createSupabaseServer
} from "../supabase/server";

type ServerClient = ReturnType<
  typeof createSupabaseServer
>;

export async function requireUser(
  request: Request,
  context: unknown
): Promise<{
  user: User;
  client: ServerClient;
}> {
  const client = createSupabaseServer(
    request,
    context
  );

  const {
    data: { user },
    error
  } = await client.supabase.auth.getUser();

  if (error || !user) {
    throw redirect("/login", {
      headers: client.headers
    });
  }

  if (!user.email_confirmed_at) {
    throw redirect("/login?verification=required", {
      headers: client.headers
    });
  }

  const { data: profile, error: profileError } =
    await client.supabase
      .from("profiles")
      .select("account_status")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    throw new Response(
      "Account verification temporarily unavailable.",
      {
        status: 503,
        headers: client.headers
      }
    );
  }

  if (
    profile &&
    profile.account_status !== "active"
  ) {
    throw new Response(
      "This account is not currently active.",
      {
        status: 403,
        headers: client.headers
      }
    );
  }

  return { user, client };
}