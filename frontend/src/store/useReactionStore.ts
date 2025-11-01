import { create } from "zustand";
import { toggleReactions } from "@/lib/toggleReactions";

interface ReactionsState {
    likeCounts: Record<number, number>;
    dislikeCounts: Record<number, number>;
    likedPosts: Set<number>;
    dislikedPosts: Set<number>;

    initCounts: (
        posts: { id: number; like_count: number; dislike_count: number }[],
        liked: number[],
        disliked: number[],
    ) => void;

    toggleLike: (postId: number, userId: string) => Promise<void>;
    toggleDislike: (postId: number, userId: string) => Promise<void>;
}

export const useReactionsStore = create<ReactionsState>((set, get) => ({
    likeCounts: {},
    dislikeCounts: {},
    likedPosts: new Set(),
    dislikedPosts: new Set(),

    initCounts: (posts, liked, disliked) => {
        const likeCounts: Record<number, number> = {};
        const dislikeCounts: Record<number, number> = {};

        for (const post of posts) {
            likeCounts[post.id] = post.like_count ?? 0;
            dislikeCounts[post.id] = post.dislike_count ?? 0;
        }

        set({
            likeCounts,
            dislikeCounts,
            likedPosts: new Set(liked),
            dislikedPosts: new Set(disliked),
        });
    },

    toggleLike: async (postId, userId) => {
        const { likedPosts, dislikedPosts, likeCounts, dislikeCounts } = get();
        const isLiked = likedPosts.has(postId);
        const isDisliked = dislikedPosts.has(postId);

        const newLikes = new Set(likedPosts);
        const newDislikes = new Set(dislikedPosts);

        let newLikeCount = likeCounts[postId] ?? 0;
        let newDislikeCount = dislikeCounts[postId] ?? 0;

        if (isLiked) {
            newLikes.delete(postId);
            newLikeCount = Math.max(0, newLikeCount - 1);
        } else {
            newLikes.add(postId);
            newLikeCount += 1;

            if (isDisliked) {
                newDislikes.delete(postId);
                newDislikeCount = Math.max(0, newDislikeCount - 1);
            }
        }

        set({
            likedPosts: newLikes,
            dislikedPosts: newDislikes,
            likeCounts: { ...likeCounts, [postId]: newLikeCount },
            dislikeCounts: { ...dislikeCounts, [postId]: newDislikeCount },
        });

        try {
            await toggleReactions(postId, "like", userId);
        } catch (err) {
            console.error("Ошибка toggleLike:", err);
        }
    },

    toggleDislike: async (postId, userId) => {
        const { likedPosts, dislikedPosts, likeCounts, dislikeCounts } = get();
        const isLiked = likedPosts.has(postId);
        const isDisliked = dislikedPosts.has(postId);

        const newLikes = new Set(likedPosts);
        const newDislikes = new Set(dislikedPosts);

        let newLikeCount = likeCounts[postId] ?? 0;
        let newDislikeCount = dislikeCounts[postId] ?? 0;

        if (isDisliked) {
            newDislikes.delete(postId);
            newDislikeCount = Math.max(0, newDislikeCount - 1);
        } else {
            newDislikes.add(postId);
            newDislikeCount += 1;

            if (isLiked) {
                newLikes.delete(postId);
                newLikeCount = Math.max(0, newLikeCount - 1);
            }
        }

        set({
            likedPosts: newLikes,
            dislikedPosts: newDislikes,
            likeCounts: { ...likeCounts, [postId]: newLikeCount },
            dislikeCounts: { ...dislikeCounts, [postId]: newDislikeCount },
        });

        try {
            await toggleReactions(postId, "dislike", userId);
        } catch (err) {
            console.error("Ошибка toggleDislike:", err);
        }
    },
}));
