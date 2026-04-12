import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { api } from '@/api';
import { useSelectedAuthorId, useSelectedToken } from '@/store/useFiltersStore';

import { type PostMode, usePostsMode } from '../-hooks/usePostsMode';
import type { TelegramPost } from '../-types/post-types';

export interface FetchTelegramPostParams {
  cursorId: number | undefined;
  cursorCreatedAt: string | undefined;
  limit?: number;
  mode?: PostMode;
  authorId?: number | null;
  tokenName?: string | null;
}

type Cursor = {
  createdAt?: string;
  id?: number;
};

export const PAGE_SIZE = 10;

const postsQueryKey = (
  authorId: number | null,
  tokenName: string | null,
  mode: PostMode,
) => {
  const key = ['posts', authorId, tokenName, mode] as const;
  return key;
};

export function useTelegramPosts() {
  const { selectedAuthorId } = useSelectedAuthorId();
  const { selectedToken } = useSelectedToken();

  const tokenName = selectedToken?.value || null;
  const authorId = selectedAuthorId ?? null;

  const { mode } = usePostsMode();

  const queryKey = postsQueryKey(authorId, tokenName, mode);

  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: {
      id: undefined,
      createdAt: undefined,
    },
    queryFn: ({ pageParam }: { pageParam: Cursor }) => {
      return api.posts.list({
        cursorId: pageParam.id,
        cursorCreatedAt: pageParam.createdAt,
        limit: PAGE_SIZE,
        mode,
        authorId,
        tokenName,
      });
    },

    getNextPageParam: (lastPage: TelegramPost[]) => {
      if (!lastPage.length) return undefined;
      const last = lastPage[lastPage.length - 1];
      return { createdAt: last?.created_at ?? undefined, id: last?.id ?? undefined };
    },

    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  return query;
}
