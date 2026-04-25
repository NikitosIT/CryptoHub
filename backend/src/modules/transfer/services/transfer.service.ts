import { prisma } from "@/libs/db.js";
import { AppError } from "@/utils/AppError.js";

import type { TransferInput } from "../transfer.schema.js";
import { invalidateBalanceCache } from "./cache.service.js";
import {
  checkPinAttempts,
  registerFailedPin,
  resetPinAttempts,
} from "./pin.service.js";

const transferFunds = async ({ id, pin, amount, toUserId }: TransferInput) => {
  await checkPinAttempts(id);

  await prisma.$transaction(async (tx) => {
    const [sender, receiver] = await Promise.all([
      tx.userCard.findUnique({ where: { id } }),
      tx.userCard.findUnique({ where: { id: toUserId } }),
    ]);

    if (!sender) throw new AppError("Sender not found", 404);
    if (!receiver) throw new AppError("Receiver not found", 404);

    if (sender.pin !== pin) {
      await registerFailedPin(id);
      throw new AppError("Invalid PIN", 400);
    }

    await resetPinAttempts(id);

    const updatedSender = await tx.userCard.updateMany({
      //updateMany возвращает результат count
      where: {
        id,
        amount: { gte: amount }, // gte “обнови только если баланс >= суммы перевода”
      },
      data: {
        amount: { decrement: amount },
      },
    });

    if (updatedSender.count === 0) {
      throw new AppError("Insufficient funds", 400);
    }

    await tx.userCard.update({
      where: { id: toUserId },
      data: {
        amount: { increment: amount },
      },
    });
  });

  await invalidateBalanceCache(id, toUserId);
};

export const transferService = {
  transferFunds,
} as const;
