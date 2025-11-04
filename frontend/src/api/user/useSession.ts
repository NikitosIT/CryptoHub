import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

export function useSession() {
    const queryClient = useQueryClient();
    const session = queryClient.getQueryData<Session | null>(["session"]);
    return session;
}
