import { telegramPostsService } from "./telegramPosts.service.js";
import type {
  TelegramPostsRequest,
  TelegramPostsResponse,
} from "./telegramPosts.validation.js";

export const telegramPostsController = {
  list: async (
    _req: TelegramPostsRequest,
    res: TelegramPostsResponse,
  ): Promise<void> => {
    const data = await telegramPostsService.list(res.locals.telegramPostsQuery);

    res.json(data);
  },
};
