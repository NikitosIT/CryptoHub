import { create } from "zustand";
import { useLikesStore } from "./useLikesStore";

interface Dislike {
    post_id: number;
}

interface DislikesState {
    dislikes: Dislike[];
    setDislikes: (dislikes: Dislike[]) => void;
    toggleDislikeLocal: (postId: number, disliked: boolean) => void;
    removeDislike: (postId: number) => void;
    isDisliked: (postId: number) => boolean;
}

export const useDislikesStore = create<DislikesState>((set, get) => ({
    dislikes: [],

    setDislikes: (dislikes) => set({ dislikes }),

    toggleDislikeLocal: (postId, disliked) => {
        const { dislikes } = get();

        const newDislikes = disliked
            ? [...dislikes, { post_id: postId }]
            : dislikes.filter((d) => d.post_id !== postId);

        const { isLiked, toggleLikeLocal } = useLikesStore.getState();
        if (disliked && isLiked(postId)) toggleLikeLocal(postId, false);

        set({ dislikes: newDislikes });
    },

    removeDislike: (postId) =>
        set((state) => ({
            dislikes: state.dislikes.filter((d) => d.post_id !== postId),
        })),

    isDisliked: (postId) => get().dislikes.some((d) => d.post_id === postId),
}));
