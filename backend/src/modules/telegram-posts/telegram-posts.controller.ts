import { telegramPostsService } from "./telegram-posts.service.js";
import type {
  TelegramPostsRequest,
  TelegramPostsResponse,
} from "./telegram-posts.types.js";

export const telegramPostsController = {
  list: async (
    req: TelegramPostsRequest,
    res: TelegramPostsResponse,
  ): Promise<void> => {
    const data = await telegramPostsService.list(req.query);

    res.json(data);
  },
};
