import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";
import { useFiltersForMode } from "@/store/useFiltersStore";

export const forecastQueryKey = (tokenLabel?: string) =>
  ["forecast", tokenLabel] as const;

async function forecastGet(tokenLabel: string) {
  return await api.tokens.getForecast(tokenLabel);
}

export function useTokensAiForecasts() {
  const { selectedToken } = useFiltersForMode();
  return useQuery({
    queryKey: [...forecastQueryKey(selectedToken?.label), selectedToken],
    enabled: Boolean(selectedToken),
    queryFn: () => {
      if (!selectedToken) return Promise.resolve(null);
      return forecastGet(selectedToken.label);
    },
  });
}
