import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const useCheckUserProfile = (userId?: string) => {
    return useQuery({
        queryKey: ["profile", userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await supabase
                .from("profiles")
                .select("nickname")
                .eq("id", userId)
                .maybeSingle();

            if (error) throw new Error(error.message);
            return data;
        },
        enabled: !!userId,
    });
};
