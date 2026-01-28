import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";

export const useSendEmail = (options?: {
  onSuccess?: (email: string) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: api.auth.signInWithOtp,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async ({
      email,
      code,
    }: {
      email: string | null;
      code: string;
    }) => {
      if (!email) {
        throw new Error("Email not found — try again");
      }

      return await api.auth.verifyOtp(email, code);
    },
  });
};

export function useResendCode() {
  return useMutation({
    mutationFn: async (email: string) => {
      await api.auth.signInWithOtp(email);
    },
  });
}
