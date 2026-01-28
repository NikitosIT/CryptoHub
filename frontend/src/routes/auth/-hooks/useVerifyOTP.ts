import { useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { useToast } from "@/hooks/useToast";
import { codeSchema } from "@/lib/validatorSchemas";
import { useVerifyOtp } from "@/routes/auth/-api/signInWithOtp";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { getErrorMessage } from "@/utils/errorUtils";

import { useCodeForm } from "./useCodeForm";

type OtpFormValues = { code: string };

type VerifySearchParams = {
  redirectTo?: string;
  mode?: "email";
  email?: string;
};

export function useVerifyOTP() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const search = useSearch({ from: "/auth/verify" }) as VerifySearchParams;
  const email: string | null = search.email ?? null;
  const isEmailLogin = search.mode === "email" || Boolean(email);
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
      const errorMessage = getErrorMessage(err, "Failed to verify code.");
      showError(errorMessage);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isEmailLogin && !user?.id) {
      void navigate({ to: "/auth/", replace: true });
      return;
    }

    if (isEmailLogin && isOtpSuccess) {
      if (hasPendingTwoFactor) {
        void navigate({ to: "/auth/verify-2fa", replace: true });
      } else if (isAuthenticatedWith2FA) {
        void navigate({ to: "/auth/callback", replace: true });
      }
      return;
    }

    if (isAuthenticatedWith2FA && !hasPendingTwoFactor && !isEmailLogin) {
      void navigate({ to: "/auth/callback", replace: true });
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
