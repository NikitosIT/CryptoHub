import { create } from "zustand";
import { persist } from "zustand/middleware";
interface AuthorsState {
    selectedAuthorId: number | null;
    setSelectedAuthorId: (id: number | null) => void;
}

export const useAuthorsStore = create<AuthorsState>()(
    persist(
        (set) => ({
            selectedAuthorId: null,
            setSelectedAuthorId: (id) => set({ selectedAuthorId: id }),
        }),
        {
            name: "authors-storage",
        },
    ),
);
