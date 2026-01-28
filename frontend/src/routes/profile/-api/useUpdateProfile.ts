import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api, type UpdateProfilePayload, type UserProfile } from "@/api";
import {
  setCachedProfile,
  updateProfileCache,
} from "@/routes/profile/-utils/profileCache";

import { profileQueryKey } from "./useUserProfile";

export const useUpdateProfile = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<UpdateProfilePayload, "user_id">) => {
      if (!userId) throw new Error("User not found");

      return await api.profile.update({
        user_id: userId,
        ...payload,
      });
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: profileQueryKey(userId),
      });

      const previousProfile = queryClient.getQueryData<UserProfile | null>(
        profileQueryKey(userId)
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
        queryClient.setQueryData(
          profileQueryKey(userId),
          onMutateReturn.previousProfile
        );
        setCachedProfile(onMutateReturn.previousProfile);
      }
    },
  });
};
