import { useQuery } from '@tanstack/react-query';

import { getSession } from '@/api';

export const sessionQueryKey = () => ['session'] as const;

// todo move to auth
export function useSessionQuery() {
  return useQuery({
    queryKey: sessionQueryKey(),
    queryFn: getSession,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
