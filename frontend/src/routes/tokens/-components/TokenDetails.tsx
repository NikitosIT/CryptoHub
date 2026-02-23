import { useMemo } from 'react';

import { useSelectedToken } from '@/store/useFiltersStore';

import { useListCryptoTokens } from '../-api/useListCryptoTokens';
import NoPostsTokenMessage from '../../posts/-components/NoPostsMessage';
import TokensAiForecasts from './TokensAiForecasts';
import { formatMarketCap, formatPrice } from '../-utils/tokensFormat';

export function TokenDetails() {
  const { selectedToken } = useSelectedToken();
  const { data: tokens } = useListCryptoTokens();

  const fullToken = useMemo(() => {
    if (!selectedToken || !tokens?.length) return null;
    return tokens.find((t) => t.symbol === selectedToken.value) ?? null;
  }, [selectedToken, tokens]);

  if (!selectedToken) return null;

  return (
    <div className="flex flex-col items-center w-full mt-3 text-xs text-gray-300 transition-all duration-300 sm:mt-4 sm:text-sm">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[#111] rounded-xl sm:rounded-2xl shadow-md border border-gray-800 w-full max-w-2xl">
        {fullToken ? (
          <div className="flex flex-wrap items-center justify-center w-full gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <img
                src={fullToken.image}
                alt={fullToken.name}
                className="object-contain w-10 h-10 bg-black rounded-full sm:w-12 sm:h-12"
              />
              <div>
                <p className="font-semibold text-white">{fullToken.name}</p>
                <p className="text-gray-400 uppercase">{fullToken.symbol}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-gray-300 sm:gap-6">
              <div>
                <p className="text-gray-500">Price</p>
                <p className="font-medium text-white">
                  {formatPrice(fullToken.current_price)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Rank</p>
                <p className="font-medium text-white">#{fullToken.market_cap_rank}</p>
              </div>
              <div>
                <p className="text-gray-500">Market cap</p>
                <p className="font-medium text-white">
                  {formatMarketCap(fullToken.market_cap)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <img
              src={selectedToken.imageUrl}
              alt={selectedToken.label}
              className="object-contain w-10 h-10 bg-black rounded-full sm:w-12 sm:h-12"
            />
            <div>
              <p className="font-semibold text-white">{selectedToken.label}</p>
              <p className="text-gray-400 uppercase">{selectedToken.value}</p>
            </div>
          </div>
        )}

        <TokensAiForecasts />
      </div>

      <NoPostsTokenMessage />
    </div>
  );
}
