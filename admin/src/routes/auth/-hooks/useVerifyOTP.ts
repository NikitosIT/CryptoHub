import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useVerifyOtp } from '@/routes/auth/-api/signInWithOtp';
import { useSessionQuery } from '@/routes/auth/-api/useSessionQuery';

type OtpFormValues = { code: string };

export function useVerifyOTP() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/verify' });
  const email: string | null = search.email ?? null;
  const isEmailLogin = search.mode === 'email' || Boolean(email);

  const verifyOtp = useVerifyOtp();
  const sessionQuery = useSessionQuery();
  const session = sessionQuery.data;

  const isOtpSuccess = verifyOtp.isSuccess;

  const onSubmit = async ({ code }: OtpFormValues) => {
    await verifyOtp.mutateAsync({ email, code });
  };

  useEffect(() => {
    if (sessionQuery.isLoading) return;

    if (!isEmailLogin && !session) {
      void navigate({ to: '/auth', replace: true });
      return;
    }

    if (isEmailLogin && isOtpSuccess && session) {
      void navigate({ to: '/auth/callback', replace: true });
      return;
    }

    if (session && !isEmailLogin) {
      void navigate({ to: '/auth/callback', replace: true });
    }
  }, [sessionQuery.isLoading, isEmailLogin, session, isOtpSuccess, navigate]);

  const showOTPField = isEmailLogin && !isOtpSuccess;

  return {
    showOTPField,
    isAuthLoading: sessionQuery.isLoading,
    isOtpSubmitting: verifyOtp.isPending,
    onSubmit,
  };
}
