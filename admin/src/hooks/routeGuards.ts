import { redirect } from "@tanstack/react-router";

import { api } from "@/api";

interface GuardOptions {
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  redirectTo?: string;
}

export function createRouteGuard(options: GuardOptions = {}) {
  const { requireAuth = false, requireNoAuth = false, redirectTo } = options;

  return async () => {
    const session = await api.auth.getSession();
    const isAuthenticated = Boolean(session?.user);

    if (requireAuth) {
      if (!isAuthenticated) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({
          to: redirectTo || "/auth/",
          replace: true,
        });
      }
    }

    if (requireNoAuth) {
      if (isAuthenticated) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw redirect({
          to: redirectTo || "/",
          replace: true,
        });
      }
    }
  };
}
