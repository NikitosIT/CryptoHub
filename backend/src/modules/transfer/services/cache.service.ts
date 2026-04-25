import { redis } from "@/libs/redis.js";

import { redisKeys } from "../constants/redisKeys.js";

export const invalidateBalanceCache = async (
  ...userIds: string[]
): Promise<void> => {
  if (userIds.length === 0) {
    return;
  }

  await redis.del(userIds.map((userId) => redisKeys.user.balance(userId)));
};
