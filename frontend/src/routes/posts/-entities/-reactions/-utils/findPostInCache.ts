import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type { TelegramPost } from '../../../-types/post-types';

export function findPostInCache(queryClient: QueryClient, postId: number) {
  const all = queryClient.getQueriesData<InfiniteData<TelegramPost[]>>({
    queryKey: ['posts'],
  });

  for (const [, data] of all) {
    if (!data) continue;
    for (const page of data.pages) {
      const found = page.find((p) => p.id === postId);
      if (found) return found;
    }
  }

  return null;
}
