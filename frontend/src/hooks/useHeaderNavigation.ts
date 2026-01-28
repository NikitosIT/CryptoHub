import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";

import { api } from "@/api";
import { persister } from "@/main";
import { twoFactorStatusQueryKey } from "@/routes/auth/-api/use2faApi";

export function useHeaderNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isOnVerifyPage = location.pathname === "/auth/verify";
  const isOnVerify2FAPage = location.pathname === "/auth/verify-2fa";
  const isOnVerificationPage = isOnVerifyPage || isOnVerify2FAPage;

  const handleLoginClick = async (e: React.MouseEvent) => {
    if (isOnVerificationPage) {
      e.preventDefault();
      try {
        try {
          await api.twoFactor.clearVerification();
        } catch (clearError) {
          console.error("Failed to clear 2FA verification:", clearError);
        }

        void queryClient.invalidateQueries({
          queryKey: twoFactorStatusQueryKey(),
        });
        persister.removeClient();
        queryClient.clear();

        await api.auth.signOut();
      } catch (error) {
        console.error("Failed to clear session:", error);
      } finally {
        void navigate({ to: "/auth/", replace: true });
      }
    }
  };

  return {
    handleLoginClick,
    isOnVerifyPage,
    isOnVerificationPage,
  };
}
