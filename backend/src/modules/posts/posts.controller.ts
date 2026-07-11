import { telegramPostsService } from "./posts.service.js";
import type {
  TelegramPostsRequest,
  TelegramPostsResponse,
} from "./posts.types.js";

export const telegramPostsController = {
  list: async (
    _req: TelegramPostsRequest,
    res: TelegramPostsResponse,
  ): Promise<void> => {
    const data = await telegramPostsService.list(res.locals.query);

    res.json(data);
  },
};
