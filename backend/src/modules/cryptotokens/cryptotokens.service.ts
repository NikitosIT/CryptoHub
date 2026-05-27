import { externalApi } from "@/config/external-api.js";
import { redisKeys, TTL } from "@/redis/redis-keys.js";
import { AppError } from "@/utils/AppError.js";

import { cache } from "../../services/cache/cache.service.js";
import type { Cryptotoken } from "./cryptotokens.types.js";

const list = async (): Promise<Cryptotoken[]> => {
  const key = redisKeys.cryptotokens.list();
  const url = externalApi.coingecko.marketsUrl;

  const cached = await cache.get<Cryptotoken[]>(key);

  if (cached) {
    return cached;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new AppError("Failed to fetch", 500);
  }

  const data = (await response.json()) as Cryptotoken[];

  await cache.set(key, data, TTL.MEDIUM);

  return data;
};

export const cryptotokens = {
  list,
};
