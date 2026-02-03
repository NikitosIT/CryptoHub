import { createSupabaseClient } from "./supabaseApi.ts";
import { unauthorizedResponse } from "./responses.ts";

export async function getAuthenticatedUser(req: Request) {
  const supabase = createSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    throw unauthorizedResponse();
  }

  return { user, userId: user.id, supabase };
}

export async function requireAuth(req: Request) {
  return await getAuthenticatedUser(req);
}
