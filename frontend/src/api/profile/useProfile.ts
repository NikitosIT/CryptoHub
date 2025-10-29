import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/useUserStore";
import { useQuery } from "@tanstack/react-query";

export const useProfile = () => {
    const { user } = useUserStore();

    return useQuery({
        queryKey: ["profile", user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from("profiles")
                .select("nickname, last_changed")
                .eq("id", user.id)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });
};
