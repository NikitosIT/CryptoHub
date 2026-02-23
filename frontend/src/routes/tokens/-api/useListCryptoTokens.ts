import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';

export interface CryptoTokens {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
}

export const cryptoTokensQueryKey = () => ['crypto-tokens'] as const;

function cryptoTokenList(): Promise<CryptoTokens[]> {
  return api.tokens.crypto();
}

export const useListCryptoTokens = () => {
  return useQuery<CryptoTokens[]>({
    queryKey: cryptoTokensQueryKey(),
    queryFn: cryptoTokenList,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
