import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export const sessionQueryKey = () => ["session"] as const;

function sessionGet() {
  return api.auth.getSession();
}

export function useSessionQuery() {
  return useQuery({
    queryKey: sessionQueryKey(),
    queryFn: sessionGet,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
