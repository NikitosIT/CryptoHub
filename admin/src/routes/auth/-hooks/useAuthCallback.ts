import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useSessionQuery } from "@/routes/auth/-api/useSessionQuery";

export function useAuthCallback() {
  const navigate = useNavigate();
  const sessionQuery = useSessionQuery();
  const session = sessionQuery.data;
  const isLoading = sessionQuery.isLoading;

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      navigate({ to: "/auth/", replace: true });
      return;
    }

    navigate({ to: "/", replace: true });
  }, [session, isLoading, navigate]);

  return {
    isLoading,
  };
}
