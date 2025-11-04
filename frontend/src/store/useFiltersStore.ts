import type { Token } from "@/types/TokenAndAuthorTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";
interface AuthorsState {
    selectedAuthorId: number | null;
    selectedToken: Token | null;
    setSelectedAuthorId: (id: number | null) => void;
    setSelectedToken: (token: Token | null) => void;
}

const filtersStore = (
    set: (
        partial:
            | Partial<AuthorsState>
            | ((state: AuthorsState) => Partial<AuthorsState>),
    ) => void,
): AuthorsState => ({
    selectedAuthorId: null,
    selectedToken: null,
    setSelectedAuthorId: (id) => set({ selectedAuthorId: id ?? null }),
    setSelectedToken: (token) => set({ selectedToken: token ?? null }),
});

export const useLikedFiltersStore = create<AuthorsState>()(
    persist(
        filtersStore,
        {
            name: "filters-liked-storage",
        },
    ),
);

export const useFiltersStore = create<AuthorsState>()(
    persist(
        filtersStore,
        {
            name: "filter-storage",
        },
    ),
);

export const useUnlikedFiltersStore = create<AuthorsState>()(
    persist(
        filtersStore,
        {
            name: "filters-liked-storage",
        },
    ),
);

export const useFavoritesFiltersStore = create<AuthorsState>()(
    persist(
        filtersStore,
        {
            name: "filters-liked-storage",
        },
    ),
);
