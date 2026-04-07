import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { ROUTES } from '@/constants/routesPath';
import { useToast } from '@/hooks/useToast';
import { codeSchema } from '@/lib/validatorSchemas';
import { useVerifyOtp } from '@/routes/auth/-api/signInWithOtp';
import { useAuthState } from '@/routes/auth/-hooks/useAuthState';
import type { Code, Email, NullableEmail } from '@/types';
import { getErrorMessage } from '@/utils/errorUtils';

import { useCodeForm } from './useCodeForm';

type OtpFormValues = { code: Code };

export type VerifySearchParams = {
  redirectTo?: string;
  mode?: 'email';
  email?: Email;
};

export function useVerifyOTP() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const search = useSearch({ from: ROUTES.AUTH.VERIFY }) as VerifySearchParams;
  const email: NullableEmail = search.email ?? null;
  const isEmailLogin = search.mode === 'email' || Boolean(email);
  const { showError } = useToast();

  const verifyOtp = useVerifyOtp();

  const {
    user,
    isLoading: isAuthLoading,
    hasPendingTwoFactor,
    isAuthenticatedWith2FA,
  } = useAuthState({ checkTwoFactor: true });

  const {
    control,
    codeFormErrors: otpFormErrors,
    handleSubmit,
  } = useCodeForm({ schema: codeSchema });

  const isOtpSuccess = verifyOtp.isSuccess;

  const onSubmit = async ({ code }: OtpFormValues) => {
    try {
      await verifyOtp.mutateAsync({ email, code });
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to verify code.');
      showError(errorMessage);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isEmailLogin && !user?.id) {
      navigate({ to: ROUTES.AUTH.INDEX, replace: true });
      return;
    }

    if (isEmailLogin && isOtpSuccess) {
      if (hasPendingTwoFactor) {
        navigate({ to: ROUTES.AUTH.VERIFY2FA, replace: true });
      } else if (isAuthenticatedWith2FA) {
        navigate({ to: ROUTES.AUTH.CALLBACK, replace: true });
      }
      return;
    }

    if (isAuthenticatedWith2FA && !hasPendingTwoFactor && !isEmailLogin) {
      navigate({ to: ROUTES.AUTH.CALLBACK, replace: true });
    }
  }, [
    isAuthLoading,
    isEmailLogin,
    user?.id,
    hasPendingTwoFactor,
    isAuthenticatedWith2FA,
    isOtpSuccess,
    navigate,
  ]);

  const showOTPField = isEmailLogin && !isOtpSuccess;

  return {
    showOTPField,
    isAuthLoading,
    control,
    otpFormErrors,
    isOtpSubmitting: verifyOtp.isPending,
    handleOtpSubmit: handleSubmit(onSubmit),
  };
}
