import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import type { TokenForecast } from "@/types/admins";

export const forecastsQueryKey = () => ["admin", "forecasts"] as const;

const isAuthError = (error: unknown): boolean =>
  error instanceof Error &&
  (error.message.includes("Authentication required") ||
    error.message.includes("Unauthorized"));

export function useForecasts(authorized: boolean, onUnauthorized?: () => void) {
  const queryClient = useQueryClient();

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

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "approved" | "rejected";
    }) => {
      await api.admin.forecasts.updateStatus(id, status);
      return { id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<TokenForecast[]>(forecastsQueryKey(), (old) =>
        old?.filter((f) => f.id !== data.id),
      );
    },
    onError: handleAuthError,
  });

  const textMutation = useMutation({
    mutationFn: async ({ id, text }: { id: number; text: string }) => {
      await api.admin.forecasts.updateText(id, text);
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<TokenForecast[]>(forecastsQueryKey(), (old) =>
        old?.map((f) =>
          f.id === variables.id ? { ...f, forecast_text: variables.text } : f,
        ),
      );
    },
    onError: handleAuthError,
  });

  return {
    forecasts,
    loading,
    actionLoading:
      statusMutation.isPending && statusMutation.variables
        ? statusMutation.variables.id
        : textMutation.isPending && textMutation.variables
          ? textMutation.variables.id
          : null,
    error: error ? (error as Error).message : null,
    updateStatus: (id: number, status: "approved" | "rejected") =>
      statusMutation.mutateAsync({ id, status }),
    updateText: (id: number, text: string) =>
      textMutation.mutateAsync({ id, text }),
  };
}
