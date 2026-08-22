import type {
  PaginatedResult,
  PaginateParams,
  PaginationArgs,
} from "./paginate.types.js";

export async function paginate<TItem extends { id: number }>({
  query,
  cursor,
  limit = 10,
}: PaginateParams<TItem>): Promise<PaginatedResult<TItem>> {
  const paginationArgs: PaginationArgs = {
    take: limit,
    ...(cursor !== undefined
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  };

  const data = await query(paginationArgs);
  const nextCursor = data.length === limit ? data[data.length - 1].id : null;

  return { data, nextCursor };
}
