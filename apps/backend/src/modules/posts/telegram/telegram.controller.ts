import { telegramPostIngestionService } from "./services/telegram.service.js";
import type {
  TelegramPostIngestionRequest,
  TelegramPostIngestionResponse,
} from "./telegram.types.js";

export const telegramPostIngestionController = {
  handle: async (
    req: TelegramPostIngestionRequest,
    res: TelegramPostIngestionResponse,
  ): Promise<void> => {
    await telegramPostIngestionService.createTelegramPost(req.body);

    res.json({ message: "Post ingestion processed" });
  },
} as const;
