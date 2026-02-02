import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { api } from '@/api';
import { useAuthState } from '@/routes/auth/-hooks/useAuthState';
import { useFiltersForMode } from '@/store/useFiltersStore';

import { usePostsMode } from '../-hooks/usePostsMode';

const PAGE_SIZE = 10;

const postsQueryKey = (
  authorId: number | null,
  tokenName: string | null,
  mode: 'all' | 'liked' | 'disliked' | 'favorites',
) => {
  const key = ['posts', authorId ?? null, tokenName ?? null, mode] as const;
  return key;
};

export function useTelegramPosts() {
  const { selectedAuthorId, selectedToken } = useFiltersForMode();
  console.log('useTelegramPosts', selectedToken);
  
  // Ensure strict null for undefined/null values to maintain stable query keys
  // If selectedToken.value is undefined or empty string, treat as null (no filter)
  const tokenName = selectedToken?.value || null;
  const authorId = selectedAuthorId ?? null;

  // We don't disable the query based on auth loading anymore to ensure cache hits work instantly
  // const { isLoading: isAuthLoading } = useAuthState(); 
  const { mode } = usePostsMode();
  console.log('mode', mode);

  const queryKey = postsQueryKey(authorId, tokenName, mode);
  
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: { createdAt: null, id: null } as {
      createdAt: string | null;
      id: number | null;
    },
    queryFn: ({ pageParam }) => {
      console.log('queryFn');
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

    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData, // Use previous data during transitions
  });

  return query;
}
