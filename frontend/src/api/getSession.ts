import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabaseClient';

// todo move to index.ts
export async function getSession(): Promise<Session | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session ?? null;
}

// todo delete
export async function getRequestAuth(): Promise<{
  accessToken: string | null;
}> {
  const session = await getSession();
  return { accessToken: session?.access_token ?? null };
}
