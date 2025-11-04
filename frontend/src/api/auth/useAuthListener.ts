import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useAuthListener() {
    const queryClient = useQueryClient();

    const { data: session, isLoading } = useQuery({
        queryKey: ["session"],
        queryFn: async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return data.session;
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });

    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                queryClient.setQueryData(["session"], newSession);

                const userId = newSession?.user?.id;
                if (userId) {
                    queryClient.invalidateQueries({
                        queryKey: ["profile", userId],
                    });
                } else {
                    queryClient.removeQueries({ queryKey: ["profile"] });
                }
            },
        );

        return () => sub.subscription.unsubscribe();
    }, [queryClient]);

    return { session, isLoading };
}
