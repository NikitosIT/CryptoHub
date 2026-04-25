import { redis } from "@/libs/redis.js";
import { AppError } from "@/utils/AppError.js";

import { redisKeys } from "../constants/redisKeys.js";

export const checkPinAttempts = async (userId: string) => {
  const ttl = await redis.ttl(redisKeys.pin.block(userId));

  if (ttl > 0) {
    throw new AppError(`Too many attempts. Try again after ${ttl} seconds`);
  }
};

export const registerFailedPin = async (userId: string) => {
  const attempts = await redis.incr(redisKeys.pin.fail(userId));

  if (attempts === 1) {
    await redis.expire(redisKeys.pin.fail(userId), 300);
  }

  if (attempts >= 3) {
    await redis.set(redisKeys.pin.block(userId), "blocked", {
      expiration: {
        type: "EX",
        value: 300,
      },
    });
    await redis.del(redisKeys.pin.fail(userId));
  }
};

export const resetPinAttempts = async (userId: string) => {
  await redis.del(redisKeys.pin.fail(userId));
};
