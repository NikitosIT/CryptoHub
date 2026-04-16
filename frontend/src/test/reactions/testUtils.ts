import type { InfiniteData } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

import type { TelegramPost } from '@/routes/posts/-types/post-types';

export function createPost(overrides: Partial<TelegramPost> = {}): TelegramPost {
  return {
    id: 1,
    text_caption: null,
    text_entities: null,
    media: null,
    tg_author_id: null,
    author_name: '',
    author_link: '',
    like_count: 0,
    dislike_count: 0,
    comments_count: null,
    reaction_type: null,
    user_reaction: null,
    is_favorite: false,
    created_at: null,
    ...overrides,
  };
}

export function createQueryClientWithPost(post: TelegramPost): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData<InfiniteData<TelegramPost[]>>(['posts'], {
    pages: [[post]],
    pageParams: [undefined],
  });
  return queryClient;
}
