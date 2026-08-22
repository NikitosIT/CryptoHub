import type { Cryptotoken } from "@/services/coingecko/coingecko.types.js";

export const mapCryptotokenToSnapshotCreateInput = (
  token: Cryptotoken,
  snapshotAt: Date,
) => ({
  coinGeckoId: token.id,
  symbol: token.symbol,
  name: token.name,
  image: token.image,
  currentPrice: token.current_price,
  marketCap: BigInt(Math.trunc(token.market_cap)),
  marketCapRank: token.market_cap_rank,
  totalVolume: BigInt(Math.trunc(token.total_volume)),
  high24h: token.high_24h,
  low24h: token.low_24h,
  priceChange24h: token.price_change_24h,
  priceChangePercentage24h: token.price_change_percentage_24h,
  marketCapChange24h: token.market_cap_change_24h,
  marketCapChangePercentage: token.market_cap_change_percentage_24h,
  ath: token.ath,
  athChangePercentage: token.ath_change_percentage,
  athDate: new Date(token.ath_date),
  atl: token.atl,
  atlChangePercentage: token.atl_change_percentage,
  atlDate: new Date(token.atl_date),
  lastUpdated: new Date(token.last_updated),
  snapshotAt,
});
