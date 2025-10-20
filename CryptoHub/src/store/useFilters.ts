import { create } from "zustand";
interface FilterState {
    selectedAuthorId: number | null;
    setSelectedAuthorId: (id: number | null) => void;
}

export const useFilters = create<FilterState>((set) => ({
    selectedAuthorId: null,
    setSelectedAuthorId(id) {
        set({ selectedAuthorId: id });
    },
}));
