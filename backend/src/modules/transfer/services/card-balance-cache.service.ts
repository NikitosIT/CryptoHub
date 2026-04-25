import { redis } from "@/libs/redis.js";

import { redisKeys } from "../redis-keys.js";

export const invalidateCardBalanceCache = async (
  ...cardIds: string[]
): Promise<void> => {
  if (cardIds.length === 0) {
    return;
  }

  await redis.del(cardIds.map((cardId) => redisKeys.card.balance(cardId)));
};
