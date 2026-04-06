import { useEffect, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { ROUTES } from '@/constants/routesPath';
import { useToast } from '@/hooks/useToast';
import { useAuthState } from '@/routes/auth/-hooks/useAuthState';
import { useUserProfile } from '@/routes/profile/-api/useUserProfile';
import { validateRedirectTo } from '@/utils/redirectValidation';

type CallbackSearchParams = {
  redirectTo?: string;
};

export function useAuthCallback() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const search = useSearch({ from: ROUTES.AUTH.CALLBACK }) as CallbackSearchParams;
  const { showError } = useToast();

  const {
    user,
    isLoading: isAuthLoading,
    hasPendingTwoFactor,
  } = useAuthState({ checkTwoFactor: true });

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useUserProfile();

  const searchRedirectTo = search.redirectTo;
  const profileNickname = profile?.nickname;

  const redirectTo = useMemo(() => {
    const validatedRedirect = validateRedirectTo(searchRedirectTo);
    if (validatedRedirect) {
      return validatedRedirect;
    }
    return profileNickname ? ROUTES.PROFILE.INDEX : ROUTES.AUTH.SETNICKNAME;
  }, [searchRedirectTo, profileNickname]);

  useEffect(() => {
    if (isAuthLoading || user?.id === undefined) return;

    if (!user.id) {
      navigate({ to: ROUTES.AUTH.INDEX, replace: true });
      return;
    }

    if (hasPendingTwoFactor) {
      navigate({
        to: ROUTES.AUTH.VERIFY2FA,
        replace: true,
      });
      return;
    }

    if (isProfileLoading) return;

    if (isProfileError) {
      const errorMessage =
        profileError instanceof Error
          ? profileError.message
          : 'Failed to load profile. Please try again later.';
      showError(errorMessage);

      navigate({ to: ROUTES.PROFILE.INDEX, replace: true });
      return;
    }

    navigate({ to: redirectTo, replace: true });
  }, [
    user?.id,
    isAuthLoading,
    isProfileLoading,
    hasPendingTwoFactor,
    isProfileError,
    profileError,
    redirectTo,
    navigate,
    showError,
  ]);

  return {
    isProfileError,
    isLoading: isAuthLoading || isProfileLoading,
  };
}
