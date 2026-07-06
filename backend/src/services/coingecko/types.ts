import type { Request, Response } from "express";

export type Cryptotoken = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number | null;
  total_volume: number;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  ath: number;
  ath_change_percentage: number | null;
  ath_date: string;
  atl: number;
  atl_change_percentage: number | null;
  atl_date: string;
  last_updated: string;
};

export type CryptotokensRequest = Request<
  Record<string, never>,
  Cryptotoken[],
  unknown,
  Record<string, never>
>;

export type CryptotokensResponse = Response<Cryptotoken[]>;
