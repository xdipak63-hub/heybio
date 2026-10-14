
import { redirect } from "react-router";
import type { User } from "@supabase/supabase-js";

import {
  createSupabaseServer,
} from "../supabase/server";

export type AuthSession = {
  user: User;
  userId: string;
  email: string | null;
  emailVerified: boolean;
};

export type SessionResult = {
  session: AuthSession | null;
  headers: Headers;
  supabase: ReturnType<
    typeof createSupabaseServer
  >["supabase"];
};

export async function getAuthSession(
  request: Request,
  context: unknown,
): Promise<SessionResult> {
  const { supabase, headers } =
    createSupabaseServer(request, context);

  const { data, error } =
    await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      session: null,
      headers,
      supabase,
    };
  }

  const user = data.user;

  return {
    session: {
      user,
      userId: user.id,
      email: user.email ?? null,
      emailVerified: Boolean(
        user.email_confirmed_at,
      ),
    },
    headers,
    supabase,
  };
}

export async function requireAuthSession(
  request: Request,
  context: unknown,
): Promise<SessionResult & {
  session: AuthSession;
}> {
  const result = await getAuthSession(
    request,
    context,
  );

  if (
    !result.session ||
    !result.session.emailVerified
  ) {
    throw redirect("/login", {
      headers: result.headers,
    });
  }

  return {
    ...result,
    session: result.session,
  };
}

export async function getSessionUser(
  request: Request,
  context: unknown,
): Promise<User | null> {
  const result = await getAuthSession(
    request,
    context,
  );

  return result.session?.user ?? null;
}
