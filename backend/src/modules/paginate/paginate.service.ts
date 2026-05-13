import type {
  PaginatedResult,
  PaginateParams,
  PaginationArgs,
} from "./paginate.types.js";

export async function paginate<TArgs, TItem extends { id: number }>({
  model,
  getArgs,
  cursor,
  limit = 10,
}: PaginateParams<TArgs, TItem>): Promise<PaginatedResult<TItem>> {
  const paginationArgs: PaginationArgs = {
    take: limit,
    ...(cursor !== undefined
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  };

  const data = await model.findMany(getArgs(paginationArgs));
  const nextCursor = data.length === limit ? data[data.length - 1].id : null;

  return { data, nextCursor };
}
