import { redirect } from "@tanstack/react-router";

import { api } from "@/api";
import { queryClient } from "@/main";

interface GuardOptions {
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  allowTwoFactorNoAuth?: boolean;
  redirectTo?: string;
}

function throwRedirect(to: string): never {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw redirect({
    to,
    replace: true,
  });
}

export function createRouteGuard(options: GuardOptions = {}) {
  const {
    requireAuth = false,
    requireNoAuth = false,
    allowTwoFactorNoAuth = false,
    redirectTo,
  } = options;

  return async ({ location }: { location: { pathname: string } }) => {
    const currentPath = location.pathname;
    const isVerify2FAPath = currentPath === "/auth/verify-2fa";
    const isSetNicknamePath = currentPath === "/auth/setnickname";
    const { user, isAuthenticatedWith2FA, hasPendingTwoFactor } =
      await api.auth.getState(queryClient);
    const isAuthenticated = Boolean(user?.id);

    if (
      hasPendingTwoFactor &&
      isAuthenticated &&
      !isVerify2FAPath &&
      !allowTwoFactorNoAuth
    ) {
      throwRedirect("/auth/verify-2fa");
    }

    if (requireAuth) {
      if (!isAuthenticated) {
        throwRedirect(redirectTo || "/auth/");
      }
    }

    if (requireNoAuth) {
      if (isAuthenticatedWith2FA) {
        throwRedirect(redirectTo || "/profile/");
      }
    }
    if (isSetNicknamePath && isAuthenticated) {
      throwRedirect("/profile/");
    }

    if (isVerify2FAPath && isAuthenticatedWith2FA) {
      throwRedirect("/profile/");
    }
  };
}
