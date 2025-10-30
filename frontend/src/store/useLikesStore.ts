import { create } from "zustand";
import { useDislikesStore } from "./useDislikeStore";

interface Like {
    post_id: number;
}

interface LikesState {
    likes: Like[];
    setLikes: (likes: Like[]) => void;
    toggleLikeLocal: (postId: number, liked: boolean) => void;
    removeLike: (postId: number) => void;
    isLiked: (postId: number) => boolean;
}

export const useLikesStore = create<LikesState>((set, get) => ({
    likes: [],

    setLikes: (likes) => set({ likes }),

    toggleLikeLocal: (postId, liked) => {
        const { likes } = get();

        const newLikes = liked
            ? [...likes, { post_id: postId }]
            : likes.filter((l) => l.post_id !== postId);

        const { isDisliked, toggleDislikeLocal } = useDislikesStore.getState();
        if (liked && isDisliked(postId)) toggleDislikeLocal(postId, false);

        set({ likes: newLikes });
    },
    removeLike: (postId) =>
        set((state) => ({
            likes: state.likes.filter((l) => l.post_id !== postId),
        })),

    isLiked: (postId) => get().likes.some((l) => l.post_id === postId),
}));
