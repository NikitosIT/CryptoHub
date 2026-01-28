import { useToast } from "@/hooks/useToast";
import { useResendCode } from "@/routes/auth/-api/signInWithOtp";
import { getErrorMessage } from "@/utils/errorUtils";

interface UseResendEmailCodeOptions {
  onSuccess?: () => void;
}

export function useResendEmailCode(options: UseResendEmailCodeOptions = {}) {
  const { onSuccess } = options;
  const resendCode = useResendCode();
  const { showError, showSuccess } = useToast();

  const resend = async (email: string | null) => {
    if (!email) {
      showError("Email not found. Please try logging in again.");
      return;
    }

    try {
      await resendCode.mutateAsync(email);
      showSuccess("New code sent to email");
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        "Failed to send code. Please try again later."
      );
      showError(errorMessage);
    }
  };

  return {
    resend,
    isPending: resendCode.isPending,
  };
}
