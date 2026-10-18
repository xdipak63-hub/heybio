import {
  redirect
} from "react-router";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs
} from "react-router";

import {
  createSupabaseServer,
  requireSameOrigin
} from "../../lib/supabase/server";


export async function loader(
  _args: LoaderFunctionArgs
) {

  throw redirect("/login", {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  requireSameOrigin(request);

  const { supabase, headers } =
    createSupabaseServer(request, context);

  await supabase.auth.signOut({
    scope: "local"
  });

  throw redirect("/login", { headers });
}