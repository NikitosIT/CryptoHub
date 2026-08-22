import { useQuery } from '@tanstack/react-query';

import { api } from '@/api';

export function useProfilesList() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => api.admin.listProfiles(),
  });
}
