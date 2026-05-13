import { telegramPostIngestionService } from "./services/telegram-post-ingestion.service.js";
import type {
  TelegramPostIngestionRequest,
  TelegramPostIngestionResponse,
} from "./telegram-post-ingestion.types.js";

export const telegramPostIngestionController = {
  handle: async (
    req: TelegramPostIngestionRequest,
    res: TelegramPostIngestionResponse,
  ): Promise<void> => {
    await telegramPostIngestionService.processUpdate(req.body);

    res.json({ message: "Post ingestion processed" });
  },
} as const;
