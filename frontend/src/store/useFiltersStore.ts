import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { usePostsMode } from "@/routes/posts/-hooks/usePostsMode";
import type { PostMode, Token } from "@/types/db";

interface FilterData {
  selectedAuthorId: number | null;
  selectedToken: Token | null;
}

type FiltersByMode = Record<PostMode, FilterData>;

interface FiltersStore {
  filters: FiltersByMode;
  setSelectedAuthorId: (mode: PostMode, id: number | null) => void;
  setSelectedToken: (mode: PostMode, token: Token | null) => void;
}

const defaultFilterData: FilterData = {
  selectedAuthorId: null,
  selectedToken: null,
};

export const useFiltersStore = create<FiltersStore>()(
  persist(
    (set) => ({
      filters: {
        all: { ...defaultFilterData },
        liked: { ...defaultFilterData },
        disliked: { ...defaultFilterData },
        favorites: { ...defaultFilterData },
      },

      setSelectedAuthorId: (mode, id) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [mode]: {
              ...state.filters[mode],
              selectedAuthorId: id,
            },
          },
        }));
      },

      setSelectedToken: (mode, token) => {
        set((state) => ({
          filters: {
            ...state.filters,
            [mode]: {
              ...state.filters[mode],
              selectedToken: token,
            },
          },
        }));
      },
    }),
    { name: "filters-storage" }
  )
);

export function useFiltersForMode() {
  const { mode } = usePostsMode();

  const selectedAuthorId = useFiltersStore(
    (state) => state.filters[mode].selectedAuthorId
  );

  const selectedToken = useFiltersStore(
    (state) => state.filters[mode].selectedToken
  );

  const setSelectedAuthorId = useFiltersStore(
    (state) => state.setSelectedAuthorId
  );

  const setSelectedToken = useFiltersStore((state) => state.setSelectedToken);

  const setters = useMemo(
    () => ({
      setSelectedAuthorId: (id: number | null) => setSelectedAuthorId(mode, id),

      setSelectedToken: (token: Token | null) => setSelectedToken(mode, token),
    }),
    [mode, setSelectedAuthorId, setSelectedToken]
  );

  return {
    selectedAuthorId,
    selectedToken,
    ...setters,
  };
}
