import { prisma } from "@/libs/db.js";

import type {
  Prisma,
  TelegramPost,
} from "../../../prisma/generated/prisma/client.js";
import { paginate } from "../paginate/paginate.service.js";
import type { PaginatedResult } from "../paginate/paginate.types.js";
import type { TelegramPostsQuery } from "./posts.schema.js";

export const telegramPostsService = {
  list: async ({ cursor }: TelegramPostsQuery = {}): Promise<
    PaginatedResult<TelegramPost>
  > =>
    paginate<Prisma.TelegramPostFindManyArgs, TelegramPost>({
      model: prisma.telegramPost,
      getArgs: (paginationArgs) =>
        ({
          ...paginationArgs,
          orderBy: { id: "desc" },
        }) satisfies Prisma.TelegramPostFindManyArgs,
      cursor,
    }),
};
