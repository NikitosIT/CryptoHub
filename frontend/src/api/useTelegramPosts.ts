import { useInfiniteQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 10;

interface UseInfinitePostsParams {
  authorId?: number | null;
  tokenName?: string | null;
  mode?: "all" | "liked" | "disliked" | "favorites";
  userId?: string | null;
}

export function useTelegramPosts({
  authorId = null,
  tokenName = null,
  mode = "all",
  userId = null,
}: UseInfinitePostsParams) {
  const query = useInfiniteQuery({
    queryKey: ["posts", authorId, tokenName, mode, userId],
    initialPageParam: { createdAt: null, id: null },
    queryFn: async ({ pageParam }) => {
      const { createdAt, id } = pageParam ?? {};

      const { data, error } = await supabase.rpc("fetch_telegram_post", {
        p_cursor_created_at: createdAt,
        p_cursor_id: id,
        p_limit: PAGE_SIZE,
        p_author_id: authorId,
        p_token_name: tokenName,
        p_only_liked: mode === "liked",
        p_only_disliked: mode === "disliked",
        p_only_favorites: mode === "favorites",
        p_user_id: userId || null,
      });

      if (error) throw error;
      return data ?? [];
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage?.length) return undefined;
      const last = lastPage[lastPage.length - 1];
      return { createdAt: last.created_at, id: last.id };
    },

    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  return query;
}
