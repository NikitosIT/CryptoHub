import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/useUserStore";

export function useLikedPosts() {
    const { user } = useUserStore();

    return useQuery({
        queryKey: ["likedPosts", user?.id],
        enabled: !!user,
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .rpc("fetch_liked_posts", { p_user_id: user.id });

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 2, // 2 минуты кэш
    });
}
