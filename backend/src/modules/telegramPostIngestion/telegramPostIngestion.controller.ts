import type { Request, Response } from "express";

import { telegramPostIngestionService } from "./services/telegramPostIngestion.service.js";
import type { TelegramPostIngestionInput } from "./telegramPostIngestion.schema.js";

type TelegramPostIngestionRequest = Request<
  Record<string, never>,
  unknown,
  TelegramPostIngestionInput
>;

export const telegramPostIngestionController = {
  handle: async (
    req: TelegramPostIngestionRequest,
    res: Response,
  ): Promise<void> => {
    await telegramPostIngestionService.processUpdate(req.body);

    res.json({ message: "Post ingestion processed" });
  },
} as const;
