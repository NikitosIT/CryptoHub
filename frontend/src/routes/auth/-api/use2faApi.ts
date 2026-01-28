import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type TwoFactorStatusResponse } from "@/api";

type TwoFactorPayload = {
  code: string;
  userId?: string | null;
};

export const twoFactorStatusQueryKey = (userId?: string | null) =>
  ["twoFactorStatus", userId] as const;

export function useTwoFactorStatus(userId?: string) {
  return useQuery({
    queryKey: twoFactorStatusQueryKey(userId),
    queryFn: () => api.twoFactor.getStatus(),
    enabled: Boolean(userId),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}

// Mutations

export function useRequestTwoFactor() {
  return useMutation({
    mutationFn: async () => {
      const data = await api.twoFactor.enable();
      if (!data.qrUrl) throw new Error("Failed to get QR code");
      return data;
    },
  });
}

export function useVerifyTwoFactorSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code }: TwoFactorPayload) => {
      const data = await api.twoFactor.verifySetup(code);
      if (!data.success) throw new Error("Code not verified");
      return data;
    },
    onSuccess: (_, { userId }) => {
      updateTwoFactorCache(queryClient, userId, { enabled: true });
    },
  });
}

export function useVerifyTwoFactorLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code }: TwoFactorPayload) => {
      const data = await api.twoFactor.verifyLogin(code);
      if (!data.verified) {
        const error = new Error(data.error || "Code not verified") as Error & {
          remainingAttempts?: number;
        };
        error.remainingAttempts = data.remainingAttempts;
        throw error;
      }
      return data;
    },
    onSuccess: (_, { userId }) => {
      updateTwoFactorCache(queryClient, userId, { enabled: true });
    },
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code }: TwoFactorPayload) => {
      const data = await api.twoFactor.disable(code);
      if (!data.success) throw new Error("Failed to disable 2FA");
      return data;
    },
    onSuccess: (_, { userId }) => {
      updateTwoFactorCache(queryClient, userId, { enabled: false });
    },
  });
}

// Helpers

function updateTwoFactorCache(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | null | undefined,
  status: { enabled: boolean },
) {
  if (userId) {
    queryClient.setQueryData<TwoFactorStatusResponse>(
      twoFactorStatusQueryKey(userId),
      { ...status, is_verified_for_current_session: true },
    );
  }
  void queryClient.invalidateQueries({ queryKey: twoFactorStatusQueryKey() });
}
