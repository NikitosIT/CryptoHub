import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import type { TelegramPost } from "@/types/db";

export function updatePostInCache(
  qc: QueryClient,
  postId: number,
  updater: (post: TelegramPost) => TelegramPost
) {
  qc.setQueriesData<InfiniteData<TelegramPost[]>>(
    { queryKey: ["posts"] },
    (old) => {
      if (!old) return old;

      let updated = false;

      return {
        ...old,
        pages: old.pages.map((page) => {
          if (updated) return page;

          const index = page.findIndex((p) => p.id === postId);
          if (index === -1) return page;

          updated = true;

          const nextPage = [...page];
          nextPage[index] = updater(nextPage[index]);

          return nextPage;
        }),
      };
    }
  );
}
