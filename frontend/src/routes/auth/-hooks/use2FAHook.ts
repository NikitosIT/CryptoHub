import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { twoFactorCodeSchema } from "@/lib/validatorSchemas";
import {
  useDisableTwoFactor,
  useRequestTwoFactor,
  useTwoFactorStatus,
  useVerifyTwoFactorLogin,
  useVerifyTwoFactorSetup,
} from "@/routes/auth/-api/use2faApi";
import { useAuthState } from "@/routes/auth/-hooks/useAuthState";
import { useCodeForm } from "@/routes/auth/-hooks/useCodeForm";
import { getErrorMessage } from "@/utils/errorUtils";

type CodeForm = { code: string };

export function useTwoFactorHook() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [disableMode, setDisableMode] = useState(false);

  const { user } = useAuthState({ checkTwoFactor: true });
  const { data: twoFactorStatus, isLoading } = useTwoFactorStatus(user?.id);

  const requestTwoFactor = useRequestTwoFactor();
  const verifySetup = useVerifyTwoFactorSetup();
  const disableTwoFactor = useDisableTwoFactor();

  const { control, codeFormErrors, handleSubmit, setError, reset } =
    useCodeForm({
      schema: twoFactorCodeSchema,
    });

  const resetState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    reset();
  };

  const withUserId = async (
    action: (uid: string) => Promise<void>,
    fallbackError: string,
  ) => {
    if (!user?.id) {
      setError("code", { type: "server", message: "Authentication error" });
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await action(user.id);
    } catch (err) {
      setError("code", {
        type: "server",
        message: getErrorMessage(err, fallbackError),
      });
    }
  };

  const handleStartSetup = async () => {
    resetState();
    setDisableMode(false);
    try {
      const data = await requestTwoFactor.mutateAsync();
      setQrUrl(data.qrUrl);
    } catch (err) {
      setErrorMessage(
        getErrorMessage(err, "Failed to get QR code. Please try again."),
      );
    }
  };

  const handleConfirmSetup = ({ code }: CodeForm) =>
    withUserId(async (uid) => {
      await verifySetup.mutateAsync({ code: code.trim(), userId: uid });
      setSuccessMessage("2FA successfully enabled!");
      setQrUrl(null);
      reset();
    }, "Code didn't match. Please try again.");

  const handleDisableSubmit = ({ code }: CodeForm) =>
    withUserId(async (uid) => {
      await disableTwoFactor.mutateAsync({ code: code.trim(), userId: uid });
      setSuccessMessage("2FA disabled.");
      setDisableMode(false);
      reset();
    }, "Failed to disable 2FA.");

  return {
    qrUrl,
    control,
    codeFormErrors,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    disableMode,
    isLoading,
    isTwoFactorEnabled: twoFactorStatus?.enabled ?? false,
    handleStartSetup,
    handleConfirmSetup: handleSubmit(handleConfirmSetup),
    handleDisableSubmit: handleSubmit(handleDisableSubmit),
    handleEnableDisableMode: () => {
      resetState();
      setDisableMode(true);
    },
    handleCancelDisable: () => {
      resetState();
      setDisableMode(false);
    },
    isRequesting: requestTwoFactor.isPending,
    isVerifying: verifySetup.isPending,
    isDisabling: disableTwoFactor.isPending,
  };
}

export function useVerify2FA() {
  const navigate = useNavigate();
  const { isLoading: isAuthLoading, user } = useAuthState({
    checkTwoFactor: true,
  });
  const verifyMutation = useVerifyTwoFactorLogin();

  const { control, codeFormErrors, codeValue, handleSubmit, setError } =
    useCodeForm({
      schema: twoFactorCodeSchema,
    });

  const onSubmit = async ({ code }: CodeForm) => {
    if (!user?.id) {
      setError("code", {
        type: "server",
        message: "Authentication error. Please try again.",
      });
      return;
    }

    try {
      await verifyMutation.mutateAsync({ code, userId: user.id });
      void navigate({ to: "/auth/callback", replace: true });
    } catch (err) {
      const remaining = (err as { remainingAttempts?: number })
        .remainingAttempts;
      const message =
        remaining !== undefined
          ? remaining > 0
            ? `Invalid code. ${remaining} attempts remaining.`
            : "Invalid code. Attempts exhausted."
          : getErrorMessage(err, "Failed to verify code.");
      setError("code", { type: "server", message });
    }
  };

  return {
    control,
    twoFAFormErrors: codeFormErrors,
    isAuthLoading,
    handle2FASubmit: handleSubmit(onSubmit),
    is2FASubmitting: verifyMutation.isPending,
    isCodeValid: codeValue.trim().length === 6,
  };
}
