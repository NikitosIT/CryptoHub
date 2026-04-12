import { redirect, type RegisteredRouter, type ToOptions } from '@tanstack/react-router';

import { api } from '@/api';
import { queryClient } from '@/main';
import { profileQueryKey, type UserProfile } from '@/routes/profile/-api/useUserProfile';

export type RouteTo = ToOptions<RegisteredRouter>['to'];

interface GuardOptions {
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  allowTwoFactorNoAuth?: boolean;
  redirectTo?: RouteTo;
}

interface CurrentLocation {
  location: {
    pathname: string;
  };
}

function throwRedirect(to: RouteTo) {
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

  return async ({ location }: CurrentLocation) => {
    const currentPath = location.pathname;
    const isVerify2FAPath = currentPath === '/auth/verify-2fa';

    const isSetNicknamePath = currentPath === '/auth/setnickname';

    const { user, isAuthenticatedWith2FA, hasPendingTwoFactor } =
      await api.auth.getState(queryClient);
    const isAuthenticated = Boolean(user?.id);

    if (
      hasPendingTwoFactor &&
      isAuthenticated &&
      !isVerify2FAPath &&
      !allowTwoFactorNoAuth
    ) {
      throwRedirect('/auth/verify-2fa');
    }

    if (requireAuth) {
      if (!isAuthenticated) {
        throwRedirect(redirectTo || '/auth');
      }
    }

    if (requireNoAuth) {
      if (isAuthenticatedWith2FA) {
        throwRedirect(redirectTo || '/profile');
      }
    }
    if (isSetNicknamePath && isAuthenticated) {
      const cached = queryClient.getQueryData<UserProfile | null>(
        profileQueryKey(user?.id),
      );
      const profile = cached ?? (await api.profile.get(user?.id));
      if (profile?.nickname) {
        throwRedirect('/profile');
      }
    }

    if (isVerify2FAPath && isAuthenticatedWith2FA) {
      throwRedirect('/profile');
    }
  };
}
