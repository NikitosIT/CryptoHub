import { useEffect, useRef } from "react";
import type { TelegramPost } from "@/types/db";
import { useReactionsStore } from "@/store/useReactionStore";

export function useInitReactions(posts: TelegramPost[] | undefined) {
    const { initCounts } = useReactionsStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        if (!posts?.length) return;

        const liked: number[] = [];
        const disliked: number[] = [];

        const sanitizedPosts = posts.map((p) => {
            if (p.user_reaction === "like") liked.push(p.id);
            if (p.user_reaction === "dislike") disliked.push(p.id);

            return {
                ...p,
                like_count: p.like_count ?? 0,
                dislike_count: p.dislike_count ?? 0,
            };
        });

        initCounts(sanitizedPosts, liked, disliked);
        initialized.current = true;
    }, [posts, initCounts]);
}
