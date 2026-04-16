import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useSessionQuery } from '@/routes/auth/-api/useSessionQuery';

export function useAuthCallback() {
  const navigate = useNavigate();
  const sessionQuery = useSessionQuery();
  const session = sessionQuery.data;
  const { isLoading } = sessionQuery;

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      void navigate({ to: '/auth', replace: true });
      return;
    }

    void navigate({ to: '/', replace: true });
  }, [session, isLoading, navigate]);

  return {
    isLoading,
  };
}
