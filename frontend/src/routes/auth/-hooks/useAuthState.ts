import type { User } from '@supabase/supabase-js';

import { useTwoFactorStatus } from '@/routes/auth/-api/use2faApi';
import { useSessionQuery } from '@/routes/auth/-api/useSessionQuery';

import { calculateAuthState } from '../utils/calculateAuthState';

interface UseAuthStateOptions {
  checkTwoFactor?: boolean;
}

interface BaseAuthState {
  user: User | undefined;
  hasPendingTwoFactor?: boolean;
  isAuthenticatedWith2FA?: boolean;
}

interface UseAuthStateReturn extends BaseAuthState {
  isLoading?: boolean;
}

export type AuthStateData = BaseAuthState;

export function useAuthState(options: UseAuthStateOptions = {}): UseAuthStateReturn {
  const { checkTwoFactor = false } = options;

  const sessionQuery = useSessionQuery();
  const session = sessionQuery.data ?? null;

  const twoFactorQuery = useTwoFactorStatus(
    checkTwoFactor ? session?.user.id : undefined,
  );
  const twoFactorStatus = twoFactorQuery.data;

  const { user, hasPendingTwoFactor, isAuthenticatedWith2FA } = calculateAuthState(
    session,
    checkTwoFactor,
    twoFactorStatus,
  );

  const isTwoFactorLoading =
    checkTwoFactor && (twoFactorQuery.isLoading || twoFactorQuery.isFetching);

  const isLoading =
    sessionQuery.isPending || sessionQuery.isFetching || isTwoFactorLoading;
  return {
    isAuthenticatedWith2FA,
    hasPendingTwoFactor,
    user,
    isLoading,
  };
}
