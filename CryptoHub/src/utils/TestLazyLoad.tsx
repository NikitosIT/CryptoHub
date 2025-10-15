import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 10;

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    initialPageParam: { createdAt: null, id: null },
    queryFn: async ({ pageParam }) => {
      const { createdAt, id } = pageParam ?? {};
      const { data, error } = await supabase.rpc("fetch_posts", {
        p_cursor_created_at: createdAt,
        p_cursor_id: id,
        p_limit: PAGE_SIZE,
      });
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.length) return undefined;
      const last = lastPage[lastPage.length - 1];
      return { createdAt: last.created_at, id: last.id };
    },
  });
}
