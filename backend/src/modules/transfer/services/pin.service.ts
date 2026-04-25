import { redis } from "@/libs/redis.js";
import { AppError } from "@/utils/AppError.js";

import { redisKeys } from "../redis-keys.js";

export const checkPinAttempts = async (cardId: string) => {
  const ttl = await redis.ttl(redisKeys.transfer.pinBlock(cardId));

  if (ttl > 0) {
    throw new AppError(`Too many attempts. Try again after ${ttl} seconds`);
  }
};

export const registerFailedPin = async (cardId: string) => {
  const attempts = await redis.incr(redisKeys.transfer.pinFail(cardId));

  if (attempts === 1) {
    await redis.expire(redisKeys.transfer.pinFail(cardId), 300);
  }

  if (attempts >= 3) {
    await redis.set(redisKeys.transfer.pinBlock(cardId), "blocked", {
      expiration: {
        type: "EX",
        value: 300,
      },
    });
    await redis.del(redisKeys.transfer.pinFail(cardId));
  }
};

export const resetPinAttempts = async (cardId: string) => {
  await redis.del(redisKeys.transfer.pinFail(cardId));
};
