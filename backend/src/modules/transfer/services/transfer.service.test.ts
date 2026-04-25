import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/utils/AppError.js";

const {
  checkPinAttemptsMock,
  creditMock,
  debitIfEnoughMock,
  findCardsByIdsMock,
  invalidateCardBalanceCacheMock,
  registerFailedPinMock,
  resetPinAttemptsMock,
  transactionMock,
} = vi.hoisted(() => ({
  checkPinAttemptsMock: vi.fn(),
  creditMock: vi.fn(),
  debitIfEnoughMock: vi.fn(),
  findCardsByIdsMock: vi.fn(),
  invalidateCardBalanceCacheMock: vi.fn(),
  registerFailedPinMock: vi.fn(),
  resetPinAttemptsMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("@/libs/db.js", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

vi.mock("@/modules/cards/cards.service.js", () => ({
  cardsService: {
    credit: creditMock,
    debitIfEnough: debitIfEnoughMock,
    findCardsByIds: findCardsByIdsMock,
  },
}));

vi.mock("./card-balance-cache.service.js", () => ({
  invalidateCardBalanceCache: invalidateCardBalanceCacheMock,
}));

vi.mock("./pin.service.js", () => ({
  checkPinAttempts: checkPinAttemptsMock,
  registerFailedPin: registerFailedPinMock,
  resetPinAttempts: resetPinAttemptsMock,
}));

import { transferService } from "./transfer.service.js";

const senderCardId = "sender-card-id";
const receiverCardId = "receiver-card-id";

const input = {
  amount: 150,
  receiverCardId,
  senderCardId,
  senderCardPin: "1234",
} as const;

const tx = { userCard: {} };

const makeCard = (id: string, pin: string) => ({
  id,
  pin,
});

type TransactionCallback = (client: typeof tx) => Promise<unknown>;

describe("transferService.transferFunds", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    checkPinAttemptsMock.mockResolvedValue(undefined);
    creditMock.mockResolvedValue(undefined);
    debitIfEnoughMock.mockResolvedValue(true);
    findCardsByIdsMock.mockResolvedValue([
      makeCard(senderCardId, input.senderCardPin),
      makeCard(receiverCardId, "9999"),
    ]);
    invalidateCardBalanceCacheMock.mockResolvedValue(undefined);
    registerFailedPinMock.mockResolvedValue(undefined);
    resetPinAttemptsMock.mockResolvedValue(undefined);
    transactionMock.mockImplementation((callback: TransactionCallback) =>
      callback(tx),
    );
  });

  it("throws when the sender card does not exist", async () => {
    findCardsByIdsMock.mockResolvedValue([makeCard(receiverCardId, "9999")]);

    await expect(transferService.transferFunds(input)).rejects.toEqual(
      new AppError("Sender not found", 404),
    );

    expect(registerFailedPinMock).not.toHaveBeenCalled();
    expect(resetPinAttemptsMock).not.toHaveBeenCalled();
    expect(debitIfEnoughMock).not.toHaveBeenCalled();
    expect(creditMock).not.toHaveBeenCalled();
    expect(invalidateCardBalanceCacheMock).not.toHaveBeenCalled();
  });

  it("throws when the receiver card does not exist", async () => {
    findCardsByIdsMock.mockResolvedValue([
      makeCard(senderCardId, input.senderCardPin),
    ]);

    await expect(transferService.transferFunds(input)).rejects.toEqual(
      new AppError("Receiver not found", 404),
    );

    expect(registerFailedPinMock).not.toHaveBeenCalled();
    expect(resetPinAttemptsMock).not.toHaveBeenCalled();
    expect(debitIfEnoughMock).not.toHaveBeenCalled();
    expect(creditMock).not.toHaveBeenCalled();
    expect(invalidateCardBalanceCacheMock).not.toHaveBeenCalled();
  });

  it("registers a failed attempt when the sender PIN is invalid", async () => {
    findCardsByIdsMock.mockResolvedValue([
      makeCard(senderCardId, "0000"),
      makeCard(receiverCardId, "9999"),
    ]);

    await expect(transferService.transferFunds(input)).rejects.toEqual(
      new AppError("Invalid PIN", 400),
    );

    expect(registerFailedPinMock).toHaveBeenCalledWith(senderCardId);
    expect(resetPinAttemptsMock).not.toHaveBeenCalled();
    expect(debitIfEnoughMock).not.toHaveBeenCalled();
    expect(creditMock).not.toHaveBeenCalled();
    expect(invalidateCardBalanceCacheMock).not.toHaveBeenCalled();
  });

  it("throws when the sender has insufficient funds", async () => {
    debitIfEnoughMock.mockResolvedValue(false);

    await expect(transferService.transferFunds(input)).rejects.toEqual(
      new AppError("Insufficient funds", 400),
    );

    expect(resetPinAttemptsMock).toHaveBeenCalledWith(senderCardId);
    expect(debitIfEnoughMock).toHaveBeenCalledWith(
      tx,
      senderCardId,
      input.amount,
    );
    expect(creditMock).not.toHaveBeenCalled();
    expect(invalidateCardBalanceCacheMock).not.toHaveBeenCalled();
  });

  it("transfers funds and invalidates both card balance caches", async () => {
    await transferService.transferFunds(input);

    expect(checkPinAttemptsMock).toHaveBeenCalledWith(senderCardId);
    expect(findCardsByIdsMock).toHaveBeenCalledWith(
      tx,
      senderCardId,
      receiverCardId,
    );
    expect(resetPinAttemptsMock).toHaveBeenCalledWith(senderCardId);
    expect(debitIfEnoughMock).toHaveBeenCalledWith(
      tx,
      senderCardId,
      input.amount,
    );
    expect(creditMock).toHaveBeenCalledWith(tx, receiverCardId, input.amount);
    expect(invalidateCardBalanceCacheMock).toHaveBeenCalledWith(
      senderCardId,
      receiverCardId,
    );
    expect(registerFailedPinMock).not.toHaveBeenCalled();
  });
});
