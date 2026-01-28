import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type UserProfile } from "@/api";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import {
  getCachedProfile,
  setCachedProfile,
} from "@/routes/profile/-utils/profileCache";

export const profileQueryKey = (userId?: string) =>
  userId ? (["profile", userId] as const) : (["profile"] as const);

export function useUserProfile() {
  const queryClient = useQueryClient();
  const { user, isAuthenticatedWith2FA } = useAuthState({
    checkTwoFactor: true,
  });
  const cachedProfile = getCachedProfile();

  const query = useQuery<UserProfile | null>({
    queryKey: profileQueryKey(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;
      const profile = await api.profile.get(user.id);
      if (profile) {
        setCachedProfile(profile);
      }
      return profile;
    },
    enabled: isAuthenticatedWith2FA && Boolean(user?.id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: cachedProfile ?? undefined,
    initialData: () => {
      const cached = queryClient.getQueryData<UserProfile | null>(
        profileQueryKey(user?.id),
      );
      return cached ?? (cachedProfile as UserProfile | null) ?? undefined;
    },
  });

  return query;
}
