import { redirect, type ToOptions } from '@tanstack/react-router';

import { api } from '@/api';
import { queryClient } from '@/main';
import { profileQueryKey, type UserProfile } from '@/routes/profile/-api/useUserProfile';

export type RouteTo = ToOptions['to'];

type GuardOptions = {
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  allowTwoFactorNoAuth?: boolean;
  redirectTo?: RouteTo;
};

type CurrentLocation = {
  location: {
    pathname: string;
  };
};

type RouteFlags = {
  currentPath: string;
  isVerify2FAPath: boolean;
  isSetNicknamePath: boolean;
};

type AuthState = Awaited<ReturnType<typeof api.auth.getState>> & {
  isAuthenticated: boolean;
};

function throwRedirect(to: RouteTo) {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw redirect({
    to,
    replace: true,
  });
}

function getRouteFlags(pathname: string) {
  return {
    currentPath: pathname,
    isVerify2FAPath: pathname === '/auth/verify-2fa',
    isSetNicknamePath: pathname === '/auth/setnickname',
  };
}

async function getGuardAuthState() {
  const authState = await api.auth.getState(queryClient);

  return {
    ...authState,
    isAuthenticated: Boolean(authState.user?.id),
  };
}

function handleTwoFactorRedirect(
  auth: AuthState,
  route: RouteFlags,
  options: GuardOptions,
) {
  if (
    auth.hasPendingTwoFactor &&
    auth.isAuthenticated &&
    !route.isVerify2FAPath &&
    !options.allowTwoFactorNoAuth
  ) {
    throwRedirect('/auth/verify-2fa');
  }
}

function handleRequireAuth(auth: AuthState, options: GuardOptions) {
  if (options.requireAuth && !auth.isAuthenticated) {
    throwRedirect(options.redirectTo ?? '/auth');
  }
}

function handleRequireNoAuth(auth: AuthState, options: GuardOptions) {
  if (options.requireNoAuth && auth.isAuthenticatedWith2FA) {
    throwRedirect(options.redirectTo ?? '/profile');
  }
}

async function handleNicknameGuard(auth: AuthState, route: RouteFlags) {
  if (!route.isSetNicknamePath || !auth.isAuthenticated || !auth.user?.id) return;

  const cached = queryClient.getQueryData<UserProfile | null>(
    profileQueryKey(auth.user.id),
  );

  const profile = cached ?? (await api.profile.get(auth.user.id));
  if (profile?.nickname) {
    throwRedirect('/profile');
  }
}

function handleVerify2FARedirect(auth: AuthState, route: RouteFlags) {
  if (route.isVerify2FAPath && auth.isAuthenticatedWith2FA) {
    throwRedirect('/profile');
  }
}

export function createRouteGuard(options: GuardOptions) {
  return async ({ location }: CurrentLocation) => {
    const route = getRouteFlags(location.pathname);
    const auth = await getGuardAuthState();

    handleTwoFactorRedirect(auth, route, options);
    handleRequireAuth(auth, options);
    handleRequireNoAuth(auth, options);
    await handleNicknameGuard(auth, route);
    handleVerify2FARedirect(auth, route);
  };
}
