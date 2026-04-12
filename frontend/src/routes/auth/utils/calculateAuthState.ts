import type { Session } from '@supabase/supabase-js';

import type { AuthStateData } from '../-hooks/useAuthState';
import type { TwoFactorStatusResponse } from '../-types';

export function calculateAuthState(
  session: Session | null,
  checkTwoFactor: boolean,
  twoFactorStatus: TwoFactorStatusResponse | null | undefined,
): AuthStateData {
  const user = session?.user;
  const isAuthenticated = Boolean(user?.id);
  const shouldCheckTwoFactor = checkTwoFactor && isAuthenticated;

  const isTwoFactorEnabled = shouldCheckTwoFactor && (twoFactorStatus?.enabled ?? false);
  const isTwoFactorVerified = shouldCheckTwoFactor
    ? (twoFactorStatus?.is_verified_for_current_session ?? false)
    : true;

  const hasPendingTwoFactor = isTwoFactorEnabled && !isTwoFactorVerified;
  const isAuthenticatedWith2FA = isAuthenticated && !hasPendingTwoFactor;

  return {
    user,
    hasPendingTwoFactor,
    isAuthenticatedWith2FA,
  };
}
