import type { UserCard } from "prisma/generated/prisma/client.js";

import { type DbTransaction } from "@/libs/db.js";

type CardBalanceChangeInput = {
  tx: DbTransaction;
  cardId: string;
  amount: number;
};

const findCardsByIds = async (
  tx: DbTransaction,
  ...cardIds: string[]
): Promise<UserCard[]> => {
  return tx.userCard.findMany({
    where: {
      id: {
        in: cardIds,
      },
    },
  });
};

const debitIfEnough = async ({
  tx,
  cardId,
  amount,
}: CardBalanceChangeInput): Promise<boolean> => {
  const updatedCard = await tx.userCard.updateMany({
    where: {
      id: cardId,
      amount: { gte: amount },
    },
    data: {
      amount: { decrement: amount },
    },
  });

  return updatedCard.count > 0;
};

const credit = async ({
  tx,
  cardId,
  amount,
}: CardBalanceChangeInput): Promise<void> => {
  await tx.userCard.update({
    where: { id: cardId },
    data: {
      amount: { increment: amount },
    },
  });
};

export const cardsService = {
  findCardsByIds,
  debitIfEnough,
  credit,
} as const;
