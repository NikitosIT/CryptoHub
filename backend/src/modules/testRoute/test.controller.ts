import { Request, Response } from "express";

import {
  checkPinAttempts,
  registerFailedPin,
  resetPinAttempts,
} from "@/modules/testRoute/test.service.js";
import { prisma } from "@/shared/config/db.js";
import { AppError } from "@/shared/utils/AppError.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { TransfersBankSchema } from "@/shared/validators/validator.js";

export const transfers = asyncHandler(async (req: Request, res: Response) => {
  const { id, pin, amount, toUserId } = TransfersBankSchema.parse(req.body);

  if (id === toUserId) {
    throw new AppError("Cannot transfer to yourself");
  }

  const receiver = await prisma.userCard.findUnique({
    where: { id: toUserId },
  });

  if (!receiver) {
    throw new AppError("Receiver not found");
  }

  await prisma.$transaction(async (tx) => {
    const sender = await tx.userCard.findUnique({
      where: { id },
    });

    if (!sender) {
      throw new AppError("Sender not found");
    }

    await checkPinAttempts(id);

    if (pin !== sender.pin) {
      await registerFailedPin(id);
      throw new AppError("Invalid PIN");
    }

    await resetPinAttempts(id);

    if (sender.amount < amount) {
      throw new AppError("Insufficient funds");
    }

    await tx.userCard.update({
      where: { id },
      data: {
        amount: { decrement: amount },
      },
    });

    await tx.userCard.update({
      where: { id: toUserId },
      data: {
        amount: { increment: amount },
      },
    });
  });

  res.json({ message: "Transfer successful" });
});
