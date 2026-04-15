import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";
import { isAuthError } from "@supabase/supabase-js";
import { TokenForecast } from "./useForecastMutations";

export interface ForecastsResponse {
  success: boolean;
  forecasts?: TokenForecast[];
  error?: string;
}

export const forecastsQueryKey = () => ["admin", "forecasts"] as const;

export function useForecasts(authorized: boolean, onUnauthorized?: () => void) {
  const handleAuthError = (error: unknown) => {
    if (isAuthError(error)) {
      onUnauthorized?.();
    }
  };

  const {
    data: forecasts = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: forecastsQueryKey(),
    queryFn: async () => {
      const response = await api.admin.forecasts.list();
      if (response.success && response.forecasts) {
        return response.forecasts;
      }
      throw new Error(response.error || "Failed to load forecasts");
    },
    enabled: authorized,
    retry: (_, err) => !isAuthError(err),
    throwOnError: (err) => {
      handleAuthError(err);
      return false;
    },
  });

  return {
    forecasts,
    loading,
    error: error ? (error as Error).message : null,
  };
}
