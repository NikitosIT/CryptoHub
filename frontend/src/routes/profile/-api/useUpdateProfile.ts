import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api';
import { useRequiredAuth } from '@/routes/auth/-hooks/useRequiredAuth';
import { setCachedProfile } from '@/routes/profile/-utils/profileCache';

import { profileQueryKey, type UserProfile } from './useUserProfile';
export type UpdateProfile = Omit<UserProfile, 'last_changed'>;
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { userId } = useRequiredAuth();
  return useMutation({
    mutationFn: async (payload: UpdateProfile) => {
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

      const optimisticProfile: UserProfile = {
        ...previousProfile,
        ...payload,
      };

      queryClient.setQueryData(profileQueryKey(userId), optimisticProfile);
      setCachedProfile(optimisticProfile);

      return { previousProfile };
    },

    onSuccess: (_data, payload) => {
      const current = queryClient.getQueryData<UserProfile | null>(
        profileQueryKey(userId),
      );
      const confirmed: UserProfile = {
        ...current,
        ...payload,
      };
      queryClient.setQueryData(profileQueryKey(userId), confirmed);
      setCachedProfile(confirmed);
    },

    onError: (_err, _payload, onMutateReturn) => {
      if (onMutateReturn?.previousProfile) {
        queryClient.setQueryData(profileQueryKey(userId), onMutateReturn.previousProfile);
        setCachedProfile(onMutateReturn.previousProfile);
      } else {
        queryClient.removeQueries({ queryKey: profileQueryKey(userId) });
        setCachedProfile(null);
      }
    },
  });
};
