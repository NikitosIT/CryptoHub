import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useLikesStore } from "@/store/useLikesStore";
import { useUserStore } from "@/store/useUserStore";

export function useUserLikes() {
    const user = useUserStore((s) => s.user);
    const { setLikes } = useLikesStore();

    return useQuery({
        queryKey: ["userLikes", user?.id],
        enabled: !!user,
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("likes")
                .select("post_id")
                .eq("user_id", user.id);

            if (error) throw error;
            setLikes(data || []);
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}
