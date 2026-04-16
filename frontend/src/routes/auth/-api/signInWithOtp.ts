import { useMutation } from '@tanstack/react-query';

import { api } from '@/api';
import type { Email, NullableEmail, OTPCode } from '@/types/index';

type SignOtp = {
  email: NullableEmail;
  code: OTPCode;
};

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
    async mutationFn({ email, code }: SignOtp) {
      if (!email) {
        throw new Error('Email not found — try again');
      }

      return api.auth.verifyOtp(email, code);
    },
  });
};

export function useResendCode() {
  return useMutation({
    async mutationFn(email: Email) {
      await api.auth.signInWithOtp(email);
    },
  });
}
