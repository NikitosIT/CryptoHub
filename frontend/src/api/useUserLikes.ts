import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useLikesStore } from "@/store/useLikesStore";
import { useUserStore } from "@/store/useUserStore";
import { useDislikesStore } from "@/store/useDislikeStore";

export function useUserLikes() {
    const user = useUserStore((s) => s.user);
    const { setLikes } = useLikesStore();
    const { setDislikes } = useDislikesStore();

    return useQuery({
        queryKey: ["userReactions", user?.id],
        enabled: !!user,
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from("reactions")
                .select("post_id, reaction_type")
                .eq("user_id", user.id);

            if (error) throw error;

            const likes = data.filter((r) => r.reaction_type === "like");
            const dislikes = data.filter((r) => r.reaction_type === "dislike");

            setLikes(likes);
            setDislikes(dislikes);

            return data;
        },
        staleTime: 1000 * 60 * 10,
    });
}
