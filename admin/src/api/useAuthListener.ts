import { useEffect } from "react";

import { api } from "@/api";
import { queryClient } from "@/main";

import { sessionQueryKey } from "./useSessionQuery";

export function useAuthListener() {
  useEffect(() => {
    const subscription = api.auth.onStateChange((event, session) => {
      queryClient.setQueryData(sessionQueryKey(), session);

      if (event === "SIGNED_OUT") {
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
