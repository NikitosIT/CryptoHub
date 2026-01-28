import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { useSessionQuery } from "@/api/useSessionQuery";

export function useAdminAuth() {
  const sessionQuery = useSessionQuery();
  const session = sessionQuery.data;
  const authorized = Boolean(session?.user);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return api.auth.signOut();
    },
  });

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    authorized,
    logout,
    isLoading: sessionQuery.isLoading,
  };
}
