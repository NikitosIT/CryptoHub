export type PaginationArgs = {
  cursor?: { id: number };
  take: number;
  skip?: number;
};

export type PaginatedResult<TItem> = {
  data: TItem[];
  nextCursor: number | null;
};

export type PaginateParams<TArgs, TItem extends { id: number }> = {
  model: {
    findMany(args: TArgs): Promise<TItem[]>;
  };
  getArgs: (paginationArgs: PaginationArgs) => TArgs;
  cursor?: number;
  limit?: number;
};
