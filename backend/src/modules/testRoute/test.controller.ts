import { Request, Response } from "express";

import { asyncHandler } from "@/utils/asyncHandler.js";

import { testService } from "./test.service.js";
import type { TransferLocals } from "./test.validation.js";

const transfers = asyncHandler(async (_req: Request, res: Response) => {
  const { transferRequest } = res.locals as TransferLocals;

  await testService.transferFunds(transferRequest);

  res.json({ message: "Transfer successful" });
});

export const testController = {
  transfers,
} as const;
