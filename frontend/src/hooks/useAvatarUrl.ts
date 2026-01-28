import { useQueryClient } from "@tanstack/react-query";

import {
  profileQueryKey,
  useUserProfile,
} from "@/routes/profile/-api/useUserProfile";
import { getCachedProfile } from "@/routes/profile/-utils/profileCache";
import { getPublicAvatarUrl } from "@/utils/storage";

import { useAuthState } from "../routes/auth/-hooks/useAuthState";

export function useAvatarUrl() {
  const queryClient = useQueryClient();
  const { user } = useAuthState({
    checkTwoFactor: true,
  });

  const { data: profile, isLoading } = useUserProfile();

  const avatarUrl = (() => {
    if (!user?.id) return null;

    if (profile?.profile_logo) {
      return getPublicAvatarUrl(profile.profile_logo);
    }

    const queryCached = queryClient.getQueryData<{
      profile_logo: string | null;
    } | null>(profileQueryKey());
    if (queryCached?.profile_logo) {
      return getPublicAvatarUrl(queryCached.profile_logo);
    }

    const localStorageCached = getCachedProfile();
    if (localStorageCached?.profile_logo) {
      return getPublicAvatarUrl(localStorageCached.profile_logo);
    }

    return null;
  })();

  return {
    avatarUrl,
    isLoading,
  };
}
