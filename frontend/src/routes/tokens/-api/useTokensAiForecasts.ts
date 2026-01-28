import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";
import { usePostsMode } from "@/routes/posts/-hooks/usePostsMode";
import { useFiltersForMode } from "@/store/useFiltersStore";
import type { PostMode } from "@/types/db";

export const forecastQueryKey = (mode: PostMode, tokenLabel?: string) =>
  ["forecast", mode, tokenLabel] as const;

async function forecastGet(tokenLabel: string) {
  return await api.tokens.getForecast(tokenLabel);
}

export function useTokensAiForecasts() {
  const { mode } = usePostsMode();
  const { selectedToken } = useFiltersForMode();
  return useQuery({
    queryKey: [...forecastQueryKey(mode, selectedToken?.label), selectedToken],
    enabled: Boolean(selectedToken),
    queryFn: () => {
      if (!selectedToken) return Promise.resolve(null);
      return forecastGet(selectedToken.label);
    },
  });
}
