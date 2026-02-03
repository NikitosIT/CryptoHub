import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";

export async function getSession(): Promise<Session | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session ?? null;
}

export async function getRequestAuth(): Promise<{
  accessToken: string | null;
}> {
  const session = await getSession();
  return { accessToken: session?.access_token ?? null };
}
