import { useQueryClient } from "@tanstack/react-query";

import { useUserProfile } from "@/routes/profile/-api/useUserProfile";
import { getCachedProfile } from "@/routes/profile/-utils/profileCache";

import { useAuthState } from "../routes/auth/-hooks/useAuthState";

export function useDisplayNickname() {
  const { isAuthenticatedWith2FA, isLoading } = useAuthState({
    checkTwoFactor: true,
  });

  const queryClient = useQueryClient();

  const { data: profile } = useUserProfile();

  const displayNickname =
    isLoading || !isAuthenticatedWith2FA
      ? null
      : profile?.nickname ||
        queryClient.getQueryData<{ nickname: string | null } | null>([
          "profile",
        ])?.nickname ||
        getCachedProfile()?.nickname ||
        "User";

  return {
    displayNickname,
  };
}
