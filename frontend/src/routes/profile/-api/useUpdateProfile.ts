import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api';
import { useRequiredAuth } from '@/routes/auth/-hooks/useRequiredAuth';
import {
  setCachedProfile,
  updateProfileCache,
} from '@/routes/profile/-utils/profileCache';

import { profileQueryKey, type UserProfile } from './useUserProfile';

export interface UpdateProfilePayload {
  nickname?: string;
  profile_logo?: string;
}

export interface UpdateProfileResponse {
  nickname?: string | null;
  profile_logo?: string | null;
  next_nickname_change_date?: string | null;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { userId } = useRequiredAuth();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      return await api.profile.update({
        ...payload,
      });
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: profileQueryKey(userId),
      });

      const previousProfile = queryClient.getQueryData<UserProfile | null>(
        profileQueryKey(userId),
      );

      if (previousProfile && userId) {
        const optimisticProfile = {
          ...previousProfile,
          ...payload,
        };
        queryClient.setQueryData(profileQueryKey(userId), optimisticProfile);
        updateProfileCache(payload);
      }

      return { previousProfile };
    },

    onError: (_err, _payload, onMutateReturn) => {
      if (onMutateReturn?.previousProfile) {
        queryClient.setQueryData(profileQueryKey(userId), onMutateReturn.previousProfile);
        setCachedProfile(onMutateReturn.previousProfile);
      }
    },
  });
};
