import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";
import type { Token } from "@/types/db";

export const tokensQueryKey = () => ["cryptotokens"] as const;

function tokensList(): Promise<Token[]> {
  return api.tokens.list();
}

export const useListTokens = () => {
  return useQuery<Token[]>({
    queryKey: tokensQueryKey(),
    queryFn: tokensList,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
