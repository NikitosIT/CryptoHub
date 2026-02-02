import { useInfiniteQuery } from "@tanstack/react-query";

import { api } from "@/api";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { useFiltersForMode } from "@/store/useFiltersStore";

import { usePostsMode } from "../-hooks/usePostsMode";

const PAGE_SIZE = 10;

const postsQueryKey = (
  authorId?: number | null,
  tokenName?: string | null,
  mode?: "all" | "liked" | "disliked" | "favorites"
) => ["posts", authorId, tokenName, mode] as const;

export function useTelegramPosts() {
  const { selectedAuthorId: authorId, selectedToken } = useFiltersForMode();
  const tokenName = selectedToken?.value ?? null;
  const { isLoading: isAuthLoading } = useAuthState();
  const { mode } = usePostsMode();
  const query = useInfiniteQuery({
    queryKey: postsQueryKey(authorId, tokenName, mode),
    enabled: !isAuthLoading,
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

    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return query;
}
