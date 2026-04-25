import { Request, Response } from "express";

import { transferService } from "./services/transfer.service.js";
import type { TransferInput } from "./transfer.schema.js";

type TransferRequest = Request<Record<string, never>, unknown, TransferInput>;

export const transferController = {
  send: async (req: TransferRequest, res: Response) => {
    await transferService.transferFunds(req.body);

    return res.json({ message: "Transfer successful" });
  },
} as const;
