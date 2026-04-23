import { prisma } from "@/libs/db.js";
import { redis } from "@/libs/redis.js";
import { AppError } from "@/utils/AppError.js";

import type { TransferRequestBody } from "./test.validation.js";

const checkPinAttempts = async (userId: string) => {
  const blockKey = `pin:block:${userId}`;

  const ttl = await redis.ttl(blockKey);

  if (ttl > 0) {
    throw new AppError(`Too many attempts. Try again after ${ttl} seconds`);
  }
};

const registerFailedPin = async (userId: string) => {
  const blockKey = `pin:block:${userId}`;
  const failKey = `pin:fail:${userId}`;
  const attempts = await redis.incr(failKey);

  if (attempts === 1) {
    await redis.expire(failKey, 300);
  }

  if (attempts >= 3) {
    await redis.set(blockKey, "blocked", {
      expiration: {
        type: "EX",
        value: 300,
      },
    });
    await redis.del(failKey);
  }
};

const resetPinAttempts = async (userId: string) => {
  await redis.del(`pin:fail:${userId}`);
};

const invalidateBalanceCache = async (...userIds: string[]): Promise<void> => {
  if (userIds.length === 0) {
    return;
  }

  await redis.del(userIds.map((userId) => `balance${userId}`));
};

type TransferFunds = (payload: TransferRequestBody) => Promise<void>;

const transferFunds: TransferFunds = async ({
  id,
  pin,
  amount,
  toUserId,
}: TransferRequestBody) => {
  await checkPinAttempts(id);

  await prisma.$transaction(async (tx) => {
    const [sender, receiver] = await Promise.all([
      tx.userCard.findUnique({
        where: { id },
      }),
      tx.userCard.findUnique({
        where: { id: toUserId },
      }),
    ]);

    if (!sender) {
      throw new AppError("Sender not found", 404);
    }

    if (!receiver) {
      throw new AppError("Receiver not found", 404);
    }

    if (pin !== sender.pin) {
      await registerFailedPin(id);
      throw new AppError("Invalid PIN", 400);
    }

    await resetPinAttempts(id);

    if (sender.amount < amount) {
      throw new AppError("Insufficient funds", 400);
    }

    await Promise.all([
      tx.userCard.update({
        where: { id },
        data: {
          amount: { decrement: amount },
        },
      }),
      tx.userCard.update({
        where: { id: toUserId },
        data: {
          amount: { increment: amount },
        },
      }),
    ]);
  });

  await invalidateBalanceCache(id, toUserId);
};

export const testService = {
  checkPinAttempts,
  registerFailedPin,
  resetPinAttempts,
  transferFunds,
} as const;
