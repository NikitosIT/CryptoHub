import { create } from "zustand";

interface Like {
    post_id: number;
}

interface LikesState {
    likes: Like[];
    likeCounts: Record<number, number>;
    setLikes: (likes: Like[]) => void;
    setLikeCounts: (counts: Record<number, number>) => void;
    toggleLikeLocal: (postId: number, liked: boolean) => void;
}

export const useLikesStore = create<LikesState>((set) => ({
    likes: [],
    likeCounts: {},

    setLikes: (likes) => set({ likes }),
    setLikeCounts: (counts) => set({ likeCounts: counts }),

    toggleLikeLocal: (postId, liked) =>
        set((state) => ({
            likes: liked
                ? [...state.likes, { post_id: postId }]
                : state.likes.filter((l) => l.post_id !== postId),
            likeCounts: {
                ...state.likeCounts,
                [postId]: (state.likeCounts[postId] || 0) + (liked ? 1 : -1),
            },
        })),
}));
