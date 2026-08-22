import { useQuery } from '@tanstack/react-query';

import { api } from '@/api';
import { useSelectedToken } from '@/store/useFiltersStore';

export type TokenForecast = {
  id?: number;
  token_name: string;
  forecast_text: string;
  sentiment: string;
};

export const forecastQueryKey = (tokenLabel?: string) =>
  ['forecast', tokenLabel] as const;

async function forecastGet(tokenLabel: string) {
  return api.tokens.getForecast(tokenLabel);
}

export function useTokensAiForecasts() {
  const { selectedToken } = useSelectedToken();
  return useQuery<TokenForecast | null>({
    queryKey: [...forecastQueryKey(selectedToken?.label), selectedToken],
    enabled: Boolean(selectedToken),
    async queryFn() {
      if (!selectedToken) return null;
      return forecastGet(selectedToken.label);
    },
  });
}
