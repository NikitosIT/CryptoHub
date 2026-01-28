import type { User } from "@supabase/supabase-js";

import { calculateAuthState } from "@/api";
import { useSessionQuery } from "@/api/useSessionQuery";
import { useTwoFactorStatus } from "@/routes/auth/-api/use2faApi";

export interface UseAuthStateOptions {
  checkTwoFactor?: boolean;
}

export interface UseAuthStateReturn {
  isAuthenticatedWith2FA: boolean;
  user: User | undefined;
  hasPendingTwoFactor: boolean;
  isLoading: boolean;
}

//use for react components
export function useAuthState(
  options: UseAuthStateOptions = {},
): UseAuthStateReturn {
  const { checkTwoFactor = false } = options;

  const sessionQuery = useSessionQuery();
  const session = sessionQuery.data ?? null;

  const twoFactorQuery = useTwoFactorStatus(
    checkTwoFactor ? session?.user.id : undefined,
  );
  const twoFactorStatus = twoFactorQuery.data;

  const { user, hasPendingTwoFactor, isAuthenticatedWith2FA } =
    calculateAuthState(session, checkTwoFactor, twoFactorStatus);

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
