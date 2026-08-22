import { useMutation } from '@tanstack/react-query';

import { api } from '@/api';

export type CheckEmailResponse = {
  success: boolean;
  exists?: boolean;
  error?: string;
};

export const useSendEmail = (options?: {
  onSuccess?: (email: string) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    async mutationFn(email: string) {
      await api.admin.checkEmail(email);
      return api.auth.signInWithOtp(email);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    async mutationFn({ email, code }: { email: string | null; code: string }) {
      if (!email) {
        throw new Error('Email not found — try again');
      }

      return api.auth.verifyOtp(email, code);
    },
  });
};
