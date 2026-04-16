import { useQuery } from '@tanstack/react-query';

import { api } from '@/api';

export type Author = {
  label: string;
  id: number;
};

export const authorsQueryKey = () => ['authors'] as const;

async function authorsList() {
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
