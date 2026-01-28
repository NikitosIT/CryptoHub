import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type { TelegramPost } from "@/types/db";

const POSTS_QUERY_KEY = ["posts"] as const;

export function useCommentsUpdateCountCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, delta }: { postId: number; delta: 1 | -1 }) => {
      return Promise.resolve({ postId, delta });
    },

    onMutate: async ({ postId, delta }) => {
      await queryClient.cancelQueries({ queryKey: POSTS_QUERY_KEY });

      const previous = queryClient.getQueriesData<InfiniteData<TelegramPost[]>>(
        {
          queryKey: POSTS_QUERY_KEY,
        }
      );

      queryClient.setQueriesData<InfiniteData<TelegramPost[]>>(
        { queryKey: POSTS_QUERY_KEY },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((post) => {
                if (post.id !== postId) return post;

                const newCount = Math.max((post.comments_count ?? 0) + delta, 0);
                return { ...post, comments_count: newCount };
              })
            ),
          };
        }
      );

      return { previous };
    },

    onError: (_err, _vars, onMutateReturn) => {
      if (onMutateReturn?.previous) {
        for (const [queryKey, data] of onMutateReturn.previous) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
  });
}
