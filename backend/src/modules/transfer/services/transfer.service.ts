import { prisma } from "@/libs/db.js";
import { cardsService } from "@/modules/cards/cards.service.js";
import { AppError } from "@/utils/AppError.js";

import type { TransferInput } from "../transfer.schema.js";
import { invalidateCardBalanceCache } from "./card-balance-cache.service.js";
import {
  checkPinAttempts,
  registerFailedPin,
  resetPinAttempts,
} from "./pin.service.js";

const transferFunds = async ({
  senderCardId,
  senderCardPin,
  amount,
  receiverCardId,
}: TransferInput) => {
  await checkPinAttempts(senderCardId);

  await prisma.$transaction(async (tx) => {
    const cards = await cardsService.findCardsByIds(
      tx,
      senderCardId,
      receiverCardId,
    );
    const senderCard = cards.find((card) => card.id === senderCardId);
    const receiverCard = cards.find((card) => card.id === receiverCardId);

    if (!senderCard) throw new AppError("Sender not found", 404);
    if (!receiverCard) throw new AppError("Receiver not found", 404);

    if (senderCard.pin !== senderCardPin) {
      await registerFailedPin(senderCardId);
      throw new AppError("Invalid PIN", 400);
    }

    await resetPinAttempts(senderCardId);

    const senderDebited = await cardsService.debitIfEnough({
      tx,
      cardId: senderCardId,
      amount,
    });

    if (!senderDebited) {
      throw new AppError("Insufficient funds", 400);
    }

    await cardsService.credit({
      tx,
      cardId: receiverCardId,
      amount,
    });
  });

  await invalidateCardBalanceCache(senderCardId, receiverCardId);
};

export const transferService = {
  transferFunds,
} as const;
