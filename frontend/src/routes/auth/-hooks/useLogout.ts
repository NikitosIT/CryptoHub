import { api } from "@/api";
import { useToast } from "@/hooks/useToast";
import { persister } from "@/main";
import { useTwoFactorStatus } from "@/routes/auth/-api/use2faApi";
import { getErrorMessage } from "@/utils/errorUtils";

import { useAuthState } from "./useAuthState";

export function useLogout() {
  const { showError } = useToast();
  const { user } = useAuthState();
  const { data: twoFactorStatus } = useTwoFactorStatus(user?.id);
  const isTwoFactorEnabled = twoFactorStatus?.enabled ?? false;

  const handleLogout = async () => {
    if (isTwoFactorEnabled) {
      try {
        await api.twoFactor.clearVerification();
      } catch (clearError) {
        console.error("Failed to clear 2FA verification:", clearError);
      }
    }

    try {
      await api.auth.signOut();
      localStorage.removeItem("user_profile_cache");
      persister.removeClient();
      window.location.href = "/auth/";
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to log out.");
      showError(errorMessage);
      setTimeout(() => {
        window.location.href = "/auth/";
      }, 1000);
    }
  };

  return { handleLogout };
}
