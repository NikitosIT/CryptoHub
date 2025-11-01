import type { Token } from "@/types/TokenAndAuthorTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";
interface AuthorsState {
    selectedAuthorId: number | null;
    selectedToken: Token | null;
    setSelectedAuthorId: (id: number | null) => void;
    setSelectedToken: (token: Token | null) => void;
}

export const useLikedFiltersStore = create<AuthorsState>()(
    persist(
        (set) => ({
            selectedAuthorId: null,
            selectedToken: null,
            setSelectedAuthorId: (id) => set({ selectedAuthorId: id }),
            setSelectedToken: (token) => set({ selectedToken: token }),
        }),
        {
            name: "filters-liked-storage",
        },
    ),
);

export const useFiltersStore = create<AuthorsState>()(
    persist(
        (set) => ({
            selectedAuthorId: null,
            selectedToken: null,
            setSelectedAuthorId: (id) => set({ selectedAuthorId: id }),
            setSelectedToken: (token) => set({ selectedToken: token }),
        }),
        {
            name: "filter-storage",
        },
    ),
);

export const useUnlikedFiltersStore = create<AuthorsState>()(
    persist(
        (set) => ({
            selectedAuthorId: null,
            selectedToken: null,
            setSelectedAuthorId: (id) => set({ selectedAuthorId: id }),
            setSelectedToken: (token) => set({ selectedToken: token }),
        }),
        {
            name: "filters-liked-storage",
        },
    ),
);
