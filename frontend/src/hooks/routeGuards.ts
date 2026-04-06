import { redirect } from '@tanstack/react-router';

import { api } from '@/api';
import { ROUTES } from '@/constants/routesPath';
import { queryClient } from '@/main';
import { profileQueryKey, type UserProfile } from '@/routes/profile/-api/useUserProfile';

interface GuardOptions {
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  allowTwoFactorNoAuth?: boolean;
  redirectTo?: string;
}

function throwRedirect(to: string) {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw redirect({
    to,
    replace: true,
  });
}

export function createRouteGuard(options: GuardOptions) {
  const {
    requireAuth = false,
    requireNoAuth = false,
    allowTwoFactorNoAuth = false,
    redirectTo,
  } = options;

  return async ({ location }: { location: { pathname: string } }) => {
    const currentPath = location.pathname;
    // TODO create seperate object ROUTES and write all routes into. Then use ROUTES instead of '/auth/verify-2fa' etc.
    const isVerify2FAPath = currentPath === ROUTES.AUTH.VERIFY2FA;
    const isSetNicknamePath = currentPath === ROUTES.AUTH.SETNICKNAME;
    const { user, isAuthenticatedWith2FA, hasPendingTwoFactor } =
      await api.auth.getState(queryClient);
    const isAuthenticated = Boolean(user?.id);

    if (
      hasPendingTwoFactor &&
      isAuthenticated &&
      !isVerify2FAPath &&
      !allowTwoFactorNoAuth
    ) {
      throwRedirect(ROUTES.AUTH.VERIFY2FA);
    }

    if (requireAuth) {
      if (!isAuthenticated) {
        throwRedirect(redirectTo || ROUTES.AUTH.INDEX);
      }
    }

    if (requireNoAuth) {
      if (isAuthenticatedWith2FA) {
        throwRedirect(redirectTo || ROUTES.PROFILE.INDEX);
      }
    }
    if (isSetNicknamePath && isAuthenticated) {
      const cached = queryClient.getQueryData<UserProfile | null>(
        profileQueryKey(user?.id),
      );
      const profile = cached ?? (await api.profile.get(user?.id));
      if (profile?.nickname) {
        throwRedirect(ROUTES.PROFILE.INDEX);
      }
    }

    if (isVerify2FAPath && isAuthenticatedWith2FA) {
      throwRedirect(ROUTES.PROFILE.INDEX);
    }
  };
}
