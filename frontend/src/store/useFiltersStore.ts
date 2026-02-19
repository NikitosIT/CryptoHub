import { useMemo } from 'react';
import { create } from 'zustand';

import { type PostMode, usePostsMode } from '@/routes/posts/-hooks/usePostsMode';
import type { Token } from '@/types/db';

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

export const useFiltersStore = create<FiltersStore>()((set) => ({
  filters: {
    all: { ...defaultFilterData },
    liked: { ...defaultFilterData },
    disliked: { ...defaultFilterData },
    favorites: { ...defaultFilterData },
    selectedToken: null,
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
}));

export function useSelectedAuthorId() {
  const { mode } = usePostsMode();
  const selectedAuthorId = useFiltersStore(
    (state) => state.filters[mode].selectedAuthorId,
  );
  const setSelectedAuthorId = useFiltersStore((state) => state.setSelectedAuthorId);

  return useMemo(
    () => ({
      selectedAuthorId,
      setSelectedAuthorId: (id: number | null) => setSelectedAuthorId(mode, id),
    }),
    [mode, selectedAuthorId, setSelectedAuthorId],
  );
}

export function useSelectedToken() {
  const { mode } = usePostsMode();
  const selectedToken = useFiltersStore((state) => state.filters[mode].selectedToken);
  const setSelectedToken = useFiltersStore((state) => state.setSelectedToken);

  return useMemo(
    () => ({
      selectedToken,
      setSelectedToken: (token: Token | null) => setSelectedToken(mode, token),
    }),
    [mode, selectedToken, setSelectedToken],
  );
}
