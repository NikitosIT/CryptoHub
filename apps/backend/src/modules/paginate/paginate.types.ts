export type PaginationArgs = {
  cursor?: { id: number };
  take: number;
  skip?: number;
};

export type PaginatedResult<TItem> = {
  data: TItem[];
  nextCursor: number | null;
};

export type PaginateParams<TItem extends { id: number }> = {
  query: (paginationArgs: PaginationArgs) => Promise<TItem[]>;
  cursor?: number;
  limit?: number;
};
