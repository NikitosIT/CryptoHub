import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import type { TokenForecast } from "@/types/admins";

import { isAuthError } from "../utils/utils";
import { forecastsQueryKey } from "./useForecasts";

export function useForecastMutations(onUnauthorized?: () => void) {
  const queryClient = useQueryClient();

  const handleAuthError = (error: unknown) => {
    if (isAuthError(error)) {
      onUnauthorized?.();
    }
  };

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

  const actionLoading =
    (statusMutation.isPending && statusMutation.variables
      ? statusMutation.variables.id
      : null) ??
    (textMutation.isPending && textMutation.variables
      ? textMutation.variables.id
      : null);

  return {
    updateStatus: (id: number, status: "approved" | "rejected") =>
      statusMutation.mutateAsync({ id, status }),
    updateText: (id: number, text: string) =>
      textMutation.mutateAsync({ id, text }),
    actionLoading,
  };
}
