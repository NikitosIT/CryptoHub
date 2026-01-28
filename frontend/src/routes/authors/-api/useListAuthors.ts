import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";
import type { Author } from "@/types/db";

export const authorsQueryKey = () => ["authors"] as const;

function authorsList(): Promise<Author[]> {
  return api.authors.list();
}

export const useListAuthors = () => {
  return useQuery<Author[]>({
    queryKey: authorsQueryKey(),
    queryFn: authorsList,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
