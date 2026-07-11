import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes.js";

import { errorHandler } from "../../middleware/errorHandler.js";
import telegramPostsRouter from "./posts.route.js";

const { findManyMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
}));

vi.mock("@/libs/db.js", () => ({
  prisma: {
    telegramPost: {
      findMany: findManyMock,
    },
  },
}));

vi.mock("@/libs/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

const app = express();

app.use(express.json());
app.use(API_ROUTES.posts, telegramPostsRouter);
app.use(errorHandler);

describe("GET /api/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the first page when cursor is omitted", async () => {
    const data = Array.from({ length: 10 }, (_, index) => ({
      id: 10 - index,
      textCaption: `Post ${10 - index}`,
      textEntities: null,
      cryptoTokens: [`TOKEN_${10 - index}`],
      tgAuthorId: `author-${10 - index}`,
      mediaGroupId: null,
      media: null,
      likeCount: 0,
      dislikeCount: 0,
      favoritesCount: 0,
      commentsCount: 0,
      createdAt: new Date("2026-04-30T09:00:00.000Z").toISOString(),
    }));

    findManyMock.mockResolvedValue(data);

    const response = await request(app).get(API_ROUTES.posts);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data,
      nextCursor: 1,
    });
    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: { id: "desc" },
      take: 10,
    });
  });

  it("returns the next page when cursor is provided", async () => {
    const data = [
      {
        id: 4,
        textCaption: "Next page post",
        textEntities: null,
        cryptoTokens: ["TOKEN_4"],
        tgAuthorId: "author-4",
        mediaGroupId: null,
        media: null,
        likeCount: 0,
        dislikeCount: 0,
        favoritesCount: 0,
        commentsCount: 0,
        createdAt: new Date("2026-04-30T09:00:00.000Z").toISOString(),
      },
    ];

    findManyMock.mockResolvedValue(data);

    const response = await request(app).get(
      `${API_ROUTES.posts}?cursor=5`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data,
      nextCursor: null,
    });
    expect(findManyMock).toHaveBeenCalledWith({
      cursor: { id: 5 },
      orderBy: { id: "desc" },
      skip: 1,
      take: 10,
    });
  });

  it.each([
    "cursor=abc",
    "cursor=0",
    "cursor=-1",
    "cursor=1.5",
    "cursor=1&cursor=2",
    "cursor=1&page=2",
  ])("rejects invalid query: %s", async (query) => {
    const response = await request(app).get(
      `${API_ROUTES.posts}?${query}`,
    );
    const body = response.body as {
      issues: unknown[];
      message: string;
      status: string;
    };

    expect(response.status).toBe(400);
    expect(body.status).toBe("error");
    expect(body.message).toBe("Validation error");
    expect(body.issues).toBeInstanceOf(Array);
    expect(findManyMock).not.toHaveBeenCalled();
  });
});
