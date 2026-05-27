import type {
  TelegramPostIngestionRequest,
  TelegramPostIngestionResponse,
} from "./ingestion.types.js";
import { telegramPostIngestionService } from "./services/ingestion.service.js";

export const telegramPostIngestionController = {
  handle: async (
    req: TelegramPostIngestionRequest,
    res: TelegramPostIngestionResponse,
  ): Promise<void> => {
    await telegramPostIngestionService.createTelegramPost(req.body);

    res.json({ message: "Post ingestion processed" });
  },
} as const;
