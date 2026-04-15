import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";

import { isAuthError } from "../utils/utils";
import { forecastsQueryKey } from "./useForecasts";

export interface TokenForecast {
  id: number;
  token_name: string;
  forecast_text: string;
  sentiment: "positive" | "neutral" | "negative";
  source_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

type Status = "approved" | "rejected";
export function useForecastMutations(onUnauthorized?: () => void) {
  const queryClient = useQueryClient();

  const handleAuthError = (error: unknown) => {
    if (isAuthError(error)) {
      onUnauthorized?.();
    }
  };

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Status }) => {
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

  const statusLoadingId = statusMutation.isPending
    ? (statusMutation.variables?.id ?? null)
    : null;

  const textLoadingId = textMutation.isPending
    ? (textMutation.variables?.id ?? null)
    : null;

  const actionLoading = statusLoadingId ?? textLoadingId;

  const updateText = (id: number, text: string) =>
    textMutation.mutateAsync({ id, text });

  const updateStatus = (id: number, status: Status) =>
    statusMutation.mutateAsync({ id, status });

  return {
    updateStatus,
    updateText,
    actionLoading,
  };
}
