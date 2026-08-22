import { create } from 'zustand';

import { type PostMode, usePostsMode } from '@/routes/posts/-hooks/usePostsMode';

export type SelectedToken = {
  label: string;
  value: string;
  imageUrl: string;
};

type FilterData = {
  selectedAuthorId: number | null;
  selectedToken: SelectedToken | null;
};

type FiltersByMode = Record<PostMode, FilterData>;

type FiltersStore = {
  filters: FiltersByMode;
  setSelectedAuthorId: (mode: PostMode, id: number | null) => void;
  setSelectedToken: (mode: PostMode, token: SelectedToken | null) => void;
};

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
  },
  setSelectedAuthorId(mode, id) {
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

  setSelectedToken(mode, token) {
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

  const setSelectedAuthorIdStore = useFiltersStore((state) => state.setSelectedAuthorId);

  const setSelectedAuthorId = (id: number | null) => {
    setSelectedAuthorIdStore(mode, id);
  };

  return {
    selectedAuthorId,
    setSelectedAuthorId,
  };
}

export function useSelectedToken() {
  const { mode } = usePostsMode();

  const selectedToken = useFiltersStore((state) => state.filters[mode].selectedToken);

  const setSelectedTokenStore = useFiltersStore((state) => state.setSelectedToken);

  const setSelectedToken = (token: SelectedToken | null) => {
    setSelectedTokenStore(mode, token);
  };

  return {
    selectedToken,
    setSelectedToken,
  };
}
