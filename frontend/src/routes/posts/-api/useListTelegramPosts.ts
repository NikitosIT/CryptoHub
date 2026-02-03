import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import { api } from "@/api";
import { useFiltersForMode } from "@/store/useFiltersStore";

import { usePostsMode } from "../-hooks/usePostsMode";

export const PAGE_SIZE = 10;

const postsQueryKey = (
  authorId: number | null,
  tokenName: string | null,
  mode: "all" | "liked" | "disliked" | "favorites",
) => {
  const key = ["posts", authorId ?? null, tokenName ?? null, mode] as const;
  return key;
};

export function useTelegramPosts() {
  const { selectedAuthorId, selectedToken } = useFiltersForMode();

  const tokenName = selectedToken?.value || null;
  const authorId = selectedAuthorId ?? null;

  const { mode } = usePostsMode();

  const queryKey = postsQueryKey(authorId, tokenName, mode);

  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: { createdAt: null, id: null } as {
      createdAt: string | null;
      id: number | null;
    },
    queryFn: ({ pageParam }) => {
      const { createdAt, id } = pageParam;

      return api.posts.list({
        cursorId: id,
        cursorCreatedAt: createdAt,
        limit: PAGE_SIZE,
        mode,
        authorId,
        tokenName,
      });
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage.length) return undefined;
      const last = lastPage[lastPage.length - 1];
      return { createdAt: last.created_at, id: last.id };
    },

    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  return query;
}
