import { Request, Response } from "express";

import { prisma } from "@/shared/config/db.js";
import { redis } from "@/shared/config/redis.js";
import { AppError } from "@/shared/utils/AppError.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { GetAmountSchema } from "@/shared/validators/validator.js";

export const getAmount = asyncHandler(async (req: Request, res: Response) => {
  const { id } = GetAmountSchema.parse(req.body);

  const cacheKey = `balance${id}`;

  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.json({ amount: `Your balance is ${cached}$ it is cache` });
  }

  const user = await prisma.userCard.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError("User not found");
  }

  await redis.set(cacheKey, user.amount.toString(), {
    expiration: {
      type: "EX",
      value: 60,
    },
  });

  res.json({ amount: `Your balance is ${user?.amount}$` });
});
