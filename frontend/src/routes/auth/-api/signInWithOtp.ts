import { useMutation } from '@tanstack/react-query';

import { api } from '@/api';
import type { Email, NullableEmail, OTPCode } from '@/types/index';

interface SignOtp {
  email: NullableEmail;
  code: OTPCode;
}

export const useSendEmail = (options?: {
  onSuccess?: (email: Email) => void;
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
    mutationFn: async ({ email, code }: SignOtp) => {
      if (!email) {
        throw new Error('Email not found — try again');
      }

      return await api.auth.verifyOtp(email, code);
    },
  });
};

export function useResendCode() {
  return useMutation({
    mutationFn: async (email: Email) => {
      await api.auth.signInWithOtp(email);
    },
  });
}
