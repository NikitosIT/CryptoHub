import { beforeEach, describe, expect, it, vi } from "vitest";

import { paginate } from "./paginate.service.js";

type Post = {
  id: number;
  title: string;
};

type FindManyArgs = {
  orderBy: { id: "desc" };
  cursor?: { id: number };
  skip?: number;
  take?: number;
};

describe("paginate", () => {
  const findManyMock = vi.fn<(args?: FindManyArgs) => Promise<Post[]>>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the first page without cursor params", async () => {
    const data = [
      { id: 3, title: "Third" },
      { id: 2, title: "Second" },
    ];

    findManyMock.mockResolvedValue(data);

    const result = await paginate({
      model: { findMany: findManyMock },
      getArgs: (paginationArgs) => ({
        ...paginationArgs,
        orderBy: { id: "desc" },
      }),
      limit: 2,
    });

    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: { id: "desc" },
      take: 2,
    });
    expect(result).toEqual({
      data,
      nextCursor: 2,
    });
  });

  it("adds cursor and skip when requesting the next page", async () => {
    const data = [{ id: 1, title: "First" }];

    findManyMock.mockResolvedValue(data);

    const result = await paginate({
      model: { findMany: findManyMock },
      getArgs: (paginationArgs) => ({
        ...paginationArgs,
        orderBy: { id: "desc" },
      }),
      cursor: 2,
      limit: 2,
    });

    expect(findManyMock).toHaveBeenCalledWith({
      cursor: { id: 2 },
      orderBy: { id: "desc" },
      skip: 1,
      take: 2,
    });
    expect(result).toEqual({
      data,
      nextCursor: null,
    });
  });

  it("returns null nextCursor for an empty page and uses the default limit", async () => {
    findManyMock.mockResolvedValue([]);

    const result = await paginate({
      model: { findMany: findManyMock },
      getArgs: (paginationArgs) => ({
        ...paginationArgs,
        orderBy: { id: "desc" },
      }),
    });

    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: { id: "desc" },
      take: 10,
    });
    expect(result).toEqual({
      data: [],
      nextCursor: null,
    });
  });
});
